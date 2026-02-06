# Excel → DB 매핑 질문 사항

> 정확한 매핑을 위해 확인이 필요한 사항들
>
> **작성일**: 2026-01-25

---

## 현재 백엔드 DB 스키마

### 핵심 테이블 관계도

```
┌─────────────┐
│   stores    │ ← 모든 테이블의 멀티테넌시 기준
└─────────────┘
       │
       ├──────────────────────────────────────────────┐
       │                                              │
       ▼                                              ▼
┌─────────────┐                              ┌─────────────────┐
│  customers  │                              │  staff_members  │
├─────────────┤                              ├─────────────────┤
│ name        │                              │ name            │
│ phone (필수)│ ← Excel에 없음!              │ role_title      │
│ memo        │                              │ active          │
└─────────────┘                              └─────────────────┘
       │                                              │
       ▼                                              │
┌─────────────┐                                       │
│   visits    │ ← 방문/거래 단위                      │
├─────────────┤                                       │
│ visited_at  │                                       │
│ status      │ (draft/finalized)                     │
│ visit_type  │ (new/returning/substitute)            │
│ total_amount│                                       │
└─────────────┘                                       │
       │                                              │
       ▼                                              │
┌─────────────────┐         ┌─────────────────────┐   │
│ sale_line_items │────────►│ services / products │   │
├─────────────────┤         └─────────────────────┘   │
│ item_type       │ (service/product)                 │
│ qty             │                                   │
│ list_unit_price │                                   │
│ discount_rate   │                                   │
│ net_total       │                                   │
│ staff_id        │◄──────────────────────────────────┘
└─────────────────┘
       │
       ▼
┌─────────────┐
│  payments   │
├─────────────┤
│ method      │ (card/cash/bank/pay/prepaid/points/credit/other)
│ amount      │
└─────────────┘
```

### 정액권/회원권 관계

```
┌───────────────┐
│ prepaid_plans │ ← 정액권/회원권 상품 정의
├───────────────┤
│ name          │ "50만원 정액권", "남자커트3회권"
│ price_paid    │ 실제 결제 금액
│ value_amount  │ 사용 가능 금액/횟수
└───────────────┘
       │
       ▼
┌───────────────┐
│ prepaid_sales │ ← 정액권/회원권 판매 (충전)
├───────────────┤
│ customer_id   │
│ sold_at       │
│ amount_paid   │
│ value_amount  │
└───────────────┘
       │
       ▼
┌────────────────┐
│ prepaid_usages │ ← 정액권/회원권 사용
├────────────────┤
│ prepaid_sale_id│
│ visit_id       │
│ amount_used    │
│ used_at        │
└────────────────┘
```

---

## 주요 테이블 상세

### customers
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| name | string | O | 고객명 |
| phone | string | **O** | 전화번호 - **Excel에 없음!** |
| memo | text | X | 메모 |

### staff_members
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| name | string | O | 이름 |
| phone | string | X | 전화번호 |
| role_title | string | X | 직책 |
| default_commission_rate | decimal | X | 기본 수수료율 |
| active | boolean | X | 활성 여부 |

### service_categories
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| name | string | O | 카테고리명 |

### services
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| service_category_id | FK | O | 카테고리 |
| name | string | O | 시술명 |
| list_price | integer | **O** | 정가 |
| active | boolean | X | 활성 여부 |

### vendors
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| name | string | O | 벤더명 |
| phone | string | X | 전화번호 |

### products
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| vendor_id | FK | **O** | 벤더 - **Excel에 없음!** |
| name | string | O | 상품명 |
| kind | string | X | 종류 |
| default_retail_unit_price | integer | X | 소매가 |
| active | boolean | X | 활성 여부 |

### visits
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| customer_id | FK | O | 고객 |
| visited_at | datetime | O | 방문일시 |
| status | string | O | draft / finalized |
| visit_type | string | X | new / returning / substitute |
| subtotal_amount | integer | X | 소계 (정가 합) |
| total_amount | integer | X | 총액 (할인 후) |
| voided_at | datetime | X | 취소일시 |

### sale_line_items
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| visit_id | FK | O | 방문 |
| service_id | FK | X | 시술 (item_type=service일 때) |
| product_id | FK | X | 상품 (item_type=product일 때) |
| staff_id | FK | X | 담당자 |
| item_type | string | O | service / product |
| qty | integer | O | 수량 |
| list_unit_price | integer | O | 정가 |
| net_unit_price | integer | O | 할인 후 단가 |
| net_total | integer | O | 할인 후 총액 |
| discount_rate | decimal | X | 할인율 (%) |
| discount_amount | integer | X | 할인액 |
| prepaid_used | integer | X | 정액권 사용액 |
| points_earned | integer | X | 적립 포인트 |

### payments
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| visit_id | FK | O | 방문 |
| method | string | O | card/cash/bank/pay/prepaid/points/credit/other |
| amount | integer | O | 금액 (> 0) |

