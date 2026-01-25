# Excel 데이터 임포트 계획

> Excel 파일 `mariem_db_20260117.xlsx`의 데이터를 백엔드 DB에 임포트하는 계획
>
> **작성일**: 2026-01-25

## 1. 데이터 분석 요약

### Excel 시트 구조
| 시트명 | 행 수 | 용도 | 임포트 대상 |
|--------|-------|------|-------------|
| data | 5,425 | 거래 데이터 (시술/상품 판매) | **O** |
| 재방raw | 3,603 | 방문 유형 정보 | X (data 시트 '방문' 컬럼 사용) |
| 급여집계(횡) | 67 | 급여 계산용 집계 | X |
| 급여집계(종) | 30 | 급여 계산용 집계 | X |

### Excel 컬럼 인덱스
```
0: 년도, 1: 월, 2: 고객명, 3: 성별, 4: 구분, 5: 메뉴, 6: 상세메뉴, 7: 수량,
8: 담당, 9: 판매가, 10: 할인율, 11: 할인액, 12: 이벤트명, 13: 결제액,
14: 현금, 15: 현금발행, 16: 카드, 17: 통장, 18: 통장발행, 19: Pay,
20: 기타, 21: 정액, 22: 회원권, 23: 외상, 24: 결제P, 25: 적립P,
26: 방문, 27: 영업구분, 28: 카드.1, 29: 메모, 30: 방문일자
```

### Excel 고유 값 분석
| 컬럼 | 고유값 |
|------|--------|
| 구분 | `시술`, `회원`, `점판`, `정액`, `외상` |
| 담당 | `매장`, `심일보원장`, `원용중대표원장`, `장다솜`, `정재희` (5명) |
| 메뉴 | `컷`, `펌`, `염색`, `두피케어`, `모발크리닉`, `세트메뉴` 외 22개 |
| 방문 | `신규`, `재방`, `대체`, `소개`, `손님` |

---

## 상세 데이터 매핑

### 1. StaffMember (담당자)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| 담당 (8) | `staff_members.name` | "장다솜", "정재희" |
| - | `staff_members.store_id` | Store.first.id |
| - | `staff_members.active` | true |
| - | `staff_members.role_title` | "디자이너" (기본값) |

**생성되는 레코드**: 5개
```
장다솜, 정재희, 심일보원장, 원용중대표원장, 매장
```

### 2. ServiceCategory (메뉴 카테고리)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| 메뉴 (5) | `service_categories.name` | "컷", "펌", "염색" |
| - | `service_categories.store_id` | Store.first.id |

**생성되는 레코드**: 22개 (고유 메뉴값)
```
컷, 펌, 염색, 두피케어, 모발크리닉, 세트메뉴, Styling,
아윤채, 르벨, 에코레비, 도테라, 더 조각, jp인터네셔널,
상품권, 이벤트, 외상대수금, 외국인관광객,
50만원권(카), 50만원권(현), 100만원권(카), 100만원권(현), 30만원상품권
```

### 3. Service (시술 메뉴)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| 상세메뉴 (6) | `services.name` | "디자이너 여성커트", "다운펌" |
| 메뉴 (5) | `services.service_category_id` | FK → service_categories |
| 판매가 (9) | `services.list_price` | 40000 (기본가) |
| - | `services.store_id` | Store.first.id |
| - | `services.active` | true |

**생성 조건**: `구분 == '시술'`인 행의 `상세메뉴` 고유값

### 3-1. Vendor (벤더/브랜드) - 점판용

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| 메뉴 (5) | `vendors.name` | "아윤채", "르벨", "도테라" |
| - | `vendors.store_id` | Store.first.id |

**생성 조건**: `구분 == '점판'`인 행의 `메뉴` 고유값
**생성되는 레코드**: 6개 (아윤채, 르벨, 더 조각, 도테라, jp인터네셔널, 에코레비)

