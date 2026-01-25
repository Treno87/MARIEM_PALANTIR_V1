# frozen_string_literal: true

module ExcelImport
  class CustomerImporter < BaseImporter
    COLUMN_INDICES = {
      customer_name: 2,  # 고객명
      gender: 3,         # 성별
      visit_date: 30     # 방문일자
    }.freeze

    protected

    def process_rows
      foreign_tourist_counter = 0
      customer_cache = {}

      data_rows.each do |row|
        increment_processed

        name = row[COLUMN_INDICES[:customer_name]]
        gender = row[COLUMN_INDICES[:gender]]
        visit_date = row[COLUMN_INDICES[:visit_date]]

        next if name.blank?

        actual_name = if name == "외국인관광객"
          foreign_tourist_counter += 1
          "외국인관광객#{foreign_tourist_counter}"
        else
          name
        end

        cache_key = "#{actual_name}-#{gender}"
        next if customer_cache[cache_key]

        memo = gender.present? ? "성별: #{gender}" : nil

        Customer.find_or_create_by!(store: store, name: actual_name) do |customer|
          customer.memo = memo
        end

        customer_cache[cache_key] = true
        increment_created
      end
    end
  end
end
