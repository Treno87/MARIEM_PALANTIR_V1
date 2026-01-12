# frozen_string_literal: true

puts "=== Mariem Palantir Seed Data ==="

# 매장 생성
puts "Creating store..."
store = Store.find_or_create_by!(name: "마리엠 헤어살롱")

# 관리자 계정 생성
puts "Creating admin user..."
user = User.find_or_create_by!(email: "owner@example.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.store = store
  u.role = "OWNER"
end

# 직원 생성
puts "Creating staff members..."
staff_data = [
  { name: "김원장", role_title: "원장", phone: "010-1111-1111" },
  { name: "이디자이너", role_title: "디자이너", phone: "010-2222-2222" },
  { name: "박인턴", role_title: "인턴", phone: "010-3333-3333" }
]

staff_members = staff_data.map do |data|
  StaffMember.find_or_create_by!(store: store, name: data[:name]) do |s|
    s.role_title = data[:role_title]
    s.phone = data[:phone]
    s.active = true
  end
end

# 서비스 카테고리 생성
puts "Creating service categories..."
categories_data = ["커트", "펌", "염색", "클리닉"]

categories = categories_data.map do |name|
  ServiceCategory.find_or_create_by!(store: store, name: name)
end

# 서비스 생성
puts "Creating services..."
services_data = [
  # 커트
  { category: "커트", name: "남성커트", list_price: 20000 },
  { category: "커트", name: "여성커트", list_price: 30000 },
  { category: "커트", name: "학생커트", list_price: 15000 },
  # 펌
  { category: "펌", name: "일반펌", list_price: 80000 },
  { category: "펌", name: "디지털펌", list_price: 120000 },
  { category: "펌", name: "매직셋팅", list_price: 150000 },
  # 염색
  { category: "염색", name: "새치염색", list_price: 50000 },
  { category: "염색", name: "전체염색", list_price: 80000 },
  { category: "염색", name: "탈색", list_price: 60000 },
  { category: "염색", name: "옴브레/발레아쥬", list_price: 150000 },
  # 클리닉
  { category: "클리닉", name: "두피클리닉", list_price: 40000 },
  { category: "클리닉", name: "모발클리닉", list_price: 30000 },
  { category: "클리닉", name: "프리미엄 트리트먼트", list_price: 50000 }
]

services_data.each do |data|
  category = categories.find { |c| c.name == data[:category] }
  Service.find_or_create_by!(store: store, service_category: category, name: data[:name]) do |s|
    s.list_price = data[:list_price]
    s.active = true
  end
end

# 공급업체 생성
puts "Creating vendors..."
vendors_data = [
  { name: "케라시스", phone: "02-1234-5678" },
  { name: "로레알", phone: "02-2345-6789" },
  { name: "아모레퍼시픽", phone: "02-3456-7890" }
]

vendors = vendors_data.map do |data|
  Vendor.find_or_create_by!(store: store, name: data[:name]) do |v|
    v.phone = data[:phone]
  end
end

# 상품 생성
puts "Creating products..."
products_data = [
  { vendor: "케라시스", name: "케라시스 샴푸 500ml", kind: "retail", cost: 8000, price: 15000 },
  { vendor: "케라시스", name: "케라시스 트리트먼트 500ml", kind: "retail", cost: 10000, price: 18000 },
  { vendor: "로레알", name: "로레알 염색약 (박스)", kind: "consumable", cost: 5000, price: nil },
  { vendor: "로레알", name: "로레알 헤어오일 100ml", kind: "both", cost: 12000, price: 25000 },
  { vendor: "아모레퍼시픽", name: "미쟝센 에센스", kind: "retail", cost: 7000, price: 12000 },
  { vendor: "아모레퍼시픽", name: "펌제 1제", kind: "consumable", cost: 3000, price: nil },
  { vendor: "아모레퍼시픽", name: "펌제 2제", kind: "consumable", cost: 3000, price: nil }
]

products_data.each do |data|
  vendor = vendors.find { |v| v.name == data[:vendor] }
  Product.find_or_create_by!(store: store, vendor: vendor, name: data[:name]) do |p|
    p.kind = data[:kind]
    p.default_purchase_unit_price = data[:cost]
    p.default_retail_unit_price = data[:price]
    p.active = true
  end
end

# 정액권 상품 생성
puts "Creating prepaid plans..."
prepaid_plans_data = [
  { name: "10만원 정액권", value: 100000, price: 95000 },
  { name: "30만원 정액권", value: 300000, price: 270000 },
  { name: "50만원 정액권", value: 500000, price: 430000 }
]

prepaid_plans_data.each do |data|
  PrepaidPlan.find_or_create_by!(store: store, name: data[:name]) do |p|
    p.value_amount = data[:value]
    p.price_paid = data[:price]
    p.active = true
  end
end

# 가격 규칙 생성
puts "Creating pricing rules..."
PricingRule.find_or_create_by!(store: store, name: "신규고객 10% 할인") do |r|
  r.rule_type = "percent"
  r.value = 10
  r.applies_to = "all_services"
end

PricingRule.find_or_create_by!(store: store, name: "학생 3000원 할인") do |r|
  r.rule_type = "amount"
  r.value = 3000
  r.applies_to = "all_services"
end

# 포인트 규칙 생성
puts "Creating point rules..."
point_rule = PointRule.find_or_create_by!(store: store, name: "기본 적립") do |r|
  r.rule_type = "percent_of_net"
  r.value = 5
end

# 고객 생성
puts "Creating customers..."
customers_data = [
  { name: "홍길동", phone: "010-1234-5678", memo: "단골 고객" },
  { name: "김영희", phone: "010-2345-6789", memo: "펌 선호" },
  { name: "이철수", phone: "010-3456-7890", memo: nil }
]

customers = customers_data.map do |data|
  Customer.find_or_create_by!(store: store, phone: data[:phone]) do |c|
    c.name = data[:name]
    c.memo = data[:memo]
  end
end

# 샘플 거래 생성
puts "Creating sample transactions..."

# 거래 1: 홍길동 - 여성커트 + 상품 구매
customer1 = customers[0]
stylist1 = staff_members[0]
service_cut = Service.find_by(store: store, name: "여성커트")
product_shampoo = Product.find_by(store: store, name: "케라시스 샴푸 500ml")

visit1 = Visit.find_or_create_by!(
  store: store,
  customer: customer1,
  visited_at: 3.days.ago
) do |v|
  v.status = "finalized"
  v.subtotal_amount = 45000
  v.total_amount = 45000
end

unless visit1.sale_line_items.exists?
  SaleLineItem.create!(
    store: store,
    visit: visit1,
    item_type: "service",
    service: service_cut,
    staff_id: stylist1.id,
    qty: 1,
    list_unit_price: 30000,
    discount_rate: 0,
    discount_amount: 0,
    net_unit_price: 30000,
    net_total: 30000
  )

  SaleLineItem.create!(
    store: store,
    visit: visit1,
    item_type: "product",
    product: product_shampoo,
    staff_id: stylist1.id,
    qty: 1,
    list_unit_price: 15000,
    discount_rate: 0,
    discount_amount: 0,
    net_unit_price: 15000,
    net_total: 15000
  )

  Payment.create!(
    store: store,
    visit: visit1,
    method: "card",
    amount: 45000
  )

  # 포인트 적립
  PointTransaction.create!(
    store: store,
    customer: customer1,
    visit: visit1,
    point_rule: point_rule,
    txn_type: "earn",
    points_delta: 2250,
    memo: "거래 적립 (5%)"
  )
end

# 거래 2: 김영희 - 디지털펌
customer2 = customers[1]
service_perm = Service.find_by(store: store, name: "디지털펌")

visit2 = Visit.find_or_create_by!(
  store: store,
  customer: customer2,
  visited_at: 1.day.ago
) do |v|
  v.status = "finalized"
  v.subtotal_amount = 120000
  v.total_amount = 120000
end

unless visit2.sale_line_items.exists?
  SaleLineItem.create!(
    store: store,
    visit: visit2,
    item_type: "service",
    service: service_perm,
    staff_id: stylist1.id,
    qty: 1,
    list_unit_price: 120000,
    discount_rate: 0,
    discount_amount: 0,
    net_unit_price: 120000,
    net_total: 120000
  )

  Payment.create!(
    store: store,
    visit: visit2,
    method: "card",
    amount: 120000
  )

  PointTransaction.create!(
    store: store,
    customer: customer2,
    visit: visit2,
    point_rule: point_rule,
    txn_type: "earn",
    points_delta: 6000,
    memo: "거래 적립 (5%)"
  )
end

# 정액권 판매
puts "Creating prepaid sale..."
prepaid_plan = PrepaidPlan.find_by(store: store, name: "10만원 정액권")

PrepaidSale.find_or_create_by!(
  store: store,
  customer: customer1,
  prepaid_plan: prepaid_plan,
  sold_at: 5.days.ago
) do |s|
  s.value_amount = 100000
  s.amount_paid = 95000
  s.seller_staff_id = stylist1.id
end

# 재고 입고
puts "Creating inventory purchase..."
purchase = InventoryPurchase.find_or_create_by!(
  store: store,
  vendor: vendors[0],
  purchased_at: 7.days.ago
)

shampoo_product = Product.find_by(store: store, name: "케라시스 샴푸 500ml")
treatment_product = Product.find_by(store: store, name: "케라시스 트리트먼트 500ml")

unless purchase.inventory_purchase_items.exists?
  InventoryPurchaseItem.create!(
    inventory_purchase: purchase,
    product: shampoo_product,
    qty: 5,
    unit_cost: 8000
  )

  InventoryPurchaseItem.create!(
    inventory_purchase: purchase,
    product: treatment_product,
    qty: 4,
    unit_cost: 10000
  )

  # 재고 이벤트 기록
  InventoryEvent.create!(
    store: store,
    product: shampoo_product,
    event_type: "purchase",
    qty_delta: 5,
    occurred_at: purchase.purchased_at,
    memo: "입고"
  )

  InventoryEvent.create!(
    store: store,
    product: treatment_product,
    event_type: "purchase",
    qty_delta: 4,
    occurred_at: purchase.purchased_at,
    memo: "입고"
  )
end

puts ""
puts "=== Seed Data Complete ==="
puts ""
puts "로그인 정보:"
puts "  이메일: owner@example.com"
puts "  비밀번호: password123"
puts ""
puts "생성된 데이터:"
puts "  - 매장: #{Store.count}개"
puts "  - 직원: #{StaffMember.count}명"
puts "  - 서비스 카테고리: #{ServiceCategory.count}개"
puts "  - 서비스: #{Service.count}개"
puts "  - 공급업체: #{Vendor.count}개"
puts "  - 상품: #{Product.count}개"
puts "  - 정액권 상품: #{PrepaidPlan.count}개"
puts "  - 고객: #{Customer.count}명"
puts "  - 방문 기록: #{Visit.count}건"
puts ""