### 3-2. Product (상품) - 점판용

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| 상세메뉴 (6) | `products.name` | "에어리베일 리브인폼", "프로폴리쉬오일" |
| 메뉴 (5) | `products.vendor_id` | FK → vendors (메뉴명으로 매칭) |
| 판매가 (9) | `products.default_retail_unit_price` | 30000 |
| - | `products.store_id` | Store.first.id |
| - | `products.active` | true |

**생성 조건**: `구분 == '점판'`인 행의 `상세메뉴` 고유값

### 4. Customer (고객)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| 고객명 (2) | `customers.name` | "김정기", "조연수" |
| 성별 (3) | `customers.memo` | "성별: 여" |
| - | `customers.store_id` | Store.first.id |

**생성되는 레코드**: 고객명 고유값 수

**특수 케이스: 외국인관광객**
- "외국인관광객" 고객명은 개별 저장
- 같은 날짜라도 결제 행이 다르면 다른 고객
- 형식: "외국인관광객1", "외국인관광객2", ...
- 순번은 해당 날짜 내 순서 또는 전체 순서

**동명이인 처리**
- (이름 + 성별) 조합으로 구분
- 예: "김민성(여)", "김민성(남)"은 다른 고객

### 5. Visit (방문/거래)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| 방문일자 (30) | `visits.visited_at` | 2026-01-17 00:00:00 |
| 고객명 (2) | `visits.customer_id` | FK → customers |
| 방문 (26) | `visits.visit_type` | "returning" |
| 메모 (29) | `visits.memo` | 메모 내용 |
| - | `visits.store_id` | Store.first.id |
| - | `visits.status` | "finalized" |
| (계산) | `visits.subtotal_amount` | SUM(sale_line_items.list_unit_price * qty) |
| (계산) | `visits.total_amount` | SUM(sale_line_items.net_total) |

**visit_type 매핑**:
| Excel 값 | DB 값 | 설명 |
|---------|-------|------|
| 신규 | `new` | 신규 고객 |
| 재방 | `returning` | 재방문 고객 |
| 대체 | `substitute` | 다른 담당자가 대신 시술 |
| 소개 | `referral` | 소개로 방문한 신규 고객 |
| 손님 | `guest` | 구분 불필요 (예: 블로거) |

**모델 수정 필요**:
```ruby
# app/models/visit.rb
VISIT_TYPES = %w[new returning substitute referral guest].freeze
VISIT_TYPE_MAP = {
  "신규" => "new",
  "재방" => "returning",
  "대체" => "substitute",
  "소개" => "referral",
  "손님" => "guest"
}.freeze
```

**생성 규칙**: 같은 고객 + 같은 방문일자 = 1개의 Visit

### 6. SaleLineItem (거래 항목)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| - | `sale_line_items.visit_id` | FK → visits |
| 구분 (4) | `sale_line_items.item_type` | "service" / "product" |
| 상세메뉴 (6) | `sale_line_items.service_id` | FK → services |
| 담당 (8) | `sale_line_items.staff_id` | FK → staff_members |
| 수량 (7) | `sale_line_items.qty` | 1 |
| 판매가 (9) | `sale_line_items.list_unit_price` | 40000 |
| 할인율 (10) | `sale_line_items.discount_rate` | 30.0 (%) |
| 할인액 (11) | `sale_line_items.discount_amount` | 12000 |
| 결제액 (13) | `sale_line_items.net_total` | 28000 |
| (계산) | `sale_line_items.net_unit_price` | net_total / qty |
| - | `sale_line_items.store_id` | Store.first.id |

**item_type 매핑**:
| Excel 구분 | DB item_type |
|-----------|--------------|
| 시술 | `service` |
| 점판 | `product` |
| 정액 | `prepaid` |
| 회원 | (→ PrepaidSale로 분리) |
| 외상 | `credit` |

**생성되는 레코드**: 5,425개 (Excel 행 수)

