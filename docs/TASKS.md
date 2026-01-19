# TASKS: Mariem Palantir MVP 구현 태스크

## 진행 상태 요약

- [ ] Phase 1: 프로젝트 초기화 (0/15)
- [ ] Phase 2: DB 스키마 구현 (0/14)
- [ ] Phase 3: Backend API 구현 (0/25)
- [ ] Phase 4: Frontend 구현 (0/30)
- [ ] Phase 5: 테스트 및 배포 (0/12)

**총 진행률**: 0/96

---

## Phase 1: 프로젝트 초기화

### 1.1 Rails 8 API 프로젝트 생성
- [ ] `rails new mariem-palantir --api --database=postgresql --skip-test` 실행
- [ ] `.gitignore` 설정 확인
- [ ] `README.md` 작성

### 1.2 핵심 Gem 추가 및 설치
- [ ] Gemfile에 gem 추가
  ```ruby
  gem 'devise'
  gem 'devise-jwt'
  gem 'rack-cors'
  gem 'jbuilder'
  gem 'pundit'
  gem 'acts_as_tenant'

  group :development, :test do
    gem 'rspec-rails'
    gem 'factory_bot_rails'
    gem 'faker'
  end
  ```
- [ ] `bundle install` 실행
- [ ] `rails generate rspec:install` 실행

### 1.3 CORS 설정
- [ ] `config/initializers/cors.rb` 설정
  ```ruby
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins '*'
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head]
    end
  end
  ```

### 1.4 Frontend 설정 (Vite + React)
- [ ] `npm create vite@latest frontend -- --template react-ts` 실행
- [ ] `cd frontend && npm install` 실행
- [ ] Tailwind CSS 설치
  - [ ] `npm install -D tailwindcss postcss autoprefixer`
  - [ ] `npx tailwindcss init -p`
  - [ ] `tailwind.config.js` 설정
  - [ ] `src/index.css`에 Tailwind 지시어 추가
- [ ] shadcn/ui 설치
  - [ ] `npx shadcn@latest init` 실행
  - [ ] 기본 컴포넌트 추가 (button, input, select, table, card, dialog)
- [ ] 추가 패키지 설치
  ```bash
  npm install axios @tanstack/react-query react-router-dom
  npm install react-hook-form @hookform/resolvers zod
  npm install recharts date-fns
  npm install -D @types/node
  ```

### 1.5 Docker 환경 구성
- [ ] `Dockerfile` 생성 (Rails)
- [ ] `frontend/Dockerfile` 생성 (React)
- [ ] `docker-compose.yml` 생성
- [ ] `.dockerignore` 생성
- [ ] `docker-compose up` 테스트

---

## Phase 2: DB 스키마 구현

### 2.1 마이그레이션 생성 (순서 중요!)

#### 2.1.1 tenants (점포)
- [ ] 마이그레이션 생성
  ```bash
  rails g migration CreateTenants name:string timezone:string
  ```
- [ ] 마이그레이션 파일 수정 (NOT NULL, 기본값 추가)
- [ ] 모델 생성 및 검증 추가

#### 2.1.2 users (직원/디자이너)
- [ ] Devise 설치 및 설정
  ```bash
  rails generate devise:install
  rails generate devise User
  ```
- [ ] 마이그레이션 수정 (tenant_id, name, role, active 추가)
- [ ] 모델에 tenant 관계 및 검증 추가

#### 2.1.3 customers (고객)
- [ ] 마이그레이션 생성
  ```bash
  rails g migration CreateCustomers tenant:references name:string phone:string memo:text status:string first_visit_at:date
  ```
- [ ] 유니크 제약조건 추가 (tenant_id, phone)
- [ ] 모델 생성 및 검증 추가

#### 2.1.4 catalog_categories (카테고리)
- [ ] 마이그레이션 생성
- [ ] 유니크 제약조건 추가 (tenant_id, name)
- [ ] 모델 생성

#### 2.1.5 catalog_items (시술/상품)
- [ ] 마이그레이션 생성 (kind, name, base_price, active)
- [ ] 유니크 제약조건 추가 (tenant_id, kind, name)
- [ ] 모델 생성 및 검증 추가

