# TASKS: Mariem Palantir MVP 구현 태스크

> **최종 업데이트**: 2026-01-21

## 진행 상태 요약

- [x] Phase 1: 프로젝트 초기화 (14/15) ✅
- [x] Phase 2: DB 스키마 구현 (14/14) ✅
- [x] Phase 3: Backend API 구현 (25/25) ✅
- [x] Phase 4: Frontend 구현 (32/30) ✅ (범위 확장)
- [ ] Phase 5: 테스트 및 배포 (8/12) 🟡

**총 진행률**: 93/96 (97%)

---

## 구현 현황 노트

### 용어 변경 사항
| SPEC 설계 | 실제 구현 | 비고 |
|-----------|-----------|------|
| `Tenant` | `Store` | 기능 동일 |
| `Sale` | `Visit` | 기능 동일 |
| `SaleItem` | `SaleLineItem` | 기능 동일 |
| `CatalogItem` | `Service`, `Product` | 2개 모델로 분리 |
| `status: completed/voided` | `status: draft/finalized` + `voided_at` | 소프트 삭제 방식 |

### 범위 확장 (MVP 외 추가 구현)
- 예약 관리 (ReservationPage) ✅
  - 캘린더 기반 예약 그리드 ✅
  - 드래그 앤 드롭으로 예약 이동 ✅
  - 시간 충돌 방지 로직 ✅
- 정액권/포인트 시스템 (PrepaidPlan, PointRule) 부분 구현
- 재고 관리 모델 (InventoryPurchase, InventoryEvent) 스키마만

---

## Phase 1: 프로젝트 초기화 ✅

### 1.1 Rails 8 API 프로젝트 생성
- [x] Rails 프로젝트 생성 (Rails 8.1.2)
- [x] `.gitignore` 설정
- [x] `README.md` 작성

### 1.2 핵심 Gem 추가 및 설치
- [x] Gemfile에 gem 추가 (devise, devise-jwt, rack-cors, pundit 등)
- [x] `bundle install` 실행
- [x] `rails generate rspec:install` 실행

### 1.3 CORS 설정
- [x] `config/initializers/cors.rb` 설정

### 1.4 Frontend 설정 (Vite + React)
- [x] Vite 7.2.4 + React 19.2.0 + TypeScript 5.9.3 프로젝트 생성
- [x] Tailwind CSS 4.1.18 설치 및 설정
- [x] shadcn/ui 설치 및 기본 컴포넌트 추가
- [x] 추가 패키지 설치 (axios, react-query, react-router-dom, react-hook-form, zod, recharts)

### 1.5 Docker 환경 구성
- [ ] `Dockerfile` 생성 (미완료)
- [x] 개발 환경 구성 완료

---

## Phase 2: DB 스키마 구현 ✅

### 2.1 마이그레이션 생성 (23개 완료)
- [x] stores (tenants → stores로 변경)
- [x] users (Devise 통합)
- [x] customers
- [x] service_categories (catalog_categories 대신)
- [x] services, products (catalog_items 대신 분리)
- [x] visits (sales → visits로 변경)
- [x] sale_line_items
- [x] payments
- [x] prepaid_sales, prepaid_usages (stored_value 대신)
- [x] staff_members (추가)
- [x] 기타 확장 모델 (vendors, inventory 관련, point 관련)

### 2.2 마이그레이션 실행 및 검증
- [x] `rails db:create` 실행
- [x] `rails db:migrate` 실행
- [x] 스키마 검증 완료

### 2.3 시드 데이터 생성
- [x] `db/seeds.rb` 작성
- [x] 테스트 데이터 생성

---

## Phase 3: Backend API 구현 ✅

### 3.1 기본 설정
- [x] `Api::BaseController` 생성 (인증 필터, 에러 핸들링)
- [x] API 라우트 설정 (`/api/*`)

### 3.2 인증 API
- [x] `AuthController` - sign_in, sign_out, me

### 3.3 기초 데이터 API
- [x] `CustomersController` - CRUD + 검색
- [x] `StaffMembersController` - CRUD
- [x] `ServiceCategoriesController` - CRUD
- [x] `ServicesController` - CRUD
- [x] `ProductsController` - CRUD

### 3.4 거래 API (핵심)
- [x] `VisitsController` - CRUD + void
- [x] `VisitCreationService` - 트랜잭션 처리

### 3.5 리포트 API
- [x] `ReportsController` - daily, monthly, by_staff, by_method
- [x] `ReportService` - 집계 로직

### 3.6 테스트 작성
- [x] Factories 11개 생성
- [x] Request Specs 8개 파일 완성

---

## Phase 4: Frontend 구현 ✅