### 7. Payment (결제)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| - | `payments.visit_id` | FK → visits |
| 현금 (14) | `payments.amount` (method: `cash`) | 32,067,300원 (108건) |
| 카드 (16) | `payments.amount` (method: `card`) | 230,106,650원 (1,512건) |
| 통장 (17) | `payments.amount` (method: `bank`) | 25,700,800원 (155건) |
| Pay (19) | `payments.amount` (method: `pay`) | 103,816,786원 (1,878건) |
| 기타 (20) | `payments.amount` (method: `other`) | 454,864원 (3건) |
| 정액 (21) | `payments.amount` (method: `prepaid`) | 65,774,250원 (903건) |
| 외상 (23) | `payments.amount` (method: `credit`) | 323,200원 (4건) |
| - | `payments.store_id` | Store.first.id |

**생성 규칙**: 각 결제 컬럼 값이 0보다 크면 해당 method로 Payment 생성
**생성되는 레코드 예상**: ~4,500건 (여러 결제수단 사용 시 복수 생성)

### 8. PrepaidSale (회원권/정액권 구매)

#### 8-1. 회원권 (구분='회원') - 횟수권

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| - | `prepaid_sales.customer_id` | FK → customers |
| 방문일자 (30) | `prepaid_sales.sold_at` | 2026-01-16 |
| 담당 (8) | `prepaid_sales.seller_staff_id` | FK → staff_members |
| 판매가 (9) | `prepaid_sales.amount_paid` | 51000 |
| (추출) | `prepaid_sales.value_amount` | 3 (이름에서 횟수 추출) |
| 상세메뉴 (6) | `prepaid_sales.prepaid_plan_id` | FK → prepaid_plans |
| - | `prepaid_sales.store_id` | Store.first.id |

**횟수 추출 로직**:
```ruby
# 상세메뉴 이름에서 횟수 추출
def extract_count(name)
  match = name.match(/(\d+)\s*회/)
  match ? match[1].to_i : 1
end

# 예시:
# "남자커트3회권" → 3
# "두피관리 10회" → 10
# "페이스관리" → 1 (횟수 없으면 1회로 간주)
```

**생성 조건**: `구분 == '회원'`인 행

#### 8-2. 정액권 (구분='정액') - 금액권

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| - | `prepaid_sales.customer_id` | FK → customers |
| 방문일자 (30) | `prepaid_sales.sold_at` | 2026-01-16 |
| 담당 (8) | `prepaid_sales.seller_staff_id` | FK → staff_members |
| 판매가 (9) | `prepaid_sales.amount_paid` | 500000 |
| 판매가 (9) | `prepaid_sales.value_amount` | 500000 (금액 = 충전액) |
| 상세메뉴 (6) | `prepaid_sales.prepaid_plan_id` | FK → prepaid_plans |
| - | `prepaid_sales.store_id` | Store.first.id |

**생성 조건**: `구분 == '정액'`인 행

### 9. PrepaidUsage (회원권/정액권 사용)

#### 9-1. 회원권 사용 (횟수 차감)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| - | `prepaid_usages.customer_id` | FK → customers |
| - | `prepaid_usages.visit_id` | FK → visits |
| - | `prepaid_usages.prepaid_sale_id` | FK → prepaid_sales (FIFO) |
| 회원권 (22) | `prepaid_usages.amount_used` | 1 (1회 사용) |
| 방문일자 (30) | `prepaid_usages.used_at` | 2026-01-17 |
| - | `prepaid_usages.store_id` | Store.first.id |

**생성 조건**: `회원권 (22)` 컬럼 값이 0보다 큰 행
**FIFO 매칭**: 해당 고객의 가장 오래된 잔여 횟수 있는 PrepaidSale에서 차감
**생성되는 레코드**: 696건

#### 9-2. 정액권 사용 (금액 차감)

