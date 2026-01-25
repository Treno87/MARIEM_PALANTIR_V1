# frozen_string_literal: true

module ExcelImport
  class VisitImporter < BaseImporter
    COLUMN_INDICES = {
      customer_name: 2,   # 고객명
      gender: 3,          # 성별
      category: 4,        # 구분
      menu: 5,            # 메뉴
      detail_menu: 6,     # 상세메뉴
      qty: 7,             # 수량
      staff: 8,           # 담당
      price: 9,           # 판매가
      discount_rate: 10,  # 할인율
      discount_amount: 11, # 할인액
      net_total: 13,      # 결제액
      cash: 14,           # 현금
      card: 16,           # 카드
      bank: 17,           # 통장
      pay: 19,            # Pay
      other: 20,          # 기타
      prepaid: 21,        # 정액
      membership: 22,     # 회원권
      credit: 23,         # 외상
      points: 24,         # 결제P
      visit_type: 26,     # 방문
      memo: 29,           # 메모
      visit_date: 30      # 방문일자
    }.freeze

    PAYMENT_METHODS = {
      cash: 14,
      card: 16,
      bank: 17,
      pay: 19,
      other: 20,
      prepaid: 21,
      credit: 23,
      points: 24
    }.freeze

    protected

    def process_rows
      visits_cache = {}

      processable_rows.each do |row|
        increment_processed

        visit = find_or_create_visit(row, visits_cache)
        next unless visit

        create_sale_line_item(row, visit)
        create_payments(row, visit)
        create_prepaid_usage(row, visit)

        increment_created
      end

      update_visit_totals(visits_cache.values)
    end

    private

    def processable_rows
      data_rows.select do |row|
        category = row[COLUMN_INDICES[:category]]
        %w[시술 점판].include?(category)
      end
    end

    def find_or_create_visit(row, cache)
      customer_name = row[COLUMN_INDICES[:customer_name]]
      visit_date = parse_date(row[COLUMN_INDICES[:visit_date]])
      visit_type_korean = row[COLUMN_INDICES[:visit_type]]
      memo = row[COLUMN_INDICES[:memo]]

      return nil if customer_name.blank?

      customer = find_customer(customer_name)
      return nil unless customer

      cache_key = "#{customer.id}-#{visit_date.to_date}"
      return cache[cache_key] if cache[cache_key]

      visit = Visit.find_or_create_by!(
        store: store,
        customer: customer,
        visited_at: visit_date
      ) do |v|
        v.status = "finalized"
        v.visit_type = Visit.normalize_visit_type(visit_type_korean)
        v.memo = memo if memo.present?
      end

      cache[cache_key] = visit
      visit
    end

    def find_customer(name)
      Customer.find_by(store: store, name: name) ||
        Customer.where(store: store).where("name LIKE ?", "#{name}%").first
    end

    def create_sale_line_item(row, visit)
      category = row[COLUMN_INDICES[:category]]
      detail_menu = row[COLUMN_INDICES[:detail_menu]]
      menu = row[COLUMN_INDICES[:menu]]
      staff_name = row[COLUMN_INDICES[:staff]]
      qty = (row[COLUMN_INDICES[:qty]] || 1).to_i
      price = row[COLUMN_INDICES[:price]].to_i
      discount_rate = row[COLUMN_INDICES[:discount_rate]].to_f
      discount_amount = row[COLUMN_INDICES[:discount_amount]].to_i
      net_total = row[COLUMN_INDICES[:net_total]].to_i

      staff = StaffMember.find_by(store: store, name: staff_name)

      item_type, service_id, product_id = resolve_item_type(category, menu, detail_menu)

      # Skip if item type couldn't be resolved or required reference is missing
      return if item_type.nil?
      return if item_type == "service" && service_id.nil?
      return if item_type == "product" && product_id.nil?

      qty = 1 if qty <= 0
      price = 0 if price.nil? || price < 0
      net_total = price if net_total.nil? || net_total <= 0
      discount_rate = 0 if discount_rate.nil? || discount_rate < 0
      discount_amount = 0 if discount_amount.nil? || discount_amount < 0
      net_unit_price = qty > 0 ? (net_total / qty) : 0

      SaleLineItem.create!(
        store: store,
        visit: visit,
        item_type: item_type,
        service_id: service_id,
        product_id: product_id,
        staff_id: staff&.id,
        qty: qty,
        list_unit_price: price,
        discount_rate: discount_rate,
        discount_amount: discount_amount,
        net_unit_price: net_unit_price,
        net_total: net_total
      )
    end

    def resolve_item_type(category, menu, detail_menu)
      case category
      when "시술"
        service_category = ServiceCategory.find_by(store: store, name: menu)
        service = Service.find_by(store: store, service_category: service_category, name: detail_menu) if service_category
        [ "service", service&.id, nil ]
      when "점판"
        vendor = Vendor.find_by(store: store, name: menu)
        product = Product.find_by(store: store, vendor: vendor, name: detail_menu) if vendor
        [ "product", nil, product&.id ]
      else
        [ nil, nil, nil ]
      end
    end

    def create_payments(row, visit)
      PAYMENT_METHODS.each do |method, column_index|
        amount = row[column_index].to_i
        next if amount <= 0

        Payment.find_or_create_by!(
          store: store,
          visit: visit,
          method: method.to_s,
          amount: amount
        )
      end
    end

    def create_prepaid_usage(row, visit)
      membership_amount = row[COLUMN_INDICES[:membership]].to_i
      return if membership_amount <= 0

      customer = visit.customer

      # Find oldest prepaid sale with remaining balance (FIFO)
      prepaid_sale = customer.prepaid_sales
                             .joins(:prepaid_plan)
                             .where(store: store)
                             .order(:sold_at)
                             .find { |sale| sale.remaining_balance > 0 }

      return unless prepaid_sale

      PrepaidUsage.create!(
        store: store,
        customer: customer,
        visit: visit,
        prepaid_sale: prepaid_sale,
        amount_used: 1,
        used_at: visit.visited_at
      )
    end

    def update_visit_totals(visits)
      visits.each(&:save!)
    end
  end
end
