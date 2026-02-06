# frozen_string_literal: true

namespace :handsos do
  desc "핸드SOS 매출 데이터 import"
  task :import, [:file_path] => :environment do |_t, args|
    abort "Usage: rails handsos:import[path/to/file.xls]" unless args[:file_path]
    abort "File not found: #{args[:file_path]}" unless File.exist?(args[:file_path])

    store = Store.find_by!(name: "마리엠 헤어살롱")

    puts "Importing #{args[:file_path]} into store '#{store.name}'..."
    puts ""

    result = HandsosImportService.new(args[:file_path], store: store).call

    puts "=== Import Complete ==="
    puts "Visits:       #{result.visits_created} created, #{result.visits_skipped} skipped"
    puts "Customers:    #{result.customers_created}"
    puts "Services:     #{result.services_created}"
    puts "PrepaidSales: #{result.prepaid_created}"
    puts ""

    if result.errors.any?
      puts "Errors (#{result.errors.count}):"
      result.errors.each { |e| puts "  - #{e}" }
    end
  end
end