| Excel 컬럼 | DB 컬럼 | 저장값 예시 |
|-----------|---------|------------|
| - | `prepaid_usages.customer_id` | FK → customers |
| - | `prepaid_usages.visit_id` | FK → visits |
| - | `prepaid_usages.prepaid_sale_id` | FK → prepaid_sales (FIFO) |
| 정액 (21) | `prepaid_usages.amount_used` | 50000 (금액) |
| 방문일자 (30) | `prepaid_usages.used_at` | 2026-01-17 |
| - | `prepaid_usages.store_id` | Store.first.id |

**생성 조건**: `정액 (21)` 컬럼 값이 0보다 큰 행
**FIFO 매칭**: 해당 고객의 가장 오래된 잔액 있는 PrepaidSale에서 차감
**참고**: Payment(method: prepaid)도 함께 생성됨

---

## 임포트 제외 데이터

| Excel 컬럼 | 사유 |
|-----------|------|
| 현금발행 (15) | 영수증 발행 여부 - DB 미지원 |
| 통장발행 (18) | 영수증 발행 여부 - DB 미지원 |
| 이벤트명 (12) | 할인 이유 메모용 - memo에 포함 가능 |
| 결제P (24) | 포인트 결제 - 별도 구현 필요 |
| 적립P (25) | 포인트 적립 - 별도 구현 필요 |
| 영업구분 (27) | 미사용 |
| 카드.1 (28) | 중복 컬럼 |
| 급여집계 시트 | 집계용 데이터 - 원본 아님 |

## 2. 기존 패턴 분석

### 발견된 패턴
1. **db/seeds.rb**: `find_or_create_by!` 사용, 계층적 생성 순서
2. **VisitCreationService**: Result 구조체, ActiveRecord 트랜잭션
3. **lib/tasks/update_visit_types.rake**: Roo gem으로 Excel 읽기, 배치 업데이트

### 멀티테넌시
- 모든 모델이 `StoreScoped` concern 포함
- 쿼리 시 `store_id` 필터링 필수

## 3. 임포트 전략

### Phase 1: 마스터 데이터 추출 및 생성
**대상**: StaffMember, ServiceCategory, Service
**소스**: data 시트의 '담당', '메뉴', '상세메뉴' 컬럼에서 고유 값 추출

```
1. 담당자(StaffMember) 목록 추출 → find_or_create_by
2. 메뉴(ServiceCategory) 목록 추출 → find_or_create_by
3. 상세메뉴(Service) 목록 추출 → find_or_create_by (category 연결)
```

### Phase 2: 고객 데이터 생성
**대상**: Customer
**소스**: data 시트의 '고객명', '성별' 컬럼에서 고유 값 추출

```
1. (고객명, 성별) 조합으로 고유 고객 추출
2. find_or_create_by(store: store, name: name)
3. 성별은 memo에 기록
```

### Phase 3: 거래 데이터 생성
**대상**: Visit, SaleLineItem, Payment
**소스**: data 시트 전체 행 (5,425건)

```
핵심 로직:
1. 같은 고객 + 같은 방문일자 = 하나의 Visit
2. 각 Excel 행 = 하나의 SaleLineItem
3. 결제 컬럼(현금/카드/Pay/정액 등)이 0보다 크면 Payment 생성

중복 방지:
- (customer_id, visited_at) 기준으로 기존 Visit 확인
- 이미 존재하면 skip 또는 update
```

### Phase 4: 방문 유형 업데이트
**대상**: visits.visit_type
**소스**: data 시트의 '방문' 컬럼 또는 재방raw 시트

```
visit_type 매핑:
- "신규" → "new"
- "재방" → "returning"
- "대체" → "substitute"
```

## 4. 구현 계획

### 파일 구조
```
lib/tasks/
└── import_excel.rake          # Rake task 진입점

app/services/excel_import/
├── base_importer.rb           # 공통 로직 (Roo, 에러 처리)
├── master_data_importer.rb    # StaffMember, ServiceCategory, Service
├── customer_importer.rb       # Customer
├── visit_importer.rb          # Visit, SaleLineItem, Payment
└── visit_type_updater.rb      # visit_type 업데이트
```

