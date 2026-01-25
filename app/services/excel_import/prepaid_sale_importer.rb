# frozen_string_literal: true

module ExcelImport
  class PrepaidSaleImporter < BaseImporter
    COLUMN_INDICES = {
      customer_name: 2,  # 고객명
      gender: 3,         # 성별
      category: 4,       # 구분
      detail_menu: 6,    # 상세메뉴
      staff: 8,          # 담당
      price: 9,          # 판매가
      visit_date: 30     # 방문일자
    }.freeze

    protected

    def process_rows
      prepaid_rows = data_rows.select { |row| %w[회원 정액].include?(row[COLUMN_INDICES[:category]]) }

      prepaid_rows.each do |row|
        increment_processed

        customer_name = row[COLUMN_INDICES[:customer_name]]
        gender = row[COLUMN_INDICES[:gender]]
        category = row[COLUMN_INDICES[:category]]
        plan_name = row[COLUMN_INDICES[:detail_menu]]
        staff_name = row[COLUMN_INDICES[:staff]]
        price = row[COLUMN_INDICES[:price]].to_i
        visit_date = parse_date(row[COLUMN_INDICES[:visit_date]])

        next if customer_name.blank? || plan_name.blank? || price <= 0

        customer = find_customer(customer_name, gender)
        plan = PrepaidPlan.find_by(store: store, name: plan_name)
        staff = StaffMember.find_by(store: store, name: staff_name)

        next unless customer && plan

        PrepaidSale.find_or_create_by!(
          store: store,
          customer: customer,
          prepaid_plan: plan,
          sold_at: visit_date
        ) do |sale|
          sale.seller_staff_id = staff&.id
          sale.amount_paid = price
          sale.value_amount = category == "회원" ? extract_count_from_name(plan_name) : price
        end
        increment_created
      end
    end

    private

    def find_customer(name, _gender)
      Customer.find_by(store: store, name: name)
    end
  end
end