### prepaid_plans
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| name | string | O | 상품명 |
| price_paid | integer | O | 판매가 |
| value_amount | integer | O | 충전 금액/횟수 |
| active | boolean | X | 활성 여부 |

### prepaid_sales
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| customer_id | FK | O | 고객 |
| prepaid_plan_id | FK | O | 정액권 상품 |
| seller_staff_id | FK | X | 판매 담당자 |
| sold_at | datetime | O | 판매일시 |
| amount_paid | integer | O | 결제 금액 |
| value_amount | integer | O | 충전 금액 |

### prepaid_usages
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| store_id | FK | O | 멀티테넌시 |
| customer_id | FK | O | 고객 |
| prepaid_sale_id | FK | O | 어떤 정액권에서 차감 |
| visit_id | FK | X | 사용한 방문 |
| applied_sale_line_item_id | FK | X | 적용된 시술 |
| amount_used | integer | O | 사용 금액 |
| used_at | datetime | O | 사용일시 |

---

## 질문 사항

### 1. 회원권 사용 매칭 로직

**현재 상황**:
- "회원권" 결제 컬럼에 금액이 있으면 PrepaidUsage 생성 필요
- 하지만 어떤 PrepaidSale에서 차감할지 모름

**관련 DB 테이블**:
```
prepaid_usages
├── prepaid_sale_id (FK) ← 어떤 PrepaidSale에서 차감?
├── customer_id (FK)
├── visit_id (FK)
├── amount_used
└── used_at
```

**질문**:
- [ ] FIFO(먼저 구매한 회원권부터 차감)로 처리해도 되나요?
- [ ] 아니면 Excel에 회원권 매칭 정보가 따로 있나요?

**결정**:
- "회원권" 결제 컬럼에 금액이 있고, "구분"이 시술이면 회원권으로 지불한 내역이므로 회원권 횟수 차감
- "구분"이 "회원"이면 회원권 판매
- 회원권 = 횟수권
---

### 2. 정액권 사용 vs 결제

**현재 이해**:
- 구분='정액' → 정액권 **충전** (PrepaidSale)
- 결제 컬럼 '정액' > 0 → 정액권 **사용** (Payment)

**관련 DB 테이블**:
```
# 충전 시
prepaid_sales
├── customer_id
├── prepaid_plan_id
├── amount_paid (결제액)
└── value_amount (충전액)

# 사용 시 - 두 가지 옵션
Option A: payments (단순 기록)
├── method: 'prepaid'
└── amount

Option B: prepaid_usages (상세 추적)
├── prepaid_sale_id ← 어떤 정액권에서 차감
├── amount_used
└── used_at
```

**질문**:
- [ ] 정액권 사용도 PrepaidUsage로 추적해야 하나요?
- [ ] 아니면 단순히 Payment(method: prepaid)로만 기록하면 되나요?

**결정**:
- "구분"이 "정액"이면 정액권 판매
- "구분"이 "시술"이고, "정액"에 금액이 있으면 정액권 금액 차감
---

### 3. 외국인관광객 처리

**현재 상황**:
- "외국인관광객"이라는 고객명으로 158건 존재
- 같은 날 최대 18건 (여러 명의 외국인을 하나로 묶은 것으로 보임)

**관련 DB 테이블**:
```
customers
├── name: "외국인관광객"
└── memo: ?

visits
├── customer_id → 모두 같은 customer?
└── visited_at
```

**질문**:
- [ ] 이대로 하나의 Customer로 생성해도 되나요?
- [ ] 아니면 "외국인관광객1", "외국인관광객2"로 분리해야 하나요?

**결정**:
- "외국인관광객"은 모든 고객을 하나의 고객명으로 처리한 건
- 동일 고객은 동일 날짜에 여러 시술 시 여러 행으로 결제건 생성
- 결제행이 다른 경우 같은 날짜라도 다른 외국인
- 외국인관광객은 외국인관광객1, 외국인관광객2, 형식으로 개별저장
---

### 4. 점판(상품) 처리

**현재 상황**:
- 구분='점판' → 195건
- 메뉴: 아윤채(97), 르벨(63), 더 조각(16), 도테라(15) 등
- 상품이지만 Product 테이블에 vendor_id 필수

**관련 DB 테이블**:
```
products
├── vendor_id (FK) ← 필수! Excel에 없음
├── name
└── default_retail_unit_price

vendors
├── name: ?
└── phone: ?
```

**질문**:
- [ ] 점판 상품의 vendor는 어떻게 처리할까요?
  - A) "기본 벤더" 하나 생성해서 모두 연결
  - B) 메뉴명(아윤채, 르벨 등)을 벤더로 생성
  - C) Product 대신 Service로 처리 (item_type: product지만 service_id 사용)