### Rake Task 실행 명령
```bash
# 전체 임포트 (마스터 → 고객 → 거래 → 방문유형)
rails import:excel[mariem_db_20260117.xlsx]

# 단계별 실행 (디버깅용)
rails import:excel:master[mariem_db_20260117.xlsx]
rails import:excel:customers[mariem_db_20260117.xlsx]
rails import:excel:visits[mariem_db_20260117.xlsx]
rails import:excel:visit_types[mariem_db_20260117.xlsx]
```

### 의존성
- `roo` gem (이미 설치됨 - update_visit_types.rake에서 사용 중)

## 5. 데이터 무결성 규칙

### 필수 검증
- [ ] 방문일자가 유효한 날짜인지
- [ ] 판매가, 결제액이 숫자인지
- [ ] 담당자가 StaffMember에 존재하는지 (없으면 생성)
- [ ] 메뉴/상세메뉴가 Service에 존재하는지 (없으면 생성)

### 에러 처리
- 행 단위 에러 로깅 (실패해도 다음 행 계속 처리)
- 최종 요약 출력: 성공/실패/스킵 건수

### 중복 처리 전략
| 엔티티 | 중복 기준 | 처리 방식 |
|--------|----------|----------|
| Customer | (store_id, name) | find_or_create_by |
| StaffMember | (store_id, name) | find_or_create_by |
| ServiceCategory | (store_id, name) | find_or_create_by |
| Service | (store_id, service_category_id, name) | find_or_create_by |
| Visit | (store_id, customer_id, visited_at) | find_or_create_by |

## 6. 성능 고려사항

- 배치 처리: 100건 단위 트랜잭션
- N+1 방지: includes/preload 사용
- 메모리: Roo의 `each_row_streaming` 사용

## 7. 검증 계획

### 임포트 전
```bash
rails console
Customer.count  # 기존 고객 수
Visit.count     # 기존 거래 수
```

### 임포트 후
```bash
rails console
Customer.count  # 예상: 기존 + 신규 고객 수
Visit.count     # 예상: 5,425 이하 (중복 제거됨)
SaleLineItem.count  # 예상: 5,425
Payment.count   # 예상: 다수 (여러 결제수단 분리)
```

### 데이터 정합성 확인
```sql
-- 방문일자 범위 확인
SELECT MIN(visited_at), MAX(visited_at) FROM visits;

-- 담당자별 거래 건수
SELECT s.name, COUNT(*) FROM sale_line_items sli
JOIN staff_members s ON sli.staff_id = s.id
GROUP BY s.name;

-- 결제수단별 합계
SELECT method, SUM(amount) FROM payments GROUP BY method;
```

## 8. 수정 대상 파일

| 파일 | 작업 |
|------|------|
| `lib/tasks/import_excel.rake` | 새로 생성 |
| `app/services/excel_import/base_importer.rb` | 새로 생성 |
| `app/services/excel_import/master_data_importer.rb` | 새로 생성 |
| `app/services/excel_import/customer_importer.rb` | 새로 생성 |
| `app/services/excel_import/visit_importer.rb` | 새로 생성 |
| `app/services/excel_import/visit_type_updater.rb` | 새로 생성 |
| `spec/services/excel_import/` | 테스트 파일들 |

## 9. 결정된 사항

1. **기존 데이터 처리**: **전체 삭제 후 새로 임포트**
   - Visit, SaleLineItem, Payment, PrepaidSale, PrepaidUsage 등 거래 데이터 삭제
   - 마스터 데이터(StaffMember, Service, Customer)는 유지하거나 재생성

2. **Store 선택**: **기존 Store 중 첫 번째 사용**
   - `Store.first`로 기존 Store 사용
   - 없으면 에러 메시지 출력

