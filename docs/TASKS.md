# TASKS: Mariem Palantir MVP 구현 태스크

## Phase 1: 프로젝트 초기화

### 1.1 Rails 프로젝트 생성
- [ ] `rails new mariem_palantir --database=postgresql --css=tailwind`
- [ ] Git 저장소 초기화
- [ ] .ruby-version 설정

### 1.2 Gem 설정
- [ ] Gemfile에 추가: devise, pagy
- [ ] bundle install
- [ ] Devise 설치: `rails generate devise:install`

### 1.3 데이터베이스 설정
- [ ] database.yml 설정
- [ ] `rails db:create`

---

## Phase 2: 마이그레이션 (20개 테이블)

### 2.1 기반 테이블
- [ ] `rails g migration CreateStores name:string`
- [ ] `rails g devise User` + store_id, role 추가
- [ ] `rails g migration CreateVendors store:references name:string phone:string`
- [ ] `rails g migration CreateServiceCategories store:references name:string`
- [ ] `rails g migration CreateStaffMembers store:references name:string role_title:string phone:string active:boolean default_commission_rate:decimal`
- [ ] `rails g migration CreateCustomers store:references name:string phone:string memo:text`

### 2.2 마스터 데이터
- [ ] `rails g migration CreateServices store:references service_category:references name:string list_price:integer active:boolean`
- [ ] `rails g migration CreateProducts store:references vendor:references name:string kind:string size_value:decimal size_unit:string default_purchase_unit_price:integer default_retail_unit_price:integer active:boolean`
- [ ] `rails g migration CreatePrepaidPlans store:references name:string price_paid:integer value_amount:integer active:boolean`
- [ ] `rails g migration CreatePricingRules store:references name:string rule_type:string value:decimal applies_to:string target_id:integer starts_at:datetime ends_at:datetime`
- [ ] `rails g migration CreatePointRules store:references name:string rule_type:string value:decimal applies_to:string target_id:integer starts_at:datetime ends_at:datetime`

### 2.3 거래 데이터
- [ ] `rails g migration CreateVisits store:references customer:references visited_at:datetime subtotal_amount:integer total_amount:integer status:string`
- [ ] `rails g migration CreateSaleLineItems store:references visit:references item_type:string service:references product:references staff:references qty:integer list_unit_price:integer discount_rate:decimal discount_amount:integer net_unit_price:integer net_total:integer applied_pricing_rule:references`
- [ ] `rails g migration CreatePayments store:references visit:references method:string amount:integer`

### 2.4 원장 데이터
- [ ] `rails g migration CreatePrepaidSales store:references customer:references prepaid_plan:references amount_paid:integer value_amount:integer seller_staff:references sold_at:datetime`
- [ ] `rails g migration CreatePrepaidUsages store:references customer:references prepaid_sale:references visit:references amount_used:integer applied_sale_line_item:references used_at:datetime`
- [ ] `rails g migration CreatePointTransactions store:references customer:references txn_type:string points_delta:integer visit:references payment:references point_rule:references memo:text`

### 2.5 재고 데이터
- [ ] `rails g migration CreateInventoryPurchases store:references vendor:references purchased_at:datetime`
- [ ] `rails g migration CreateInventoryPurchaseItems inventory_purchase:references product:references qty:integer unit_cost:integer`
- [ ] `rails g migration CreateInventoryEvents store:references product:references event_type:string qty_delta:integer occurred_at:datetime visit:references sale_line_item:references memo:text`

### 2.6 인덱스 추가
- [ ] 복합 인덱스 마이그레이션 생성
- [ ] `rails db:migrate`

---

## Phase 3: 모델 구현

### 3.1 Concerns
- [ ] `app/models/concerns/store_scoped.rb` 생성

### 3.2 기반 모델
- [ ] Store 모델 (has_many 관계 설정)
- [ ] User 모델 (Devise + store 관계)

### 3.3 마스터 모델
- [ ] Vendor 모델
- [ ] ServiceCategory 모델
- [ ] Service 모델 (validation, scope)
- [ ] Product 모델 (enum kind, scope)
- [ ] StaffMember 모델
- [ ] PrepaidPlan 모델
- [ ] PricingRule 모델 (enum, applicable_to? 메서드)
- [ ] PointRule 모델

### 3.4 거래 모델
- [ ] Customer 모델 (point_balance, prepaid_balance 메서드)
- [ ] Visit 모델 (enum status, calculate_totals)
- [ ] SaleLineItem 모델 (enum item_type, validation)
- [ ] Payment 모델 (enum method)

### 3.5 원장 모델
- [ ] PrepaidSale 모델 (remaining_balance 메서드)
- [ ] PrepaidUsage 모델
- [ ] PointTransaction 모델 (enum txn_type, validation)

### 3.6 재고 모델
- [ ] InventoryPurchase 모델
- [ ] InventoryPurchaseItem 모델
- [ ] InventoryEvent 모델 (enum event_type)

---

## Phase 4: 서비스 객체

