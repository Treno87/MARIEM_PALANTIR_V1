# frozen_string_literal: true

def normalize_date(value)
  case value
  when Date then value
  when DateTime then value.to_date
  when String then Date.parse(value)
  else value.to_date
  end
end

namespace :visits do
  desc "엑셀 데이터에서 visit_type 업데이트"
  task update_types: :environment do
    require "roo"

    file_path = Rails.root.join("마리엠_매출분석FINAL.xlsx")
    xlsx = Roo::Spreadsheet.open(file_path.to_s)
    ws = xlsx.sheet("data")

    # 엑셀에서 방문일자+고객명 → 방문유형 매핑 구축
    visit_type_map = {}

    puts "엑셀에서 방문유형 데이터 읽는 중..."
    ws.each_row_streaming(offset: 1) do |row|
      visit_date = row[30]&.value
      next if visit_date.blank?

      customer_name = row[2]&.value&.to_s&.strip
      raw_type = row[26]&.value&.to_s&.strip
      next if customer_name.blank? || raw_type.blank?

      visit_type = Visit.normalize_visit_type(raw_type)
      next unless visit_type

      date = normalize_date(visit_date)
      key = "#{customer_name}:#{date}"
      visit_type_map[key] = visit_type
    end

    puts "총 #{visit_type_map.size}개의 방문유형 데이터 추출"

    # DB 업데이트
    updated = 0
    skipped = 0

    Visit.includes(:customer).find_each do |visit|
      key = "#{visit.customer.name}:#{visit.visited_at.to_date}"
      visit_type = visit_type_map[key]

      if visit_type
        visit.update_column(:visit_type, visit_type)
        updated += 1
      else
        skipped += 1
      end
    end

    puts "완료: #{updated}건 업데이트, #{skipped}건 스킵"
  end
end