3. **회원권/정액권 처리**: **PrepaidSale로 생성**
   - '구분' 컬럼이 '회원'인 행 → PrepaidSale 테이블에 저장
   - PrepaidPlan 자동 생성 (상세메뉴 기준)

## 10. 구현 순서 (TDD)

### Step 1: BaseImporter 테스트 및 구현
```ruby
# spec/services/excel_import/base_importer_spec.rb
# app/services/excel_import/base_importer.rb
- Roo gem으로 Excel 파일 로드
- 에러 핸들링 및 로깅
- 결과 집계 (성공/실패/스킵)
```

### Step 2: DataCleaner 구현 (기존 데이터 삭제)
```ruby
# lib/tasks/import_excel.rake 내 clean task
- PrepaidUsage.delete_all
- Payment.delete_all
- SaleLineItem.delete_all
- Visit.delete_all
- PrepaidSale.delete_all
- Customer.delete_all (선택)
- 마스터 데이터는 유지
```

### Step 3: MasterDataImporter 테스트 및 구현
```ruby
# spec/services/excel_import/master_data_importer_spec.rb
# app/services/excel_import/master_data_importer.rb
- StaffMember 생성
- ServiceCategory 생성
- Service 생성
- PrepaidPlan 생성 (회원권 상품용)
```

### Step 4: CustomerImporter 테스트 및 구현
```ruby
# spec/services/excel_import/customer_importer_spec.rb
# app/services/excel_import/customer_importer.rb
- 고유 고객 추출
- find_or_create_by
- 성별 → memo 저장
```

### Step 5: VisitImporter 테스트 및 구현
```ruby
# spec/services/excel_import/visit_importer_spec.rb
# app/services/excel_import/visit_importer.rb
- 구분이 '시술' 또는 '상품'인 행 처리
- Visit 생성 (같은 고객+날짜 = 하나의 Visit)
- SaleLineItem 생성
- Payment 생성 (여러 결제수단 분리)
```

### Step 6: PrepaidSaleImporter 테스트 및 구현
```ruby
# spec/services/excel_import/prepaid_sale_importer_spec.rb
# app/services/excel_import/prepaid_sale_importer.rb
- 구분이 '회원'인 행 처리
- PrepaidPlan 매칭
- PrepaidSale 생성
```

### Step 7: VisitTypeUpdater 구현
```ruby
# app/services/excel_import/visit_type_updater.rb
- 방문 컬럼으로 visit_type 업데이트
- 신규/재방/대체 → new/returning/substitute
```

### Step 8: Rake Task 통합
```ruby
# lib/tasks/import_excel.rake
namespace :import do
  namespace :excel do
    task :all => [:clean, :master, :customers, :visits, :prepaid, :visit_types]
    task :clean => :environment
    task :master => :environment
    task :customers => :environment
    task :visits => :environment
    task :prepaid => :environment
    task :visit_types => :environment
  end
end
```

## 11. 실행 명령어

```bash
# 전체 임포트 (권장)
rails import:excel:all[mariem_db_20260117.xlsx]

# 단계별 실행 (디버깅용)
rails import:excel:clean
rails import:excel:master[mariem_db_20260117.xlsx]
rails import:excel:customers[mariem_db_20260117.xlsx]
rails import:excel:visits[mariem_db_20260117.xlsx]
rails import:excel:prepaid[mariem_db_20260117.xlsx]
rails import:excel:visit_types[mariem_db_20260117.xlsx]
```

## 12. 예상 작업량

| 단계 | 파일 수 | 복잡도 |
|------|--------|--------|
| BaseImporter | 2 (spec + impl) | 낮음 |
| DataCleaner | 1 | 낮음 |
| MasterDataImporter | 2 | 중간 |
| CustomerImporter | 2 | 낮음 |
| VisitImporter | 2 | 높음 |
| PrepaidSaleImporter | 2 | 중간 |
| VisitTypeUpdater | 1 | 낮음 |
| Rake Task 통합 | 1 | 낮음 |
| **합계** | **13** | - |

