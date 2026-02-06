---
name: mariem-architecture
description: Mariem Palantir 전체 아키텍처, 폴더 구조, 멀티테넌시 패턴, 의존성 방향. Use when working with project structure, architecture decisions, or multi-tenancy.
---

# Mariem Architecture Skill

## 프로젝트 개요

미용실 POS/CRM SaaS 시스템. Rails 8 API + React 19 SPA 풀스택 아키텍처.

## 아키텍처 스타일

- **Backend**: Rails 8 API 모드 (Monolithic)
- **Frontend**: React 19 SPA (Vite 7, 별도 `frontend/` 디렉토리)
- **Database**: PostgreSQL 16+ (단일 DB, 소프트 멀티테넌시)
- **배포**: Docker + Kamal (모놀리식 컨테이너)

## 핵심 폴더 구조

```
mariem_palantir_v1/
├── app/
│   ├── controllers/
│   │   ├── api/              # RESTful JSON API (JWT 인증)
│   │   ├── masters/          # 마스터 데이터 관리 (웹)
│   │   ├── transactions/     # 거래 관리 (웹)
│   │   ├── inventory/        # 재고 관리 (웹)
│   │   ├── prepaid/          # 정액권 (웹)
│   │   └── points/           # 포인트 (웹)
│   ├── models/               # 26개 ActiveRecord 모델
│   │   └── concerns/         # StoreScoped (멀티테넌시)
│   ├── services/             # 비즈니스 로직 서비스 객체
│   └── views/                # Jbuilder JSON 템플릿
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios 클라이언트 + 엔드포인트
│   │   ├── components/       # React 컴포넌트 (도메인별)
│   │   ├── hooks/            # 커스텀 훅 (API + 비즈니스 로직)
│   │   ├── contexts/         # React Context (Auth, Staff, etc.)
│   │   ├── types/            # TypeScript 타입
│   │   └── lib/              # 유틸리티
│   └── dist/                 # 빌드 결과물
├── spec/                     # RSpec 테스트
├── db/                       # 마이그레이션, 스키마, 시드
└── config/                   # Rails 설정
```

## 멀티테넌시 패턴

```ruby
# 모든 모델은 StoreScoped concern 사용
module StoreScoped
  extend ActiveSupport::Concern
  included do
    belongs_to :store
    scope :for_store, ->(store) { where(store: store) }
  end
end

# acts_as_tenant로 자동 필터링
acts_as_tenant(:store)
```

**규칙**: 모든 쿼리에 `store_id` 조건이 자동 적용됨. 새 모델 생성 시 반드시 `StoreScoped` include.

## 비즈니스 도메인 분리

| 도메인 | 모델 | 서비스 |
|--------|------|--------|
| **거래** | Visit, SaleLineItem, Payment | VisitCreationService |
| **카탈로그** | Service, ServiceCategory, Product, Vendor | PricingCalculator |
| **정액권** | PrepaidPlan, PrepaidSale, PrepaidUsage | PrepaidLedger |
| **포인트** | PointRule, PointTransaction | PointLedger |
| **재고** | InventoryPurchase, InventoryPurchaseItem, InventoryEvent | InventoryLedger |
| **고객** | Customer | - |
| **인증** | User, Store | Devise + JWT |

## 의존성 방향

```
Controller → Service → Model → Database
     ↓
   View (Jbuilder)

Frontend:
Component → Hook → API Client → Backend API
    ↓
  Context Provider
```

## API 인증 흐름

```
1. POST /api/auth/sign_in → JWT 토큰 발급
2. 요청 헤더: Authorization: Bearer <token>
3. Api::BaseController에서 JWT 검증 + JTI 확인
4. current_user, current_store 설정
5. acts_as_tenant이 store 기준 자동 필터링
```

## 핵심 규칙

1. 새 모델 → 반드시 `StoreScoped` include
2. 새 컨트롤러 → `Api::BaseController` 상속 (API) 또는 `ApplicationController` 상속 (웹)
3. 비즈니스 로직 → 서비스 객체로 분리 (모델에 넣지 않음)
4. 프론트엔드 → React Query로 서버 상태 관리, Context로 전역 상태
5. 테스트 → RSpec (백엔드), Vitest (프론트엔드)
