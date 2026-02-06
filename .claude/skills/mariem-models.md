---
name: mariem-models
description: Mariem Palantir 26개 ActiveRecord 모델, 관계, 검증, 스코프, acts_as_tenant, 서비스 객체 패턴. Use when working with models, database queries, business logic, or service objects.
---

# Mariem Models Skill

## 모델 전체 맵

```
Store (테넌트 루트)
├── User (인증, Devise+JWT)
├── Customer
│   ├── Visit (거래)
│   │   ├── SaleLineItem (판매 항목)
│   │   ├── Payment (결제)
│   │   ├── PrepaidUsage (정액권 사용)
│   │   ├── PointTransaction (포인트)
│   │   └── InventoryEvent (재고 변동)
│   ├── PrepaidSale (정액권 구매)
│   └── PointTransaction (포인트 이력)
├── StaffMember (시술자)
├── ServiceCategory → Service (서비스 카탈로그)
├── Vendor → Product (제품 카탈로그)
├── PrepaidPlan (정액권 상품)
├── PricingRule (할인 규칙)
├── PointRule (포인트 적립 규칙)
├── InventoryPurchase → InventoryPurchaseItem (구매 입고)
└── InventoryEvent (재고 이벤트)
```

## 멀티테넌시 (필수)

```ruby
# 모든 모델에 필수
class NewModel < ApplicationRecord
  include StoreScoped  # belongs_to :store + scope :for_store 자동 추가
  acts_as_tenant(:store)
end
```

## 핵심 모델 상세

### Visit (거래 - 핵심 도메인)
- **상태**: `draft` → `finalized` (voided 가능)
- **콜백**: `before_save :calculate_totals`
- **메서드**: `finalize!`, `void!`, `paid_amount`, `remaining_amount`, `fully_paid?`
- **스코프**: `draft`, `finalized`, `active`, `voided`, `for_report`

### SaleLineItem (판매 항목)
- **타입**: `service` | `product`
- **가격**: `list_unit_price` → `apply_pricing` → `net_unit_price` → `net_total`
- **콜백**: `before_validation :apply_pricing` (생성 시)
- **검증**: `item_reference_present` (service 또는 product 필수)

### Payment (결제)
- **방법**: `card`, `cash`, `bank`, `credit`, `pay`, `other`, `prepaid`, `points`

## 서비스 객체 (비즈니스 로직)

### PricingCalculator
```ruby
# 가격 계산 흐름
calculator = PricingCalculator.new(sale_line_item)
calculator.apply  # list_price 설정 → 할인 적용 → net_total 계산
```

### PrepaidLedger
```ruby
# 정액권 판매/사용
PrepaidLedger.sell(customer:, prepaid_plan:, staff:, amount_paid:, value_amount:)
PrepaidLedger.use(customer:, prepaid_sale:, amount:, visit:, sale_line_item:)
PrepaidLedger.balance_for(customer)
```
- **예외**: `NoPrepaidSaleError`, `InsufficientBalanceError`

### PointLedger
```ruby
# 포인트 적립/사용
PointLedger.earn_from_visit(customer:, visit:, payment:)
PointLedger.redeem(customer:, points:, visit:)
PointLedger.balance_for(customer)
```
- **예외**: `InsufficientPointsError`

### InventoryLedger
```ruby
# 재고 관리
InventoryLedger.record_purchase(product:, qty:, purchase:)
InventoryLedger.record_sale(product:, qty:, visit:, sale_line_item:)
InventoryLedger.current_stock(product)
```

## Enum/상수 정리

| 모델 | 필드 | 값 |
|------|------|-----|
| Visit | status | draft, finalized |
| Visit | visit_type | new, returning, substitute, referral, guest |
| SaleLineItem | item_type | service, product |
| Payment | method | card, cash, bank, credit, pay, other, prepaid, points |
| Product | kind | retail, consumable, both |
| PointTransaction | txn_type | earn, redeem, adjust, expire |
| PricingRule | rule_type | percent, amount |
| PricingRule | applies_to | all_services, service_category, specific_service, all_products, specific_product |
| PointRule | rule_type | percent_of_net, fixed |
| InventoryEvent | event_type | purchase, sale, consume, adjust, waste |

## 새 모델 생성 체크리스트

1. `include StoreScoped` 추가
2. `acts_as_tenant(:store)` 확인
3. `belongs_to` 연관 설정
4. `validates` 필수 검증 추가
5. Factory 생성 (`spec/factories/`)
6. 모델 테스트 작성 (`spec/models/`)
7. 마이그레이션에 `store_id` 외래키 포함
8. `db/schema.rb` 반영 확인