### 4.1 PricingCalculator
- [ ] `app/models/services/pricing_calculator.rb` 생성
- [ ] set_list_price 구현
- [ ] find_and_apply_discount 구현
- [ ] calculate_net_total 구현
- [ ] SaleLineItem에 연동

### 4.2 PrepaidLedger
- [ ] `app/models/services/prepaid_ledger.rb` 생성
- [ ] sell() 메서드
- [ ] use() 메서드 (FIFO)
- [ ] balance_for() 메서드

### 4.3 PointLedger
- [ ] `app/models/services/point_ledger.rb` 생성
- [ ] earn_from_visit() 메서드
- [ ] redeem() 메서드
- [ ] adjust() 메서드
- [ ] balance_for() 메서드

### 4.4 InventoryLedger
- [ ] `app/models/services/inventory_ledger.rb` 생성
- [ ] record_purchase() 메서드
- [ ] record_sale() 메서드
- [ ] record_consume() 메서드
- [ ] current_stock() 메서드

---

## Phase 5: 컨트롤러

### 5.1 기반 컨트롤러
- [ ] ApplicationController (current_store, authenticate)
- [ ] DashboardController (홈 화면)

### 5.2 인증 컨트롤러
- [ ] Devise 컨트롤러 커스터마이징
- [ ] 회원가입 시 Store 생성

### 5.3 마스터 컨트롤러
- [ ] Masters::ServiceCategoriesController (CRUD)
- [ ] Masters::ServicesController (CRUD)
- [ ] Masters::VendorsController (CRUD)
- [ ] Masters::ProductsController (CRUD)
- [ ] Masters::StaffMembersController (CRUD)
- [ ] Masters::PrepaidPlansController (CRUD)
- [ ] CustomersController (CRUD)

### 5.4 거래 컨트롤러
- [ ] Transactions::VisitsController (CRUD + finalize)
- [ ] Transactions::SaleLineItemsController (create, destroy)
- [ ] Transactions::PaymentsController (create, destroy)

### 5.5 원장 컨트롤러
- [ ] Prepaid::SalesController (index, new, create, show)
- [ ] Points::TransactionsController (index, create)

### 5.6 재고 컨트롤러
- [ ] Inventory::PurchasesController (CRUD)
- [ ] Inventory::EventsController (index, create)
- [ ] Inventory::StockController (index)

---

## Phase 6: 라우팅

- [ ] config/routes.rb 설정
- [ ] 네임스페이스 라우트 (masters, transactions, prepaid, points, inventory)
- [ ] 중첩 리소스 (visits > sale_line_items, payments)

---

## Phase 7: 뷰

### 7.1 레이아웃
- [ ] application.html.erb (Tailwind 기본 레이아웃)
- [ ] 네비게이션 바
- [ ] 플래시 메시지

### 7.2 Devise 뷰
- [ ] Devise 뷰 커스터마이징 (Tailwind 적용)

### 7.3 마스터 뷰
- [ ] 서비스 카테고리/서비스 뷰
- [ ] 상품 뷰
- [ ] 직원 뷰
- [ ] 정액권 플랜 뷰
- [ ] 고객 뷰

### 7.4 거래 뷰 (핵심)
- [ ] 방문 목록 (visits/index)
- [ ] 방문 상세 (visits/show)
- [ ] 거래 입력 (visits/edit) - 판매 라인 + 결제
- [ ] 판매 라인 폼 (partial)
- [ ] 결제 폼 (partial)

### 7.5 원장 뷰
- [ ] 정액권 판매 목록/폼
- [ ] 포인트 내역

### 7.6 재고 뷰
- [ ] 입고 목록/폼
- [ ] 재고 현황
- [ ] 재고 이벤트 이력

---

## Phase 8: Seed 데이터

- [ ] db/seeds.rb 작성
  - [ ] 샘플 매장
  - [ ] 샘플 사용자 (owner@example.com)
  - [ ] 직원 3명
  - [ ] 서비스 카테고리 4개 + 서비스 13개
  - [ ] 공급업체 3개 + 상품 7개
  - [ ] 정액권 플랜 3개
  - [ ] 가격 규칙 2개
  - [ ] 포인트 규칙 1개
  - [ ] 샘플 고객 3명
  - [ ] 샘플 거래 1건

---

## Phase 9: 마무리

### 9.1 문서화
- [ ] README.md 작성 (설치 및 실행 방법)
- [ ] CLAUDE.md 업데이트

### 9.2 테스트
- [ ] 수동 테스트 체크리스트 실행
- [ ] 주요 기능 동작 확인

---

## 우선순위 및 의존성

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
                          ↓
                    Phase 5 → Phase 6 → Phase 7
                          ↓
                    Phase 8 → Phase 9
```

### 크리티컬 패스
1. 마이그레이션 (Phase 2)
2. 모델 + 서비스 객체 (Phase 3-4)
3. 거래 입력 컨트롤러/뷰 (Phase 5-7 중 transactions 부분)

### 병렬 가능
- 마스터 CRUD (Phase 5-7 중 masters 부분)
- 원장/재고 (Phase 5-7 중 prepaid, points, inventory 부분)
