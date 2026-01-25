# 작업 컨텍스트 (2026-01-25)

## 현재 진행 중: Excel 데이터 임포트

### 목표
Excel 파일 `mariem_db_20260117.xlsx`의 데이터를 백엔드 DB에 임포트

### Excel 시트 구조
| 시트명 | 행 수 | 용도 | 임포트 대상 |
|--------|-------|------|-------------|
| data | 5,425 | 거래 데이터 (시술/상품 판매) | **O** |
| 재방raw | 3,603 | 방문 유형 정보 | **O** (visit_type 업데이트용) |
| 급여집계(횡) | 67 | 급여 계산용 집계 | X |
| 급여집계(종) | 30 | 급여 계산용 집계 | X |

### data 시트 컬럼 매핑
| Excel 컬럼 | DB 테이블.컬럼 | 비고 |
|-----------|---------------|------|
| 년도, 월, 방문일자 | visits.visited_at | 방문일자 우선 사용 |
| 고객명 | customers.name | find_or_create_by |
| 성별 | customers.memo | 메모에 추가 |
| 담당 | staff_members.name → sale_line_items.staff_id | |
| 구분 | - | '시술', '회원', '상품' 구분용 |
| 메뉴 | service_categories.name | |
| 상세메뉴 | services.name / products.name | |
| 수량 | sale_line_items.qty | |
| 판매가 | sale_line_items.list_unit_price | |
| 할인율 | sale_line_items.discount_rate | |
| 결제액 | sale_line_items.net_total | |
| 현금 | payments.amount (method: cash) | |
| 카드 | payments.amount (method: card) | |
| 통장 | payments.amount (method: bank) | |
| Pay | payments.amount (method: pay) | 네이버페이 |
| 정액 | payments.amount (method: prepaid) | 정액권 사용 |
| 회원권 | prepaid_usages.amount_used | 회원권 사용 |
| 방문 | visits.visit_type | 신규/재방/대체 |
| 메모 | visits 또는 customers.memo | |

### 결정된 사항
1. **기존 데이터 처리**: 전체 삭제 후 새로 임포트
2. **Store 선택**: `Store.first`로 기존 Store 사용
3. **회원권/정액권 처리**: PrepaidSale로 생성

### 구현 파일 구조
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

### 실행 명령어
```bash
# 전체 임포트
rails import:excel:all[mariem_db_20260117.xlsx]

# 단계별 실행
rails import:excel:clean
rails import:excel:master[mariem_db_20260117.xlsx]
rails import:excel:customers[mariem_db_20260117.xlsx]
rails import:excel:visits[mariem_db_20260117.xlsx]
rails import:excel:prepaid[mariem_db_20260117.xlsx]
rails import:excel:visit_types[mariem_db_20260117.xlsx]
```

### 구현 순서 (TDD)
| # | 단계 | 파일 | 상태 |
|---|------|------|------|
| 1 | BaseImporter | spec + impl | ⬜ |
| 2 | DataCleaner | rake task | ⬜ |
| 3 | MasterDataImporter | spec + impl | ⬜ |
| 4 | CustomerImporter | spec + impl | ⬜ |
| 5 | VisitImporter | spec + impl | ⬜ |
| 6 | PrepaidSaleImporter | spec + impl | ⬜ |
| 7 | VisitTypeUpdater | impl | ⬜ |
| 8 | Rake Task 통합 | lib/tasks | ⬜ |

---

## 완료된 작업

### 예약관리 페이지 (2026-01-21) ✅

**위치**: `frontend/src/components/reservations/`

**컴포넌트 구조**:
- `ReservationPage.tsx` - 메인 페이지
- `ReservationCalendar.tsx` - 상단 날짜 선택 (1~31일)
- `ReservationGrid.tsx` - 시간대별 그리드
- `ReservationBlock.tsx` - 개별 예약 블록
- `ReservationFormModal.tsx` - 예약 등록/수정 모달
- `ReservationDetailModal.tsx` - 예약 상세/취소 모달

**기능**:
- 시간대별 예약 그리드 (10:00~20:00, 30분 단위)
- 담당자별 예약 현황 표시
- 날짜 네비게이션 및 캘린더
- 예약 CRUD (등록/조회/수정/취소)
- 시술 카테고리/시술 선택 연동