---

## 13. 매핑 문제 분석 (2026-01-25 추가)

### 13.1 담당자 (StaffMember)

| 원본값 | 건수 | 문제점 |
|--------|------|--------|
| 장다솜 | 1,844 | - |
| 정재희 | 1,738 | - |
| 원용중대표원장 | 951 | 직급 포함 |
| 심일보원장 | 884 | 직급 포함 |
| 매장 | 8 | 담당자가 아님 |

**결정**: 이름 그대로 저장. "매장"도 StaffMember로 생성 (특수 케이스용)

### 13.2 구분 필드 매핑

| Excel 구분 | 건수 | DB 처리 |
|-----------|------|---------|
| 시술 | 4,897 | SaleLineItem (item_type: service) |
| 점판 | 195 | SaleLineItem (item_type: product) |
| 정액 | 178 | PrepaidSale (정액권 충전) |
| 회원 | 153 | PrepaidSale (회원권 구매) |
| 외상 | 2 | SaleLineItem + Payment(method: credit) |

### 13.3 메뉴/상세메뉴 중복 문제

**문제**: 6개 상세메뉴가 '시술'과 '회원' 구분에서 동시 사용

| 상세메뉴 | 시술 건수 | 회원 건수 | 의미 |
|---------|----------|----------|------|
| 남자커트3회권 | 224 | 85 | 시술=사용, 회원=구매 |
| 두피관리 10회 | 449 | 60 | 시술=사용, 회원=구매 |
| 페이스관리 | 20 | 4 | 시술=사용, 회원=구매 |
| 뿌염10회권 | 20 | 2 | 시술=사용, 회원=구매 |
| 독소관리10회 | 14 | 1 | 시술=사용, 회원=구매 |
| 복구클리닉 10회 | 9 | 1 | 시술=사용, 회원=구매 |

**결정**:
- 구분='회원' → PrepaidPlan + PrepaidSale 생성
- 구분='시술' + 같은 상세메뉴 → Service로 생성, 회원권 사용 시 PrepaidUsage 연결

### 13.4 동명이인 고객

**문제**: 7명의 동명이인 (성별이 다름)

| 고객명 | 여 | 남 |
|--------|---|---|
| 김민성 | 1 | 2 |
| 김지윤 | 1 | 1 |
| 박주현 | 5 | 2 |
| 윤중명 | ? | ? |
| 이상훈 | ? | ? |
| 이선우 | ? | ? |
| 임지환 | ? | ? |

**결정**: (이름 + 성별) 조합으로 구분
- Customer 생성 시 `find_or_create_by(store:, name:, memo: "성별: #{성별}")`
- 동명이인은 memo의 성별로 구분

### 13.5 방문 유형 (visit_type)

| Excel 값 | 건수 | DB 매핑 | 비고 |
|----------|------|---------|------|
| 재방 | 3,749 | `returning` | 기존 고객 재방문 |
| 신규 | 1,206 | `new` | 신규 고객 |
| 대체 | 144 | `substitute` | 다른 담당자가 대신 시술 |
| 소개 | 181 | `referral` | 소개로 방문한 신규 고객 |
| 손님 | 145 | `guest` | 구분 불필요 (예: 블로거) |

**결정**: visit_type 5가지로 확장 (new, returning, substitute, referral, guest)

### 13.6 결제 데이터 문제

#### 결제P (포인트 결제)
- 30건, 302,000원
- **결정**: Payment(method: `points`)로 생성

#### 결제액 불일치 (30건)
- 결제액 ≠ (현금 + 카드 + 통장 + Pay + 정액 + 회원권 + 외상 + 기타)
- 원인: 결제P가 누락됨
- **결정**: 결제P 포함하여 합산