#### 2.1.6 sales (거래 헤더)
- [ ] 마이그레이션 생성 (customer_id, staff_id, sale_date, status, note)
- [ ] 인덱스 추가 (tenant_id + sale_date, tenant_id + staff_id)
- [ ] 모델 생성 및 관계 설정

#### 2.1.7 sale_items (거래 라인아이템)
- [ ] 마이그레이션 생성 (sale_id, catalog_item_id, kind, name, quantity, unit_price, line_total, meta)
- [ ] 모델 생성 및 계산 콜백 추가

#### 2.1.8 sale_discounts (할인)
- [ ] 마이그레이션 생성 (sale_id, discount_type, value, reason)
- [ ] 모델 생성 및 검증 추가

#### 2.1.9 payments (결제)
- [ ] 마이그레이션 생성 (sale_id, method, amount, paid_at, meta)
- [ ] 모델 생성 및 검증 추가

#### 2.1.10 stored_value_accounts (정액권 잔액)
- [ ] 마이그레이션 생성 (customer_id, balance)
- [ ] 유니크 제약조건 추가 (tenant_id, customer_id)
- [ ] 모델 생성

#### 2.1.11 stored_value_transactions (정액권 원장)
- [ ] 마이그레이션 생성 (account_id, sale_id, payment_id, tx_type, amount, memo)
- [ ] 모델 생성

#### 2.1.12 audit_logs (감사 로그)
- [ ] 마이그레이션 생성 (actor_user_id, action, entity_type, entity_id, diff)
- [ ] 모델 생성

### 2.2 마이그레이션 실행 및 검증
- [ ] `rails db:create` 실행
- [ ] `rails db:migrate` 실행
- [ ] `rails db:schema:dump` 확인
- [ ] Rails 콘솔에서 테이블 확인

### 2.3 시드 데이터 생성
- [ ] `db/seeds.rb` 작성
  - [ ] 기본 tenant 생성
  - [ ] 테스트 user 생성 (owner, manager, staff)
  - [ ] 샘플 customers 생성
  - [ ] 카테고리 및 catalog_items 생성
- [ ] `rails db:seed` 실행

---

## Phase 3: Backend API 구현

### 3.1 기본 설정

#### 3.1.1 BaseController 설정
- [ ] `app/controllers/api/base_controller.rb` 생성
  - [ ] 인증 필터 추가
  - [ ] Current.tenant, Current.user 설정
  - [ ] 에러 핸들링 추가
  - [ ] JSON 응답 헬퍼 추가

#### 3.1.2 라우트 설정
- [ ] `config/routes.rb` API 라우트 정의
  ```ruby
  namespace :api do
    # auth
    post 'auth/sign_in', to: 'auth#sign_in'
    delete 'auth/sign_out', to: 'auth#sign_out'
    get 'auth/me', to: 'auth#me'

    # resources
    resources :customers, only: [:index, :show, :create, :update]
    resources :users, only: [:index, :show]
    resources :catalog_categories, only: [:index, :create]
    resources :catalog_items, only: [:index, :create, :update]
    resources :sales, only: [:index, :show, :create] do
      member do
        put :void
      end
    end
    resources :stored_value_accounts, only: [] do
      collection do
        get 'customer/:customer_id', action: :show_by_customer
      end
    end

    # reports
    namespace :reports do
      get :daily
      get :monthly
      get :by_staff
      get :by_method
    end
  end
  ```

### 3.2 인증 API

#### 3.2.1 AuthController
- [ ] `app/controllers/api/auth_controller.rb` 생성
- [ ] `sign_in` 액션 구현 (이메일/비밀번호 → JWT 토큰)
- [ ] `sign_out` 액션 구현
- [ ] `me` 액션 구현 (현재 사용자 정보)
- [ ] JWT 토큰 생성/검증 로직 구현

### 3.3 기초 데이터 API

#### 3.3.1 CustomersController
- [ ] `app/controllers/api/customers_controller.rb` 생성
- [ ] `index` 액션 (검색: name, phone)
- [ ] `show` 액션
- [ ] `create` 액션
- [ ] `update` 액션
- [ ] Jbuilder 뷰 생성

