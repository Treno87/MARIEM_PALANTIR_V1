# Code Review Report

> 2026-02-05 전체 프로젝트 코드 리뷰 결과
> 분석 영역: 모델, 컨트롤러/라우트, 서비스/스키마, 프론트엔드, 테스트 커버리지
>
> **최종 업데이트**: 2026-02-06 (P0/P1 수정 반영)

---

## CRITICAL (즉시 수정 필요)

### CR-001. 멀티테넌시 안전장치 부재

- **상태**: `[ ]` 미해결
- **위치**: `app/models/concerns/store_scoped.rb`
- **설명**: `CLAUDE.md`에 `acts_as_tenant` 사용이 명시되어 있지만, 실제로는 수동 `StoreScoped` concern만 사용 중. `current_store.visits.find(id)` 패턴에 의존하고 있어, `Visit.find(id)`를 직접 호출하면 다른 매장 데이터에 접근 가능.
- **영향**: 테넌트 간 데이터 누출 가능
- **해결 방안**: `acts_as_tenant` gem 도입 또는 `default_scope` 기반 자동 스코핑 적용

### CR-002. Pundit 권한 제어 미구현

- **상태**: `[ ]` 미해결
- **위치**: 모든 컨트롤러
- **설명**: Tech Stack에 Pundit이 명시되어 있지만, 어떤 컨트롤러에도 `authorize` 호출이 없음. STYLIST 권한의 사용자가 고객 삭제, 재고 관리, 매출 무효화 등 모든 작업을 수행할 수 있음.
- **영향**: 역할 기반 접근 제어 없음
- **해결 방안**: Policy 클래스 생성 및 컨트롤러에 `authorize` 적용

### CR-003. 테스트 커버리지 심각한 부족

- **상태**: `[ ]` 미해결
- **위치**: `spec/` 전체
- **설명**:
  - 모델: 24/25개 스펙 없음 (유일한 visit_spec도 visit_type만 테스트)
  - 서비스: `VisitCreationService`, `ReportService` 스펙 없음
  - Ledger: `PrepaidLedger`, `PointLedger`, `InventoryLedger` 스펙 없음
  - 컨트롤러: Web 컨트롤러 13개 전부 스펙 없음
  - 팩토리: 10개 모델에 Factory 없음
- **영향**: 리그레션 탐지 불가, 리팩토링 안전망 없음
- **해결 방안**: 핵심 모델/서비스부터 단계적 테스트 추가

### CR-004. JWT 토큰 폐기 검증 누락

- **상태**: `[x]` ✅ 해결 (2026-02-05)
- **위치**: `app/controllers/api/base_controller.rb:27`
- **설명**: `sign_out`에서 `jti`를 교체하지만, `authenticate_user!`에서 `jti`를 검증하지 않아 로그아웃된 토큰이 계속 유효함.
- **영향**: 로그아웃 후에도 이전 토큰으로 API 접근 가능
- **수정**: `authenticate_user!`에서 `jwt_payload["jti"] == user.jti` 검증 추가

---

## HIGH (빠른 시일 내 수정)

### CR-005. 스키마-모델 불일치 (vendor_id)

- **상태**: `[x]` ✅ 해결 (2026-02-05)
- **위치**: `app/models/product.rb:6`, `app/models/inventory_purchase.rb:6`
- **설명**: `belongs_to :vendor, optional: true` vs 스키마 `vendor_id null: false`. 모델은 nil 허용, DB는 필수.
- **영향**: 런타임 에러 또는 데이터 불일치
- **수정**: 마이그레이션으로 vendor_id nullable 변경 + 모델 `optional: true` 유지

### CR-006. Race Condition (동시성 문제)

- **상태**: `[x]` ✅ 해결 (2026-02-05)
- **위치**: `app/models/prepaid_ledger.rb:20-38`, `app/models/point_ledger.rb:27-37`
- **설명**: 잔액 확인과 차감이 트랜잭션으로 감싸지지 않아 이중 차감 가능
- **영향**: 정액권/포인트 이중 사용, 잔액 불일치
- **수정**: `ActiveRecord::Base.transaction` + 비관적 잠금(`lock!`) 적용

### CR-007. N+1 쿼리 다수 존재

- **상태**: `[ ]` 미해결
- **위치**: 여러 파일
  - `app/models/customer.rb:21-23` — `available_prepaid_sales` N+1 in N+1
  - `app/services/report_service.rb:40` — `by_staff`에서 staff N+1
  - `app/models/product.rb:30-31` — `current_stock` 루프 내 쿼리
  - `app/controllers/api/visits_controller.rb:89` — `service`/`product` includes 누락
- **영향**: 데이터 증가 시 성능 급격히 저하
- **해결 방안**: `includes`, SQL 집계, 캐싱 적용

### CR-008. Strong Parameter 보안 문제

- **상태**: `[x]` ✅ 해결 (2026-02-05)
- **위치**:
  - `app/controllers/api/visits_controller.rb:44` — `:status` permit
  - `app/controllers/transactions/sale_line_items_controller.rb:49` — `:points_earned`, `:prepaid_used` permit