**테스트**: 28개 전체 통과

---

### Backend API 구현 (2026-01-20) ✅

#### Phase 1: 필수 Gem 추가 ✅
추가된 Gem:
- `devise-jwt` (~> 0.12) - JWT 인증
- `pundit` (~> 2.4) - 권한 관리
- `rack-cors` (~> 2.0) - CORS
- `rspec-rails` (~> 7.0) - 테스트
- `factory_bot_rails` (~> 6.4) - 테스트 데이터
- `faker` (~> 3.4) - 가짜 데이터
- `shoulda-matchers` (~> 6.4) - 테스트 매처

#### Phase 2: RSpec 초기 설정 ✅
생성된 파일:
- `spec/rails_helper.rb` - RSpec 설정
- `spec/support/shoulda_matchers.rb` - Shoulda Matchers 설정
- `spec/support/api_helpers.rb` - API 테스트 헬퍼 (json_response, auth_headers)

#### Phase 3: JWT 인증 API ✅
**라우트:** `/api/auth/*`
- `POST /api/auth/sign_in` - 로그인 (JWT 토큰 반환)
- `DELETE /api/auth/sign_out` - 로그아웃 (토큰 무효화)
- `GET /api/auth/me` - 현재 사용자 정보

**생성된 파일:**
- `app/controllers/api/base_controller.rb` - API 기본 컨트롤러
- `app/controllers/api/auth_controller.rb` - 인증 컨트롤러
- `config/initializers/cors.rb` - CORS 설정
- `db/migrate/20260120054018_add_jti_to_users.rb` - JWT jti 컬럼

**테스트:** `spec/requests/api/auth_spec.rb` (9개 테스트 통과)

#### Phase 4: 기초 데이터 API ✅

**완료:**
- Customers API ✅
  - `GET /api/customers` - 목록 (검색 지원)
  - `GET /api/customers/:id` - 상세
  - `POST /api/customers` - 생성
  - `PATCH /api/customers/:id` - 수정
  - 파일: `app/controllers/api/customers_controller.rb`
  - 테스트: `spec/requests/api/customers_spec.rb` (12개 테스트 통과)

- StaffMembers API ✅
  - `GET /api/staff_members` - 목록
  - `GET /api/staff_members/:id` - 상세
  - 파일: `app/controllers/api/staff_members_controller.rb`
  - 테스트: `spec/requests/api/staff_members_spec.rb`

- ServiceCategories API ✅
  - `GET /api/service_categories` - 목록
  - `POST /api/service_categories` - 생성
  - `PATCH /api/service_categories/:id` - 수정
  - 파일: `app/controllers/api/service_categories_controller.rb`
  - 테스트: `spec/requests/api/service_categories_spec.rb` (9개 테스트 통과)

- Services API ✅
  - `GET /api/services` - 목록 (active, category_id 필터 지원)
  - `POST /api/services` - 생성
  - `PATCH /api/services/:id` - 수정
  - 파일: `app/controllers/api/services_controller.rb`
  - 테스트: `spec/requests/api/services_spec.rb` (13개 테스트 통과)

- Products API ✅
  - `GET /api/products` - 목록 (active, kind, for_sale 필터 지원)
  - `POST /api/products` - 생성
  - `PATCH /api/products/:id` - 수정
  - 파일: `app/controllers/api/products_controller.rb`
  - 테스트: `spec/requests/api/products_spec.rb` (13개 테스트 통과)

**생성된 Factory:**
- `spec/factories/stores.rb`
- `spec/factories/users.rb`
- `spec/factories/customers.rb`
- `spec/factories/staff_members.rb`
- `spec/factories/service_categories.rb`
- `spec/factories/services.rb`
- `spec/factories/vendors.rb`
- `spec/factories/products.rb`

#### Phase 5: 거래 API (visits) ✅

