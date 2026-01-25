# frozen_string_literal: true

namespace :import do
  namespace :excel do
    desc "Clean all transaction data before import"
    task clean: :environment do
      puts "Cleaning existing data..."

      PrepaidUsage.delete_all
      puts "  - PrepaidUsage: deleted"

      Payment.delete_all
      puts "  - Payment: deleted"

      SaleLineItem.delete_all
      puts "  - SaleLineItem: deleted"

      Visit.delete_all
      puts "  - Visit: deleted"

      PrepaidSale.delete_all
      puts "  - PrepaidSale: deleted"

      puts "Clean complete!"
    end

    desc "Import master data (StaffMember, ServiceCategory, Service, Vendor, Product, PrepaidPlan)"
    task :master, [ :file_path ] => :environment do |_t, args|
      file_path = args[:file_path] || Rails.root.join("mariem_db_20260117.xlsx").to_s
      store = Store.first

      abort "No store found. Please create a store first." unless store
      abort "File not found: #{file_path}" unless File.exist?(file_path)

      puts "Importing master data from #{file_path}..."
      result = ExcelImport::MasterDataImporter.new(file_path, store: store).call

      if result.success?
        puts "Master data import complete!"
        puts "  - StaffMembers: #{StaffMember.count}"
        puts "  - ServiceCategories: #{ServiceCategory.count}"
        puts "  - Services: #{Service.count}"
        puts "  - Vendors: #{Vendor.count}"
        puts "  - Products: #{Product.count}"
        puts "  - PrepaidPlans: #{PrepaidPlan.count}"
      else
        abort "Import failed: #{result.error}"
      end
    end

    desc "Import customers"
    task :customers, [ :file_path ] => :environment do |_t, args|
      file_path = args[:file_path] || Rails.root.join("mariem_db_20260117.xlsx").to_s
      store = Store.first

      abort "No store found. Please create a store first." unless store
      abort "File not found: #{file_path}" unless File.exist?(file_path)

      puts "Importing customers from #{file_path}..."
      result = ExcelImport::CustomerImporter.new(file_path, store: store).call

      if result.success?
        puts "Customer import complete!"
        puts "  - Customers: #{Customer.count}"
        puts "  - Processed: #{result.processed}"
        puts "  - Created: #{result.created}"
      else
        abort "Import failed: #{result.error}"
      end
    end

    desc "Import prepaid sales (회원권/정액권)"
    task :prepaid, [ :file_path ] => :environment do |_t, args|
      file_path = args[:file_path] || Rails.root.join("mariem_db_20260117.xlsx").to_s
      store = Store.first

      abort "No store found. Please create a store first." unless store
      abort "File not found: #{file_path}" unless File.exist?(file_path)

      puts "Importing prepaid sales from #{file_path}..."
      result = ExcelImport::PrepaidSaleImporter.new(file_path, store: store).call

      if result.success?
        puts "Prepaid sales import complete!"
        puts "  - PrepaidSales: #{PrepaidSale.count}"
        puts "  - Processed: #{result.processed}"
        puts "  - Created: #{result.created}"
      else
        abort "Import failed: #{result.error}"
      end
    end

    desc "Import visits, sale line items, and payments"
    task :visits, [ :file_path ] => :environment do |_t, args|
      file_path = args[:file_path] || Rails.root.join("mariem_db_20260117.xlsx").to_s
      store = Store.first

      abort "No store found. Please create a store first." unless store
      abort "File not found: #{file_path}" unless File.exist?(file_path)

      puts "Importing visits from #{file_path}..."
      puts "This may take several minutes..."
      result = ExcelImport::VisitImporter.new(file_path, store: store).call

      if result.success?
        puts "Visit import complete!"
        puts "  - Visits: #{Visit.count}"
        puts "  - SaleLineItems: #{SaleLineItem.count}"
        puts "  - Payments: #{Payment.count}"
        puts "  - Processed: #{result.processed}"
        puts "  - Created: #{result.created}"
      else
        abort "Import failed: #{result.error}"
      end
    end

    desc "Run full import (clean, master, customers, prepaid, visits)"
    task :all, [ :file_path ] => :environment do |_t, args|
      file_path = args[:file_path] || Rails.root.join("mariem_db_20260117.xlsx").to_s

      Rake::Task["import:excel:clean"].invoke
      Rake::Task["import:excel:master"].invoke(file_path)
      Rake::Task["import:excel:customers"].invoke(file_path)
      Rake::Task["import:excel:prepaid"].invoke(file_path)
      Rake::Task["import:excel:visits"].invoke(file_path)

      puts "\n=== Full import complete! ==="
      puts "Summary:"
      puts "  - Customers: #{Customer.count}"
      puts "  - Visits: #{Visit.count}"
      puts "  - SaleLineItems: #{SaleLineItem.count}"
      puts "  - Payments: #{Payment.count}"
      puts "  - PrepaidSales: #{PrepaidSale.count}"
    end
  end
end
