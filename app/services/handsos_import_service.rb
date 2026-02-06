# frozen_string_literal: true

require "nokogiri"
require "digest"

# Imports historical sales data from HandSOS (Korean beauty salon POS) XLS exports.
#
# HandSOS exports HTML tables disguised as .xls files, encoded in EUC-KR.
# The 4th table (index 3) contains the actual transaction data.
#
# Usage:
#   result = HandsosImportService.new(file_path, store: store).call
#   result.visits_created   # => 42
#   result.errors           # => ["Row 15: ..."]
class HandsosImportService
  Result = Struct.new(
    :visits_created, :visits_skipped, :customers_created,
    :services_created, :prepaid_created, :errors,
    keyword_init: true
  )

  TRANSACTION_CATEGORIES = %w[시술 점판 외상].freeze
  PREPAID_CATEGORIES     = %w[정액 회원].freeze

  GENDER_MAP = { "남" => "male", "여" => "female" }.freeze

  # Column indices for the HandSOS HTML table (0-indexed)
  COL = {
    datetime:        0,
    customer_name:   1,
    gender:          2,
    category:        3,  # 구분: 시술/점판/정액/회원/외상
    menu:            4,  # service_category name
    detail_menu:     5,  # service name
    qty:             6,
    staff:           7,
    list_unit_price: 8,  # 판매가 (comma-formatted)
    discount_rate:   9,
    discount_amount: 10,
    event_name:      11,
    paid_amount:     12, # 결제액
    cash:            13,
    card:            15,
    bank:            16,
    pay:             18,
    other:           19,
    prepaid:         20,
    membership:      21,
    credit:          22,
    visit_type:      25,
    memo:            28
  }.freeze

  PAYMENT_COLUMNS = {
    "cash"    => COL[:cash],
    "card"    => COL[:card],
    "bank"    => COL[:bank],
    "pay"     => COL[:pay],
    "other"   => COL[:other],
    "prepaid" => nil, # special: sum of prepaid + membership columns
    "credit"  => COL[:credit]
  }.freeze

  def initialize(file_path, store:)
    @file_path = file_path
    @store = store
    @counters = { visits_created: 0, visits_skipped: 0, customers_created: 0,
                  services_created: 0, prepaid_created: 0 }
    @errors = []
    @master_cache = { customers: {}, staff: {}, categories: {}, services: {} }
  end

  def call
    validate_file!
    rows = parse_rows

    transaction_rows, prepaid_rows = partition_rows(rows)
    import_transaction_rows(transaction_rows)
    import_prepaid_rows(prepaid_rows)

    build_result
  end

  private

  attr_reader :file_path, :store

  # --- File parsing -----------------------------------------------------------

  def validate_file!
    raise ArgumentError, "File not found: #{file_path}" unless File.exist?(file_path)
  end

  def parse_rows
    raw_html = File.read(file_path, encoding: "EUC-KR:UTF-8", invalid: :replace, undef: :replace)
    doc = Nokogiri::HTML(raw_html)
    tables = doc.css("table")

    raise ArgumentError, "Expected at least 4 tables, found #{tables.size}" if tables.size < 4

    data_table = tables[3]
    rows = data_table.css("tr")

    # Skip header row (first row)
    rows.drop(1).filter_map { |tr| parse_row(tr) }
  end

  def parse_row(tr)
    cells = tr.css("td").map { |td| td.text.strip }
    return nil if cells.empty? || cells.all?(&:blank?)

    cells
  end

  # --- Date and number parsing ------------------------------------------------

  def parse_datetime(raw)
    return nil if raw.blank?

    cleaned = raw.gsub(/[\r\n\t]+/, " ").strip
    # Format: "YY-MM-DD HH:MM" - find the last space to split date and time
    parts = cleaned.split(/\s+/)
    return nil if parts.empty?

    date_str = parts.first
    time_str = parts.last if parts.size > 1

    # Convert "YY-MM-DD" to "20YY-MM-DD"
    full_date = date_str.match?(/^\d{2}-/) ? "20#{date_str}" : date_str

    datetime_str = time_str.present? ? "#{full_date} #{time_str}" : full_date

    Time.zone.parse(datetime_str)
  rescue ArgumentError, TypeError
    nil
  end

  def parse_number(raw)
    return 0 if raw.blank?

    raw.to_s.gsub(/[,\s]/, "").to_i
  end

  def parse_decimal(raw)
    return BigDecimal("0") if raw.blank?

    BigDecimal(raw.to_s.gsub(/[,\s]/, ""))
  rescue ArgumentError
    BigDecimal("0")
  end

  # --- Row classification -----------------------------------------------------

  def partition_rows(rows)
    transaction_rows = []
    prepaid_rows = []

    rows.each do |cells|
      category = cells[COL[:category]].to_s.strip
      if TRANSACTION_CATEGORIES.include?(category)
        transaction_rows << cells
      elsif PREPAID_CATEGORIES.include?(category)
        prepaid_rows << cells
      end
    end

    [ transaction_rows, prepaid_rows ]
  end

  # --- Transaction import -----------------------------------------------------

  def import_transaction_rows(rows)
    groups = group_transaction_rows(rows)

    groups.each do |group_key, group_rows|
      import_visit_group(group_key, group_rows)
    end
  end

  def group_transaction_rows(rows)
    rows.group_by do |cells|
      dt = parse_datetime(cells[COL[:datetime]])
      customer_name = cells[COL[:customer_name]].to_s.strip
      date_part = dt&.strftime("%Y-%m-%d")
      time_part = dt&.strftime("%H:%M")

      [ customer_name, date_part, time_part ]
    end
  end

  def import_visit_group(group_key, group_rows)
    customer_name, _date, _time = group_key
    return if customer_name.blank?

    external_hash = compute_external_hash(group_key, group_rows)

    # Idempotency: skip if visit already imported
    if Visit.find_by(external_hash: external_hash)
      @counters[:visits_skipped] += 1
      return
    end

    ActiveRecord::Base.transaction do
      visited_at = parse_datetime(group_rows.first[COL[:datetime]])
      return if visited_at.nil?

      customer = find_or_create_customer(group_rows.first)
      visit = create_visit(customer, visited_at, external_hash, group_rows)
      create_line_items(visit, group_rows)
      create_aggregated_payments(visit, group_rows)

      # Trigger calculate_totals callback
      visit.save!
      @counters[:visits_created] += 1
    end
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    @errors << "Visit [#{group_key.join(', ')}]: #{e.message}"
  rescue StandardError => e
    @errors << "Visit [#{group_key.join(', ')}]: #{e.class} - #{e.message}"
  end

  def compute_external_hash(group_key, group_rows)
    customer_name, date_part, time_part = group_key
    items_digest = group_rows.map { |cells|
      detail = cells[COL[:detail_menu]].to_s.strip
      amount = parse_number(cells[COL[:paid_amount]])
      "#{detail}:#{amount}"
    }.sort.join(",")

    Digest::SHA256.hexdigest("#{date_part}|#{time_part}|#{customer_name}|#{items_digest}")
  end

  def create_visit(customer, visited_at, external_hash, group_rows)
    visit_type_korean = group_rows.first[COL[:visit_type]].to_s.strip
    memo = collect_memos(group_rows)

    Visit.new(
      store: store,
      customer: customer,
      visited_at: visited_at,
      status: "finalized",
      source: "handsos",
      external_hash: external_hash,
      visit_type: Visit::VISIT_TYPE_MAP[visit_type_korean],
      memo: memo.presence
    )
  end

  def collect_memos(group_rows)
    group_rows
      .map { |cells| cells[COL[:memo]].to_s.strip }
      .reject(&:blank?)
      .uniq
      .join("\n")
  end

  # --- SaleLineItem creation --------------------------------------------------

  def create_line_items(visit, group_rows)
    group_rows.each do |cells|
      create_single_line_item(visit, cells)
    end
  end

  def create_single_line_item(visit, cells)
    category = cells[COL[:category]].to_s.strip
    menu_name = cells[COL[:menu]].to_s.strip
    detail_name = cells[COL[:detail_menu]].to_s.strip
    staff_name = cells[COL[:staff]].to_s.strip
    qty = [ parse_number(cells[COL[:qty]]), 1 ].max
    list_unit_price = [ parse_number(cells[COL[:list_unit_price]]), 0 ].max
    discount_rate = parse_decimal(cells[COL[:discount_rate]])
    discount_amount = [ parse_number(cells[COL[:discount_amount]]), 0 ].max
    net_total = [ parse_number(cells[COL[:paid_amount]]), 0 ].max
    event_name = cells[COL[:event_name]].to_s.strip

    # All items use item_type "service" to satisfy the item_reference_present validation.
    # For "점판" items we create a Service under a "점판" category.
    service = find_or_create_service(category, menu_name, detail_name, list_unit_price)
    return unless service

    staff = find_or_create_staff(staff_name)
    net_unit_price = calculate_net_unit_price(list_unit_price, discount_rate, discount_amount, net_total, qty)

    visit.sale_line_items.build(
      store: store,
      item_type: "service",
      service: service,
      staff: staff,
      qty: qty,
      list_unit_price: list_unit_price,
      discount_rate: discount_rate,
      discount_amount: discount_amount,
      net_unit_price: net_unit_price,
      net_total: net_total,
      event_name: event_name.presence
    )
  end

  def calculate_net_unit_price(list_unit_price, discount_rate, discount_amount, net_total, qty)
    if discount_rate > 0
      (list_unit_price * (100 - discount_rate) / 100).to_i
    elsif discount_amount > 0
      list_unit_price - discount_amount
    elsif qty > 0
      net_total / qty
    else
      list_unit_price
    end
  end

  # --- Payment creation -------------------------------------------------------

  def create_aggregated_payments(visit, group_rows)
    payment_sums = Hash.new(0)

    group_rows.each do |cells|
      payment_sums["cash"]   += parse_number(cells[COL[:cash]])
      payment_sums["card"]   += parse_number(cells[COL[:card]])
      payment_sums["bank"]   += parse_number(cells[COL[:bank]])
      payment_sums["pay"]    += parse_number(cells[COL[:pay]])
      payment_sums["other"]  += parse_number(cells[COL[:other]])
      payment_sums["credit"] += parse_number(cells[COL[:credit]])

      # Combine prepaid (정액) and membership (회원권) into a single "prepaid" method
      prepaid_amount = parse_number(cells[COL[:prepaid]]) + parse_number(cells[COL[:membership]])
      payment_sums["prepaid"] += prepaid_amount
    end

    payment_sums.each do |method, amount|
      next unless amount > 0

      visit.payments.build(
        store: store,
        method: method,
        amount: amount
      )
    end
  end

  # --- Prepaid row import -----------------------------------------------------

  def import_prepaid_rows(rows)
    rows.each do |cells|
      import_single_prepaid(cells)
    end
  end

  def import_single_prepaid(cells)
    customer_name = cells[COL[:customer_name]].to_s.strip
    return if customer_name.blank?

    detail_name = cells[COL[:detail_menu]].to_s.strip
    return if detail_name.blank?

    list_price = parse_number(cells[COL[:list_unit_price]])
    paid_amount = parse_number(cells[COL[:paid_amount]])
    return if paid_amount <= 0

    visited_at = parse_datetime(cells[COL[:datetime]])
    return if visited_at.nil?

    customer = find_or_create_customer(cells)
    staff = find_or_create_staff(cells[COL[:staff]].to_s.strip)

    plan = find_or_create_prepaid_plan(detail_name, list_price, paid_amount)
    create_prepaid_sale(customer, plan, staff, paid_amount, list_price, visited_at)
    create_prepaid_visit(customer, cells, visited_at)

    @counters[:prepaid_created] += 1
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    @errors << "Prepaid [#{cells[COL[:customer_name]]}, #{cells[COL[:detail_menu]]}]: #{e.message}"
  rescue StandardError => e
    @errors << "Prepaid [#{cells[COL[:customer_name]]}, #{cells[COL[:detail_menu]]}]: #{e.class} - #{e.message}"
  end

  def find_or_create_prepaid_plan(name, list_price, paid_amount)
    value = [ list_price, paid_amount ].max
    value = paid_amount if value <= 0

    PrepaidPlan.find_or_create_by!(store: store, name: name) do |plan|
      plan.price_paid = [ paid_amount, 1 ].max
      plan.value_amount = [ value, 1 ].max
      plan.active = true
    end
  end

  def create_prepaid_sale(customer, plan, staff, amount_paid, value_amount, sold_at)
    effective_value = value_amount > 0 ? value_amount : amount_paid

    PrepaidSale.create!(
      store: store,
      customer: customer,
      prepaid_plan: plan,
      seller_staff: staff,
      amount_paid: amount_paid,
      value_amount: [ effective_value, 1 ].max,
      sold_at: sold_at
    )
  end

  def create_prepaid_visit(customer, cells, visited_at)
    detail_name = cells[COL[:detail_menu]].to_s.strip
    paid_amount = parse_number(cells[COL[:paid_amount]])

    external_hash = Digest::SHA256.hexdigest(
      "prepaid|#{visited_at.strftime('%Y-%m-%d')}|#{visited_at.strftime('%H:%M')}|" \
      "#{customer.name}|#{detail_name}:#{paid_amount}"
    )

    return if Visit.find_by(external_hash: external_hash)

    visit = Visit.new(
      store: store,
      customer: customer,
      visited_at: visited_at,
      status: "finalized",
      source: "handsos",
      external_hash: external_hash,
      memo: "정액/회원권 구매: #{detail_name}"
    )

    # Create payment records for the prepaid purchase
    build_prepaid_visit_payments(visit, cells)

    visit.save!
    @counters[:visits_created] += 1
  end

  def build_prepaid_visit_payments(visit, cells)
    {
      "cash"   => parse_number(cells[COL[:cash]]),
      "card"   => parse_number(cells[COL[:card]]),
      "bank"   => parse_number(cells[COL[:bank]]),
      "pay"    => parse_number(cells[COL[:pay]]),
      "other"  => parse_number(cells[COL[:other]]),
      "credit" => parse_number(cells[COL[:credit]])
    }.each do |method, amount|
      next unless amount > 0

      visit.payments.build(store: store, method: method, amount: amount)
    end
  end

  # --- Master data find/create ------------------------------------------------

  def find_or_create_customer(cells)
    name = cells[COL[:customer_name]].to_s.strip
    gender_korean = cells[COL[:gender]].to_s.strip
    gender = GENDER_MAP[gender_korean]

    cache_key = name
    return @master_cache[:customers][cache_key] if @master_cache[:customers].key?(cache_key)

    customer = Customer.find_or_initialize_by(store: store, name: name)
    newly_created = customer.new_record?
    customer.gender = gender if gender.present?
    customer.save!

    @counters[:customers_created] += 1 if newly_created
    @master_cache[:customers][cache_key] = customer
  end

  def find_or_create_staff(name)
    return nil if name.blank?

    cache_key = name
    return @master_cache[:staff][cache_key] if @master_cache[:staff].key?(cache_key)

    staff = StaffMember.find_or_create_by!(store: store, name: name) do |s|
      s.role_title = "디자이너"
      s.active = true
    end

    @master_cache[:staff][cache_key] = staff
  end

  def find_or_create_service_category(name)
    return nil if name.blank?

    cache_key = name
    return @master_cache[:categories][cache_key] if @master_cache[:categories].key?(cache_key)

    category = ServiceCategory.find_or_create_by!(store: store, name: name)
    @master_cache[:categories][cache_key] = category
  end

  def find_or_create_service(category_label, menu_name, detail_name, list_price)
    return nil if detail_name.blank?

    # For "점판" items, use "점판" as the category if menu_name is blank
    effective_menu = menu_name.presence || category_label
    cache_key = "#{effective_menu}|#{detail_name}"
    return @master_cache[:services][cache_key] if @master_cache[:services].key?(cache_key)

    category = find_or_create_service_category(effective_menu)
    return nil unless category

    service = Service.find_or_initialize_by(store: store, service_category: category, name: detail_name)
    newly_created = service.new_record?

    if newly_created
      service.list_price = [ list_price, 0 ].max
      service.active = true
      service.save!
      @counters[:services_created] += 1
    end

    @master_cache[:services][cache_key] = service
  end

  # --- Result -----------------------------------------------------------------

  def build_result
    Result.new(
      visits_created: @counters[:visits_created],
      visits_skipped: @counters[:visits_skipped],
      customers_created: @counters[:customers_created],
      services_created: @counters[:services_created],
      prepaid_created: @counters[:prepaid_created],
      errors: @errors
    )
  end
end
