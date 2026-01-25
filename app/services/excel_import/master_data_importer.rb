# frozen_string_literal: true

module ExcelImport
  class MasterDataImporter < BaseImporter
    COLUMN_INDICES = {
      category: 4,     # 구분 (시술/회원/점판/정액/외상)
      menu: 5,         # 메뉴
      detail_menu: 6,  # 상세메뉴
      staff: 8,        # 담당
      price: 9         # 판매가
    }.freeze

    protected

    def process_rows
      extract_staff_members
      extract_service_categories
      extract_services
      extract_vendors
      extract_products
      extract_prepaid_plans
    end

    private

    def extract_staff_members
      staff_names = collect_unique_values(COLUMN_INDICES[:staff])
      staff_names.each do |name|
        next if name.blank?

        StaffMember.find_or_create_by!(store: store, name: name) do |staff|
          staff.role_title = "디자이너"
          staff.active = true
        end
        increment_created
      end
    end

    def extract_service_categories
      service_rows = rows_by_category("시술")
      category_names = service_rows.map { |row| row[COLUMN_INDICES[:menu]] }.uniq.compact

      category_names.each do |name|
        next if name.blank?

        ServiceCategory.find_or_create_by!(store: store, name: name)
        increment_created
      end
    end

    def extract_services
      service_rows = rows_by_category("시술")
      service_data = service_rows.map do |row|
        {
          menu: row[COLUMN_INDICES[:menu]],
          detail_menu: row[COLUMN_INDICES[:detail_menu]],
          price: row[COLUMN_INDICES[:price]]
        }
      end.uniq { |d| [ d[:menu], d[:detail_menu] ] }

      service_data.each do |data|
        next if data[:detail_menu].blank?

        category = ServiceCategory.find_by(store: store, name: data[:menu])
        next unless category

        Service.find_or_create_by!(store: store, service_category: category, name: data[:detail_menu]) do |service|
          service.list_price = data[:price].to_i
          service.active = true
        end
        increment_created
      end
    end

    def extract_vendors
      product_rows = rows_by_category("점판")
      vendor_names = product_rows.map { |row| row[COLUMN_INDICES[:menu]] }.uniq.compact

      vendor_names.each do |name|
        next if name.blank?

        Vendor.find_or_create_by!(store: store, name: name)
        increment_created
      end
    end

    def extract_products
      product_rows = rows_by_category("점판")
      product_data = product_rows.map do |row|
        {
          vendor_name: row[COLUMN_INDICES[:menu]],
          product_name: row[COLUMN_INDICES[:detail_menu]],
          price: row[COLUMN_INDICES[:price]]
        }
      end.uniq { |d| [ d[:vendor_name], d[:product_name] ] }

      product_data.each do |data|
        next if data[:product_name].blank?

        vendor = Vendor.find_by(store: store, name: data[:vendor_name])
        next unless vendor

        Product.find_or_create_by!(store: store, vendor: vendor, name: data[:product_name]) do |product|
          product.default_retail_unit_price = data[:price].to_i
          product.active = true
          product.kind = "retail"
        end
        increment_created
      end
    end

    def extract_prepaid_plans
      membership_rows = rows_by_category("회원")
      prepaid_rows = rows_by_category("정액")

      membership_plan_data = membership_rows.map do |row|
        {
          name: row[COLUMN_INDICES[:detail_menu]],
          price: row[COLUMN_INDICES[:price]],
          type: :membership
        }
      end.uniq { |d| d[:name] }

      prepaid_plan_data = prepaid_rows.map do |row|
        {
          name: row[COLUMN_INDICES[:detail_menu]],
          price: row[COLUMN_INDICES[:price]],
          type: :prepaid
        }
      end.uniq { |d| d[:name] }

      (membership_plan_data + prepaid_plan_data).each do |data|
        next if data[:name].blank?
        next if data[:price].to_i <= 0

        PrepaidPlan.find_or_create_by!(store: store, name: data[:name]) do |plan|
          plan.price_paid = data[:price].to_i
          if data[:type] == :membership
            plan.value_amount = extract_count_from_name(data[:name])
          else
            plan.value_amount = data[:price].to_i
          end
          plan.active = true
        end
        increment_created
      end
    end

    def rows_by_category(category_name)
      data_rows.select { |row| row[COLUMN_INDICES[:category]] == category_name }
    end

    def collect_unique_values(column_index)
      data_rows.map { |row| row[column_index] }.uniq.compact
    end
  end
end