#### 3.3.2 UsersController
- [ ] `app/controllers/api/users_controller.rb` 생성
- [ ] `index` 액션 (active 사용자만)
- [ ] `show` 액션
- [ ] Jbuilder 뷰 생성

#### 3.3.3 CatalogCategoriesController
- [ ] `app/controllers/api/catalog_categories_controller.rb` 생성
- [ ] `index` 액션
- [ ] `create` 액션
- [ ] Jbuilder 뷰 생성

#### 3.3.4 CatalogItemsController
- [ ] `app/controllers/api/catalog_items_controller.rb` 생성
- [ ] `index` 액션 (필터: kind, category_id, active)
- [ ] `create` 액션
- [ ] `update` 액션
- [ ] Jbuilder 뷰 생성

### 3.4 거래 API (핵심)

#### 3.4.1 SalesController
- [ ] `app/controllers/api/sales_controller.rb` 생성
- [ ] `index` 액션 (필터: date_from, date_to, staff_id, customer_id)
- [ ] `show` 액션 (nested: items, discounts, payments)
- [ ] `create` 액션 (SaleCreationService 호출)
- [ ] `void` 액션 (거래 취소)
- [ ] Jbuilder 뷰 생성 (중첩 관계 포함)

#### 3.4.2 SaleCreationService
- [ ] `app/services/sale_creation_service.rb` 생성
- [ ] 트랜잭션 내에서 처리
  - [ ] Sale 생성
  - [ ] SaleItem 일괄 생성
  - [ ] SaleDiscount 생성 (optional)
  - [ ] Payment 일괄 생성
  - [ ] StoredValue 처리 (method='stored_value'인 경우)
  - [ ] AuditLog 생성
- [ ] 검증 로직
  - [ ] 결제 합계 == 최종 금액 확인
  - [ ] 정액권 잔액 확인

#### 3.4.3 StoredValueService
- [ ] `app/services/stored_value_service.rb` 생성
- [ ] `redeem` 메서드 (소진)
  - [ ] StoredValueTransaction 생성
  - [ ] StoredValueAccount.balance 차감
- [ ] 잔액 부족 예외 처리

### 3.5 정액권 API

#### 3.5.1 StoredValueAccountsController
- [ ] `app/controllers/api/stored_value_accounts_controller.rb` 생성
- [ ] `show_by_customer` 액션 (고객 ID로 잔액 조회)

### 3.6 리포트 API

#### 3.6.1 ReportsController
- [ ] `app/controllers/api/reports_controller.rb` 생성
- [ ] `daily` 액션 (일별 매출)
- [ ] `monthly` 액션 (월별 매출)
- [ ] `by_staff` 액션 (디자이너별 매출)
- [ ] `by_method` 액션 (결제수단별 매출)

#### 3.6.2 ReportService
- [ ] `app/services/report_service.rb` 생성
- [ ] `daily_report(date)` 메서드
- [ ] `monthly_report(year, month)` 메서드
- [ ] `by_staff_report(date_from, date_to)` 메서드
- [ ] `by_method_report(date_from, date_to)` 메서드

### 3.7 테스트 작성

#### 3.7.1 모델 테스트
- [ ] `spec/models/sale_spec.rb`
- [ ] `spec/models/sale_item_spec.rb`
- [ ] `spec/models/payment_spec.rb`

#### 3.7.2 Request 테스트
- [ ] `spec/requests/api/auth_spec.rb`
- [ ] `spec/requests/api/sales_spec.rb`
- [ ] `spec/requests/api/reports_spec.rb`

#### 3.7.3 Service 테스트
- [ ] `spec/services/sale_creation_service_spec.rb`
- [ ] `spec/services/report_service_spec.rb`

---

## Phase 4: Frontend 구현

### 4.1 기본 설정

#### 4.1.1 프로젝트 구조 설정
- [ ] 디렉토리 구조 생성
  ```
  src/
  ├── components/
  │   ├── ui/
  │   ├── layout/
  │   ├── sale/
  │   └── report/
  ├── pages/
  ├── hooks/
  ├── lib/
  └── contexts/
  ```