**완료:**
- Visits API ✅
  - `GET /api/visits` - 목록 (date, status 필터 지원)
  - `GET /api/visits/:id` - 상세 (line_items, payments 포함)
  - `POST /api/visits` - 생성 (line_items, payments 함께 생성)
  - `PUT /api/visits/:id/void` - (TODO: voided 컬럼 마이그레이션 필요)
  - 파일: `app/controllers/api/visits_controller.rb`
  - 서비스: `app/services/visit_creation_service.rb`
  - 테스트: `spec/requests/api/visits_spec.rb` (16개 테스트 통과, 2개 pending)

**생성된 Factory:**
- `spec/factories/visits.rb`
- `spec/factories/sale_line_items.rb`
- `spec/factories/payments.rb`

#### Phase 6: 리포트 API ✅

**완료:**
- Reports API ✅
  - `GET /api/reports/daily` - 일별 매출 리포트
  - `GET /api/reports/monthly` - 월별 매출 리포트
  - `GET /api/reports/by_staff` - 직원별 매출 리포트
  - `GET /api/reports/by_method` - 결제수단별 매출 리포트
  - 파일: `app/controllers/api/reports_controller.rb`
  - 서비스: `app/services/report_service.rb`
  - 테스트: `spec/requests/api/reports_spec.rb` (9개 테스트 통과)

### 완료된 Phase 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | 필수 Gem 추가 | ✅ |
| Phase 2 | RSpec 초기 설정 | ✅ |
| Phase 3 | JWT 인증 API | ✅ |
| Phase 4 | 기초 데이터 API | ✅ |
| Phase 5 | 거래 API | ✅ |
| Phase 6 | 리포트 API | ✅ |

### 남은 작업

- **없음** - 모든 Backend API 구현 완료! 🎉

## 테스트 실행 명령어

```bash
# 전체 테스트
bundle exec rspec

# 인증 API 테스트
bundle exec rspec spec/requests/api/auth_spec.rb

# Customers API 테스트
bundle exec rspec spec/requests/api/customers_spec.rb

# 모든 API 테스트
bundle exec rspec spec/requests/api/
```

## 현재 테스트 상태
- 인증 API: 9개 테스트 통과 ✅
- Customers API: 12개 테스트 통과 ✅
- StaffMembers API: 테스트 통과 ✅
- ServiceCategories API: 9개 테스트 통과 ✅
- Services API: 13개 테스트 통과 ✅
- Products API: 13개 테스트 통과 ✅
- Visits API: 18개 테스트 통과 ✅ (void 포함)
- Reports API: 9개 테스트 통과 ✅
- **전체 API 테스트: 86개 모두 통과 ✅**

## 주요 설정 파일

### JWT 설정 (config/initializers/devise.rb)
```ruby
config.jwt do |jwt|
  jwt.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY") { ... }
  jwt.dispatch_requests = [["POST", %r{^/api/auth/sign_in$}]]
  jwt.revocation_requests = [["DELETE", %r{^/api/auth/sign_out$}]]
  jwt.expiration_time = 24.hours.to_i
end
```

### API Base Controller 인증 로직
- JWT 토큰 검증
- 401 반환 (리다이렉트 대신)
- current_user, current_store 헬퍼

## 이어서 할 작업

```bash
# Backend API 구현 완료! 🎉
# 모든 테스트 통과: bundle exec rspec spec/requests/api/

# 다음 단계: Frontend와 API 연동
# 1. Frontend에서 Mock 데이터를 실제 API로 교체
# 2. React Query 설정
# 3. API 호출 유틸리티 구현
```

## 관련 파일 경로

### Controllers
- `app/controllers/api/base_controller.rb`
- `app/controllers/api/auth_controller.rb`
- `app/controllers/api/customers_controller.rb`
- `app/controllers/api/staff_members_controller.rb`
- `app/controllers/api/service_categories_controller.rb`
- `app/controllers/api/services_controller.rb`
- `app/controllers/api/products_controller.rb`
- `app/controllers/api/visits_controller.rb`
- `app/controllers/api/reports_controller.rb`

### Services
- `app/services/visit_creation_service.rb`
- `app/services/report_service.rb`

### Routes
- `config/routes.rb` (API namespace 추가됨)

### Models (JWT 관련 수정)
- `app/models/user.rb` (jwt_authenticatable 추가)

### Config
- `config/initializers/cors.rb`
- `config/initializers/devise.rb` (JWT 설정 추가)
