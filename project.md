# 📄 File 1: MVP 압축본 (Purpose & Scope)


# Mariem Palantir – 입력 MVP 압축본

## 목적
미용실의 모든 거래(시술, 상품, 할인, 정액권, 포인트, 재고)를
**일관된 원장 구조**로 기록한다.

분석, 급여, 순이익 계산은 하지 않는다.
입력 정확성과 확장 가능성이 유일한 목표다.

## 핵심 원칙
- 정가는 마스터 데이터에 저장
- 할인/이벤트는 규칙으로 관리
- 거래 시점에 정가·할인·최종가를 스냅샷으로 고정
- 결제는 수단(카드/현금/정액권/포인트)
- 정액권과 포인트는 별도 원장(ledger)
- 재고는 품목 마스터 + 입출고 이벤트 원장

## 반드시 포함
- 서비스/상품/직원 마스터 (사용자 설정, 하드코딩 없음)
- 방문 단위 거래 입력
- 시술 + 상품 판매를 동일한 판매 라인 구조로 기록
- 가격 규칙 기반 자동 금액 산출
- 복수 결제 수단 지원
- 정액권 판매/소진 분리 기록
- 포인트 적립/사용 원장
- 재고 입고/출고/소비 기록

## 절대 제외(MVP)
- 순이익 계산
- 급여/인센티브 자동 계산
- 재고 원가 평가(평균법/선입선출)
- KPI/대시보드
- 자동 마케팅/메시지
```

---

# 📄 File 2: 1장 스키마 스펙 (확장 대비)

```md
# Mariem Palantir – Schema Spec (v1)

## 공통 규칙
- 모든 테이블: store_id, created_at, updated_at
- 금액: integer(KRW)
- 포인트: integer (1pt = 1KRW)

## 매장/권한
- stores(id, name)
- users(id, store_id, email, role[OWNER|MANAGER|STYLIST])

## 마스터
### 직원
- staff_members(id, store_id, name, role_title, phone, active, default_commission_rate)

### 서비스
- service_categories(id, store_id, name)
- services(id, store_id, service_category_id, name, list_price, active)

### 제품/재고 품목
- vendors(id, store_id, name, phone)
- products(id, store_id, vendor_id, name, kind[retail|consumable|both], size_value, size_unit, default_purchase_unit_price, default_retail_unit_price, active)

### 정액권 상품
- prepaid_plans(id, store_id, name, price_paid, value_amount, active)

## 고객/거래
- customers(id, store_id, name, phone, memo)
- visits(id, store_id, customer_id, visited_at, subtotal_amount, total_amount, status[draft|finalized])

## 가격 규칙
- pricing_rules(id, store_id, name, rule_type[percent|amount], value, applies_to, target_id, starts_at, ends_at)

## 판매 라인(시술+상품)
- sale_line_items(id, store_id, visit_id, item_type[service|product], service_id, product_id, staff_id,
  qty, list_unit_price, discount_rate, discount_amount, net_unit_price, net_total, applied_pricing_rule_id)

## 결제
- payments(id, store_id, visit_id, method[card|cash|bank|prepaid|points], amount)

## 정액권 원장
- prepaid_sales(id, store_id, customer_id, prepaid_plan_id, amount_paid, value_amount, seller_staff_id, sold_at)
- prepaid_usages(id, store_id, customer_id, visit_id, amount_used, applied_sale_line_item_id, used_at)

## 포인트 원장
- point_rules(id, store_id, name, rule_type[percent_of_net|fixed], value, applies_to, target_id, starts_at, ends_at)
- point_transactions(id, store_id, customer_id, txn_type[earn|redeem|adjust|expire], points_delta, visit_id, payment_id, point_rule_id)

## 재고
- inventory_purchases(id, store_id, vendor_id, purchased_at)
- inventory_purchase_items(id, inventory_purchase_id, product_id, qty, unit_cost)
- inventory_events(id, store_id, product_id, event_type[purchase|sale|consume|adjust|waste], qty_delta, occurred_at, visit_id, sale_line_item_id)
```

---

# 📄 File 3: Claude Code 실행 지시문

```md
# Claude Code – Rails 입력 MVP 구현 지시

## 목표
Ruby on Rails + PostgreSQL로 미용실 거래 입력 MVP를 구현한다.
분석, 급여, 순이익 계산은 하지 않는다.

## 핵심
- 모든 가격은 마스터 정가 + 가격 규칙으로 자동 산출
- 거래 시점에 스냅샷으로 고정
- 정액권/포인트는 별도 원장
- 재고는 품목 마스터 + 이벤트 원장

## 구현 범위
1. 서비스/상품/직원 마스터 CRUD (정가 포함)
2. 방문 단위 거래 입력
   - 판매 라인(시술/상품)
   - 자동 할인 적용
   - 결제 분할(카드/현금/정액권/포인트)
3. 정액권 판매/소진 기록
4. 포인트 적립/사용 원장
5. 재고 입고/출고/소비 기록

## 제외
- 순이익 계산
- 인센티브 계산
- 재고 원가 평가
- KPI 대시보드

## 결과물
- Rails migrations
- models, controllers, views(ERB)
- seed 데이터
- README(로컬 실행 방법)