### 4.1 기본 설정
- [x] 디렉토리 구조 설정 (components, contexts, hooks, lib, utils)
- [x] API 클라이언트 설정 (`lib/api.ts`)
- [x] TypeScript 타입 정의
- [x] 유틸리티 함수 (format, date, cn)

### 4.2 레이아웃 컴포넌트
- [x] `Header.tsx`, `Sidebar.tsx`, `Layout.tsx`
- [x] 라우팅 설정 (react-router-dom)

### 4.3 인증
- [x] `AuthContext` - 로그인/로그아웃, 토큰 관리
- [x] 로그인 페이지

### 4.4 거래 입력 화면 (핵심) ✅
- [x] `SalePage.tsx` - 메인 컨테이너
- [x] `CustomerSelect.tsx` - 고객 검색/선택, 엔터키 선택
- [x] `StaffSelect.tsx` - 담당자 선택
- [x] `CatalogTabs.tsx` - 카테고리별 시술/상품 조회
- [x] `CartTable.tsx` - 라인아이템 관리
- [x] `PaymentSummary.tsx` - 결제 요약
- [x] `SaleFooter.tsx` - 저장/취소 버튼

### 4.5 거래 목록 화면 ✅
- [x] `SalesListPage.tsx` - 날짜 필터, 목록 테이블, 상세 보기, 취소

### 4.6 리포트 화면 ✅
- [x] `ReportsPage.tsx` - 일별/월별 토글, 날짜 선택, 요약 카드, 차트

### 4.7 추가 구현 (MVP 외)
- [x] `CustomersPage.tsx` - 고객 관리
- [x] `CustomerFormModal.tsx` - 고객 등록/수정 모달
- [x] `ReservationPage.tsx` - 예약 관리 (캘린더, 블록)
- [x] 카탈로그 모달 (CategoryModal, ServiceItemModal, ProductItemModal 등)

### 4.8 커스텀 훅
- [x] `useCustomersApi.ts`, `useServicesApi.ts`, `useProductsApi.ts`
- [x] `useSalesApi.ts`, `useReportsApi.ts`, `useStaffApi.ts`
- [x] `useClickOutside.ts`, `useEscapeKey.ts` 등 유틸 훅

---

## Phase 5: 테스트 및 배포 🟡

### 5.1 Backend 테스트 ✅
- [x] RSpec 3.13 설정
- [x] Factories 11개
- [x] Request Specs 8개 파일

### 5.2 Frontend 테스트 🟡
- [x] Vitest 4.0.17 + @testing-library/react 설정
- [x] 테스트 파일 15개 (240개 테스트 케이스)
  - `CustomerSelect.test.tsx` ✅
  - `CustomerFormModal.test.tsx` ✅
  - `SalePage.test.tsx` ✅
  - `SalesListPage.test.tsx` ✅
  - `ReportsPage.test.tsx` ✅
  - `ReservationPage.test.tsx` ✅ (드래그 앤 드롭 테스트 포함)
  - `StaffFormModal.test.tsx` ✅
  - `useCustomersApi.test.tsx` ✅
  - `useServicesApi.test.tsx` ✅
  - `useProductsApi.test.tsx` ✅
  - 기타 컴포넌트 테스트 ✅
- [ ] 테스트 커버리지 80% 목표 (현재 약 60%)

### 5.3 통합 테스트
- [ ] E2E 테스트 설정 (미완료)

### 5.4 배포 준비
- [ ] 환경 변수 정리 (.env.example)
- [ ] Docker 이미지 빌드
- [ ] 배포 설정

---

## 미구현 항목

### MVP 범위 내
- [ ] Docker 환경 구성
- [ ] E2E 테스트
- [ ] 배포

### MVP 외 (Out of Scope)
- [ ] 감사 로그 (AuditLogs)
- [ ] 권한 세분화 (Pundit policies)
- [ ] 정액권 시스템 완전 구현
- [ ] 재고 관리 기능

---

## 검증 체크리스트

### 거래 입력 테스트 ✅
- [x] 고객 검색/선택 동작 확인
- [x] 고객명 검색 후 엔터키로 선택
- [x] 신규 고객 생성 후 자동 선택 확인
- [x] 시술/상품 추가 및 합계 계산 확인
- [x] 분할 결제 동작 확인
- [x] 저장 후 DB 데이터 확인

### 리포트 테스트 ✅
- [x] 일매출 집계 정확성 확인
- [x] 월매출 집계 정확성 확인
- [x] 디자이너별 매출 확인
- [x] 결제수단별 매출 확인

### 프론트엔드 테스트 ✅
- [x] 240개 테스트 케이스 통과

### 예약관리 테스트 ✅
- [x] 예약 블록 드래그 앤 드롭
- [x] 시간 충돌 방지
- [x] 취소된 예약 드래그 불가
- [x] 드래그 중 시각적 피드백