#### 한 방문에 다중 행 (1,369건)
- 예: "외국인관광객" 2026-01-03 → 18개 행
- **결정**:
  - Visit는 (고객 + 날짜) 단위로 1개 생성
  - 각 행 → SaleLineItem
  - 결제는 행 단위로 Payment 생성 (0보다 큰 값만)

### 13.7 정액권/회원권 처리

| 구분 | Excel 컬럼 | 의미 | DB 처리 |
|------|-----------|------|---------|
| 정액 (구분) | 구분=정액 | 정액권 **충전** | PrepaidSale 생성 |
| 정액 (결제) | 컬럼 21 | 정액권 **사용** | Payment(method: prepaid) |
| 회원 (구분) | 구분=회원 | 회원권 **구매** | PrepaidSale 생성 |
| 회원권 (결제) | 컬럼 22 | 회원권 **사용** | PrepaidUsage 생성 |

**정액권 상세메뉴 패턴**:
```
[500,000] 원충전 (48건)
[300,000] 원충전 (44건)
[150,000] 원충전 (35건)
[1,000,000] 원충전 (30건)
...
```

**결정**:
1. 정액권 → PrepaidPlan 생성 (금액별)
2. 회원권 → PrepaidPlan 생성 (상세메뉴별: 남자커트3회권, 두피관리10회 등)

### 13.8 무시할 데이터

| 컬럼 | 사유 |
|------|------|
| 영업구분 | 전체 NULL (5,425건) |
| 현금발행/통장발행 | 영수증 발행 여부 - 미지원 |
| 카드.1 | 중복 컬럼 |
| 이벤트명 | 프로모션 정보 - 필요 시 메모에 기록 |

---

## 14. 최종 결정 사항 요약

| # | 항목 | 결정 |
|---|------|------|
| 1 | 회원권 | 횟수권 (value_amount = 횟수, 이름에서 추출) |
| 2 | 정액권 | 금액권 (value_amount = 금액) |
| 3 | 정액권/회원권 사용 | PrepaidUsage로 추적 (FIFO 차감) |
| 4 | 외국인관광객 | 개별 저장 (외국인관광객1, 2...) |
| 5 | 점판 vendor | 메뉴명 = vendor, 상세메뉴 = 제품명 |
| 6 | 할인율 100% | 허용 (무료 시술/마케팅) |
| 7 | 재방raw 시트 | 사용 안 함 (data 탭만 사용) |
| 8 | 메모 | visits.memo에 저장 |
| 9 | 방문유형 | 5가지 (new/returning/substitute/referral/guest) |
| 10 | 동명이인 | 이름+성별 조합으로 구분 |
| 11 | "매장" 담당자 | StaffMember로 생성 (특수 케이스) |
| 12 | 결제P | Payment(method: points)로 생성 |

---

## 15. 스키마 변경 필요 사항

> **주의**: 프론트엔드는 수정하지 않음. 백엔드(스키마, 모델)만 변경.

### 15.1 Visit.memo 컬럼 추가

**마이그레이션**:
```ruby
# db/migrate/xxx_add_memo_to_visits.rb
class AddMemoToVisits < ActiveRecord::Migration[8.0]
  def change
    add_column :visits, :memo, :text
  end
end
```

### 15.2 Visit.visit_type 확장

**모델 수정**:
```ruby
# app/models/visit.rb
VISIT_TYPES = %w[new returning substitute referral guest].freeze
```

### 15.3 Customer.phone 필수 해제

**모델 수정**:
```ruby
# app/models/customer.rb
# 변경 전: validates :phone, presence: true
# 변경 후: validates :phone, presence: false (또는 삭제)
```

### 15.4 스키마 변경 요약

| 변경 유형 | 대상 | 내용 |
|----------|------|------|
| 마이그레이션 | visits | memo 컬럼 추가 (text) |
| 모델 수정 | Visit | VISIT_TYPES에 referral, guest 추가 |
| 모델 수정 | Customer | phone 필수 조건 해제 |
