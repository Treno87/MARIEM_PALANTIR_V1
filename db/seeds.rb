# frozen_string_literal: true

puts "=== Mariem Palantir Seed Data ==="

# 매장 생성
puts "Creating store..."
store = Store.find_or_create_by!(name: "마리엠 헤어살롱")

# 관리자 계정 생성
puts "Creating admin user..."
seed_password = ENV.fetch("SEED_ADMIN_PASSWORD") { Rails.env.production? ? raise("SEED_ADMIN_PASSWORD 환경변수가 필요합니다") : "dev_password_#{SecureRandom.hex(8)}" }
user = User.find_or_create_by!(email: ENV.fetch("SEED_ADMIN_EMAIL", "owner@example.com")) do |u|
  u.password = seed_password
  u.password_confirmation = seed_password
  u.store = store
  u.role = "OWNER"
end

puts ""
puts "=== Seed Data Complete ==="
puts ""
puts "로그인 정보:"
puts "  이메일: #{user.email}"
puts "  비밀번호: [환경변수 SEED_ADMIN_PASSWORD 참조]" unless Rails.env.production?
puts ""
puts "생성된 데이터:"
puts "  - 매장: #{Store.count}개"
puts ""
puts "마스터 데이터(직원, 서비스, 고객 등)는 HandSOS import로 생성됩니다."
puts "  rails handsos:import[매출상세조회_20260101_20260131.xls]"
puts ""