- [ ] 절대 경로 import 설정 (`@/` alias)

#### 4.1.2 API 클라이언트 설정
- [ ] `src/lib/api.ts` 생성
  - [ ] Axios 인스턴스 생성
  - [ ] 인터셉터 설정 (토큰 추가, 에러 처리)
  - [ ] API 엔드포인트 함수 정의

#### 4.1.3 TypeScript 타입 정의
- [ ] `src/lib/types.ts` 생성

#### 4.1.4 유틸리티 함수
- [ ] `src/lib/utils.ts` 생성
  - [ ] `formatCurrency(amount)` - 원화 포맷
  - [ ] `formatDate(date)` - 날짜 포맷
  - [ ] `cn()` - className 병합

### 4.2 레이아웃 컴포넌트

#### 4.2.1 Layout
- [ ] `src/components/layout/Header.tsx` 생성
- [ ] `src/components/layout/Sidebar.tsx` 생성
- [ ] `src/components/layout/Layout.tsx` 생성

#### 4.2.2 라우팅 설정
- [ ] `src/App.tsx` 라우터 설정

### 4.3 인증

#### 4.3.1 AuthContext
- [ ] `src/contexts/AuthContext.tsx` 생성
  - [ ] 로그인/로그아웃 함수
  - [ ] 사용자 상태 관리
  - [ ] 토큰 저장 (localStorage)

#### 4.3.2 LoginPage
- [ ] `src/pages/LoginPage.tsx` 생성
  - [ ] 이메일/비밀번호 폼
  - [ ] 로그인 API 호출
  - [ ] 성공 시 리다이렉트

### 4.4 거래 입력 화면 (핵심)

#### 4.4.1 SalePage (메인)
- [ ] `src/pages/SalePage.tsx` 생성
  - [ ] SaleForm 컨테이너
  - [ ] 저장/취소 버튼
  - [ ] 성공/에러 토스트

#### 4.4.2 SaleForm (폼 컨테이너)
- [ ] `src/components/sale/SaleForm.tsx` 생성
  - [ ] React Hook Form 설정
  - [ ] 섹션 레이아웃
  - [ ] 합계 계산 로직
  - [ ] 저장 전 검증

#### 4.4.3 CustomerSelect (고객 선택)
- [ ] `src/components/sale/CustomerSelect.tsx` 생성
  - [ ] 고객 검색 (debounced)
  - [ ] 검색 결과 목록
  - [ ] 신규 고객 생성 다이얼로그

#### 4.4.4 StaffSelect (디자이너 선택)
- [ ] `src/components/sale/StaffSelect.tsx` 생성

#### 4.4.5 LineItemList (라인아이템)
- [ ] `src/components/sale/LineItemList.tsx` 생성
- [ ] `src/components/sale/LineItemRow.tsx` 생성
- [ ] `src/components/sale/CatalogSearch.tsx` 생성

#### 4.4.6 DiscountSection (할인)
- [ ] `src/components/sale/DiscountSection.tsx` 생성

#### 4.4.7 PaymentSection (결제)
- [ ] `src/components/sale/PaymentSection.tsx` 생성
- [ ] `src/components/sale/PaymentRow.tsx` 생성

#### 4.4.8 SaleSummary (요약)
- [ ] `src/components/sale/SaleSummary.tsx` 생성

### 4.5 거래 목록 화면

#### 4.5.1 SaleListPage
- [ ] `src/pages/SaleListPage.tsx` 생성
  - [ ] 날짜 필터
  - [ ] 거래 목록 테이블
  - [ ] 상세 보기 링크
  - [ ] 취소 버튼

### 4.6 리포트 화면

#### 4.6.1 ReportPage (메인)
- [ ] `src/pages/ReportPage.tsx` 생성
  - [ ] 일별/월별 토글
  - [ ] 날짜 선택기
  - [ ] 리포트 컴포넌트 레이아웃

#### 4.6.2 DateSelector
- [ ] `src/components/report/DateSelector.tsx` 생성