- **영향**: 워크플로우 우회, 임의 포인트/정액권 사용 주장 가능
- **수정**: `:status`, `:points_earned`, `:prepaid_used`를 permit 목록에서 제거

### CR-009. API 페이지네이션 전무

- **상태**: `[ ]` 미해결
- **위치**: 모든 API index 액션
- **설명**: `Pagy`가 include되어 있지만 어떤 index 액션에서도 사용되지 않음. 모든 레코드를 메모리에 로드.
- **영향**: 데이터 증가 시 응답 시간 급증, 메모리 초과
- **해결 방안**: 모든 index 액션에 Pagy 페이지네이션 적용

### CR-010. 프론트엔드 API 클라이언트 이중화

- **상태**: `[ ]` 미해결
- **위치**: `frontend/src/api/client.ts` vs `frontend/src/lib/api.ts`
- **설명**: Axios 기반(인증 O)과 Fetch 기반(인증 X) 클라이언트 공존. `useApi` 훅은 인증 없는 클라이언트 사용.
- **영향**: API 호출 실패, 인증 불일치
- **해결 방안**: 하나의 API 클라이언트로 통합

### CR-011. 프론트엔드 로직 중복

- **상태**: `[ ]` 미해결
- **위치**:
  - `frontend/src/components/sale/SalePage.tsx` — `useCart`, `useCustomerBalance` 미사용
  - `frontend/src/components/sales/SalesListPage.tsx` — `useSalesTable` 미사용
  - `frontend/src/components/customers/CustomersPage.tsx` — `useCustomerTable` 미사용
- **영향**: 유지보수 어려움, 버그 수정 시 여러 곳 수정 필요
- **해결 방안**: 기존 커스텀 훅 활용으로 리팩토링

---

## MEDIUM (개선 권장)

### CR-012. NOT NULL 제약조건 누락 (19개 컬럼)

- **상태**: `[ ]` 미해결
- **위치**: `db/schema.rb`
- **설명**: 모델에서 `validates :name, presence: true`하지만 DB에는 `null: false`가 없는 컬럼 19개. (`stores.name`, `customers.name`, `visits.status`, `visits.visited_at`, `payments.method`, `payments.amount` 등)
- **해결 방안**: 마이그레이션으로 NOT NULL 제약조건 추가

### CR-013. Unique Index 누락 (7개 테이블)

- **상태**: `[ ]` 미해결
- **위치**: `db/schema.rb`
- **설명**: `find_or_create_by!` 사용하는 테이블에 unique index 없음. (`customers[store_id, name]`, `vendors[store_id, name]` 등)
- **해결 방안**: 마이그레이션으로 unique index 추가

### CR-014. 서비스 객체 위치 오류

- **상태**: `[ ]` 미해결
- **위치**: `app/models/pricing_calculator.rb`, `prepaid_ledger.rb`, `point_ledger.rb`, `inventory_ledger.rb`
- **설명**: ActiveRecord 모델이 아닌 클래스가 `app/models/`에 위치
- **해결 방안**: `app/services/`로 이동

### CR-015. Void 시 부작용 미처리

- **상태**: `[ ]` 미해결
- **위치**: `app/models/visit.rb:57-59`
- **설명**: `void!`에서 `voided_at`만 설정하고 포인트, 정액권 사용, 재고 이벤트를 되돌리지 않음
- **해결 방안**: `VoidService` 생성하여 관련 트랜잭션 모두 롤백

### CR-016. ReportService 인덱스 무효화 쿼리

- **상태**: `[ ]` 미해결
- **위치**: `app/services/report_service.rb:79`
- **설명**: `DATE(visited_at) = ?`는 함수 래핑으로 인덱스 사용 불가
- **해결 방안**: Range 쿼리로 변경 (`visited_at BETWEEN ? AND ?`)

### CR-017. authToken 문자열 하드코딩 (7곳)

- **상태**: `[ ]` 미해결
- **위치**: `frontend/src/api/client.ts`, `endpoints.ts`, `contexts/AuthContext.tsx`
- **해결 방안**: 상수로 추출

### CR-018. Customer 타입 이중 정의

- **상태**: `[ ]` 미해결
- **위치**: `frontend/src/api/types.ts` (id: number) vs `frontend/src/contexts/CustomerContext.tsx` (id: string)
- **해결 방안**: 타입 통합 또는 명확한 네이밍 분리

### CR-019. Devise Registration 공개

- **상태**: `[ ]` 미해결
- **위치**: `config/routes.rb:4`, `app/models/user.rb:8`
- **설명**: 누구나 `POST /users`로 회원가입 가능
- **해결 방안**: `:registerable` 제거 또는 라우트 제한

### CR-020. 메모리 누수 위험

- **상태**: `[ ]` 미해결
- **위치**: `frontend/src/components/landing/LandingPage.tsx:34-47`, `frontend/src/hooks/useAIMessageGenerator.ts:239-248`
- **설명**: `requestAnimationFrame`, `setTimeout` cleanup 없음
- **해결 방안**: useEffect cleanup 함수에서 취소