**결정**:
- 점판 상품의 경우 "구분"이 점판인 경우만 제품 판매이며 메뉴 항목(아윤채,르벨 등)이 vendor
- "상세메뉴" 항목이 제품명
---

### 5. 할인율 100% 처리

**현재 상황**:
- 할인율 100%인 행이 3건 존재
- 결제액이 0원

**관련 DB 테이블**:
```
sale_line_items
├── list_unit_price: 원래 가격
├── discount_rate: 100.0
├── net_unit_price: 0
└── net_total: 0 ← 허용되나?

# 현재 모델 검증
validates :net_total, numericality: { greater_than_or_equal_to: 0 }
# → 0 허용됨
```

**질문**:
- [ ] 무료 시술/서비스 제공으로 봐도 되나요?
- [ ] SaleLineItem에 net_total: 0으로 생성해도 되나요?

**결정**:
- "할인율" 100%는 무료 시술 또는 블로거와 같은 마케팅을 위한 시술 등이므로 100% 허용
---

### 6. 회원권 상세메뉴의 가격/횟수

**현재 상황**:
- "남자커트3회권", "두피관리 10회" 등 회원권명에 횟수 포함
- PrepaidPlan에 value_amount 필요

**관련 DB 테이블**:
```
prepaid_plans
├── name: "남자커트3회권"
├── price_paid: ? (판매가)
└── value_amount: ? (금액 or 횟수?)

# Excel 데이터 예시
구분=회원, 상세메뉴="남자커트3회권", 판매가=51000
구분=회원, 상세메뉴="두피관리 10회", 판매가=470000
```

**질문**:
- [ ] 회원권의 value_amount를 어떻게 설정할까요?
  - A) 판매가를 그대로 사용 (금액 기반)
  - B) 횟수를 추출해서 사용 (횟수 기반: 3, 10 등)
  - C) 둘 다 필요하면 어떤 값을 우선?

**결정**:
- 회원권=횟수권 : 회원권 결제 시 횟수를 차감하고 매출 집계 시 [실제 회원권 판매액/횟수]로 집계
- 횟수는 상세메뉴명에 포함된 횟수를 추출해서 사용

---

### 7. 재방raw 시트 활용

**현재 상황**:
- data 시트의 '방문' 컬럼에 이미 방문유형 있음 (5,425건 전체)
- 재방raw 시트는 3,603건

**관련 DB 테이블**:
```
visits
└── visit_type: 'new' | 'returning' | 'substitute'

# Excel 매핑
신규 → new
재방 → returning
대체 → substitute
소개 → returning (?)
손님 → returning (?)
```

**질문**:
- [ ] 재방raw 시트를 별도로 사용해야 하나요?
- [ ] 아니면 data 시트의 '방문' 컬럼만 사용해도 되나요?

**결정**:
- 마이그레이션 대상 데이터는 'data'탭의 데이터 only
- 다른 탭 데이터는 무시
- 신규(신규고객), 재방(재방고객), 대체(다른 담당자가 시술, 담당자가 바쁘거나 휴무인 경우 대신 시술), 소개(신규에 포함, 고객소개로 구분하기 위함), 손님(구분할 필요 없는 고객, 예. 블로거 등)

---

### 8. 메모 컬럼 활용

**현재 상황**:
- Excel의 '메모' 컬럼(29)에 데이터 존재

**관련 DB 테이블**:
```
# 현재 memo 컬럼이 있는 테이블
customers.memo ← 고객 메모
# visits에는 memo 없음
# sale_line_items에도 memo 없음
```

**질문**:
- [ ] 메모를 어디에 저장할까요?
  - A) Visit.memo (없으면 컬럼 추가 필요)
  - B) SaleLineItem에 memo 컬럼 추가
  - C) 무시

**결정**:
- "메모"컬럼이 필요
---

## 결정 요약

| # | 항목 | 관련 테이블 | 결정 |
|---|------|------------|------|
| 1 | 회원권 사용 매칭 | prepaid_usages | |
| 2 | 정액권 사용 추적 | payments / prepaid_usages | |
| 3 | 외국인관광객 | customers | |
| 4 | 점판 vendor | products, vendors | |
| 5 | 할인율 100% | sale_line_items | |
| 6 | 회원권 value_amount | prepaid_plans | |
| 7 | 재방raw 시트 | visits | |
| 8 | 메모 컬럼 | ? | |

---

## 주요 제약 조건 요약


| 테이블 | 제약 | Excel 상황 | 해결 필요 |
|--------|------|-----------|----------|
| `customers.phone` | **필수** | 없음 | 모델 수정 필요 |
| `products.vendor_id` | **필수** | 없음 | 기본 벤더 생성 |
| `services.list_price` | **필수** | 판매가로 대체 | OK |
| `sale_line_items.item_type` | service/product | 시술/점판 | OK |
| `payments.method` | enum | 매핑 필요 | OK |
| `visits.status` | draft/finalized | 없음 | finalized로 |