#### 4.6.3 SummaryCards
- [ ] `src/components/report/SummaryCards.tsx` 생성

#### 4.6.4 SalesChart
- [ ] `src/components/report/SalesChart.tsx` 생성

#### 4.6.5 상세 테이블
- [ ] `src/components/report/StaffTable.tsx` 생성
- [ ] `src/components/report/MethodTable.tsx` 생성
- [ ] `src/components/report/CategoryTable.tsx` 생성

### 4.7 커스텀 훅

#### 4.7.1 API 훅
- [ ] `src/hooks/useAuth.ts` - 인증 관련
- [ ] `src/hooks/useCustomers.ts` - 고객 CRUD
- [ ] `src/hooks/useCatalog.ts` - 카탈로그 조회
- [ ] `src/hooks/useSales.ts` - 거래 CRUD
- [ ] `src/hooks/useReports.ts` - 리포트 조회

---

## Phase 5: 테스트 및 배포

### 5.1 Backend 테스트

#### 5.1.1 모델 테스트
- [ ] 모든 모델 검증 테스트
- [ ] 관계 테스트
- [ ] 콜백 테스트

#### 5.1.2 Request 테스트
- [ ] 인증 테스트
- [ ] CRUD 테스트
- [ ] 권한 테스트

#### 5.1.3 Service 테스트
- [ ] SaleCreationService 테스트
- [ ] StoredValueService 테스트
- [ ] ReportService 테스트

### 5.2 Frontend 테스트

#### 5.2.1 유닛 테스트
- [ ] 유틸리티 함수 테스트
- [ ] 훅 테스트

#### 5.2.2 컴포넌트 테스트
- [ ] 폼 컴포넌트 테스트
- [ ] 계산 로직 테스트

### 5.3 통합 테스트

#### 5.3.1 E2E 시나리오
- [ ] 로그인 → 거래 생성 → 저장 확인
- [ ] 거래 생성 → 리포트 반영 확인
- [ ] 정액권 소진 → 잔액 차감 확인
- [ ] 거래 취소 → 상태 변경 확인

### 5.4 배포 준비

#### 5.4.1 환경 설정
- [ ] 환경 변수 정리 (.env.example)
- [ ] 프로덕션 설정 확인

#### 5.4.2 Docker 이미지
- [ ] Rails 이미지 빌드 테스트
- [ ] Frontend 이미지 빌드 테스트

#### 5.4.3 배포
- [ ] Railway 또는 Render 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 초기 데이터 시딩
- [ ] 도메인 연결

---

## 검증 체크리스트

### 거래 입력 테스트
- [ ] 고객 검색/선택 동작 확인
- [ ] 신규 고객 생성 후 자동 선택 확인
- [ ] 시술/상품 추가 및 합계 계산 확인
- [ ] 할인 적용 확인 (%, 금액)
- [ ] 분할 결제 (카드+현금) 동작 확인
- [ ] 정액권 소진 시 잔액 차감 확인
- [ ] 잔액 부족 시 경고 확인
- [ ] 결제 합계 불일치 시 저장 차단 확인
- [ ] 저장 후 DB 데이터 확인

### 리포트 테스트
- [ ] 일매출 집계 정확성 확인
- [ ] 월매출 집계 정확성 확인
- [ ] 디자이너별 매출 확인
- [ ] 결제수단별 매출 확인
- [ ] 시술/상품별 매출 확인

### 통합 테스트
- [ ] 거래 생성 → 리포트 반영 확인
- [ ] 거래 취소 → 리포트에서 제외 확인
- [ ] 정액권 소진 → 리포트 결제수단별 집계 확인

---

## 우선순위 가이드

### P0 (MVP 필수)
1. DB 스키마 (tenants, users, customers, catalog_items, sales, sale_items, payments)
2. 거래 생성 API
3. 거래 입력 화면
4. 일매출 리포트

### P1 (MVP 권장)
1. sale_discounts, stored_value 관련 테이블
2. 할인/정액권 처리
3. 디자이너별/결제수단별 리포트

### P2 (후순위)
1. audit_logs
2. 월별 리포트
3. 거래 목록/상세 화면
4. 권한 세분화