---

## LOW (참고 사항)

### CR-021. Payment 모델의 `method` 컬럼명이 Ruby 예약어

- **상태**: `[ ]` 미해결
- **위치**: `app/models/payment.rb:11`

### CR-022. LIKE 검색 와일드카드 미이스케이프

- **상태**: `[ ]` 미해결
- **위치**: `app/controllers/customers_controller.rb:9`, `app/controllers/api/customers_controller.rb:11-12`

### CR-023. Date.now() ID 생성 (충돌 가능)

- **상태**: `[ ]` 미해결
- **위치**: Context 파일 10곳+

### CR-024. Boolean 컬럼 기본값 없음 (active)

- **상태**: `[ ]` 미해결
- **위치**: `products`, `services`, `staff_members`, `prepaid_plans` 테이블

### CR-025. Excel Import 스펙이 외부 파일 의존

- **상태**: `[ ]` 미해결
- **위치**: `spec/services/excel_import/`

### CR-026. spec_helper.rb 베스트 프랙티스 전부 주석 처리

- **상태**: `[ ]` 미해결
- **위치**: `spec/spec_helper.rb:49-93`

### CR-027. 색상 배열 4개 파일에 중복 정의

- **상태**: `[ ]` 미해결
- **위치**: `StaffPage`, `StaffFormModal`, `sale/constants`, `constants/colors`

### CR-028. 정의된 라우트에 컨트롤러 없음 (5개)

- **상태**: `[ ]` 미해결
- **위치**: `config/routes.rb:68-84` — `prepaid/sales`, `points/transactions`, `inventory/events`, `inventory/stock`, `inventory/purchase_items`

### CR-029. CatalogContext provider value useMemo 미사용

- **상태**: `[ ]` 미해결
- **위치**: `frontend/src/contexts/CatalogContext.tsx:343-382`

### CR-030. 네이티브 alert()/confirm() 사용 (16곳)

- **상태**: `[ ]` 미해결
- **위치**: `SalePage`, `SalesListPage`, `CustomersPage`

---

## 요약 통계

| 심각도 | 건수 | 해결 | 미해결 | 핵심 키워드 |
|--------|------|------|--------|-------------|
| CRITICAL | 4 | 2 | 2 | ~~JWT~~, ~~Strong Param~~, 멀티테넌시, 권한, 테스트 |
| HIGH | 7 | 2 | 5 | ~~Race condition~~, ~~스키마 불일치~~, N+1, 페이지네이션, 프론트 아키텍처 |
| MEDIUM | 9 | 0 | 9 | NOT NULL, Unique Index, 코드 위치, Void, 타입 |
| LOW | 10 | 0 | 10 | 예약어, 와일드카드, 기본값, 중복 코드 |

## 수정 이력

### 2026-02-05 (1차 수정)
- ✅ **CR-004** JWT jti 검증 추가
- ✅ **CR-005** vendor_id 스키마-모델 불일치 수정
- ✅ **CR-006** PrepaidLedger/PointLedger race condition 수정 (transaction + lock!)
- ✅ **CR-008** Strong Parameter 보안 강화

### 2026-02-06 (2차 코드 리뷰 P0/P1 수정)

2차 코드 리뷰는 API 연동 코드에 대한 집중 리뷰로, 별도 P0/P1 분류를 사용함.

#### P0 (Critical) - 모두 해결
| # | 이슈 | 수정 파일 | 상태 |
|---|------|-----------|------|
| P0-1 | visits API date_from/date_to 서버사이드 필터링 | `visits_controller.rb`, `useVisitsApi.ts`, `endpoints.ts` | ✅ |
| P0-2 | SalesListPage 클라이언트 필터링 → 서버 필터링 전환 | `SalesListPage.tsx` | ✅ |
| P0-3 | customers 집계에서 voided visits 제외 | `customers_controller.rb` | ✅ |

#### P1 (Important) - 모두 해결
| # | 이슈 | 수정 파일 | 상태 |
|---|------|-----------|------|
| P1-4 | staff 보강 로직 3중 중복 → enrichSaleWithStaff 통합 | `apiMappers.ts`, `SalesPage.tsx`, `SalesListPage.tsx` | ✅ |
| P1-5 | hasToken 패턴 3곳 → useAuth().isAuthenticated 통합 | `StaffContext.tsx`, `SalesListPage.tsx`, `CustomersPage.tsx` | ✅ |
| P1-6 | API mutation + Context 동시 업데이트 제거 | `CustomersPage.tsx` | ✅ |

## 남은 수정 우선순위

1. **CR-001** 멀티테넌시 강화 (acts_as_tenant 도입)
2. **CR-002** Pundit 권한 구현
3. **CR-003** 핵심 테스트 작성
4. **CR-007** N+1 쿼리 해결
5. **CR-009** API 페이지네이션 적용
6. 나머지 MEDIUM → LOW 순
