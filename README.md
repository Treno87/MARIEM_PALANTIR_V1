# Mariem Palantir

미용실 거래 입력 MVP 시스템

## 개요

Mariem Palantir는 미용실의 모든 거래(시술, 상품, 할인, 정액권, 포인트, 재고)를 일관된 원장 구조로 기록하는 웹 애플리케이션입니다.

## 기술 스택

- Ruby on Rails 8.1
- PostgreSQL
- Devise (인증)
- Tailwind CSS
- Pagy (페이지네이션)

## 핵심 기능

- **마스터 데이터 관리**: 직원, 서비스, 상품, 정액권 상품, 가격 규칙, 포인트 규칙
- **거래 입력**: 방문 생성, 시술/상품 판매, 결제 처리
- **정액권 원장**: 판매 및 사용 추적 (FIFO)
- **포인트 원장**: 적립 및 사용 추적
- **재고 관리**: 입고/출고 이벤트 기록

## 시작하기

### 요구사항

- Ruby 3.x
- PostgreSQL 14+
- Bundler

### 설치

```bash
# 저장소 클론
cd mariem_palantir_v1

# 의존성 설치
bundle install

# 데이터베이스 생성 및 마이그레이션
rails db:create
rails db:migrate

# 샘플 데이터 생성
rails db:seed

# 서버 실행
rails server
```

### 접속

브라우저에서 http://localhost:3000 접속

**로그인 정보**
- 이메일: `owner@example.com`
- 비밀번호: `password123`

## 프로젝트 구조

```
app/
├── controllers/
│   ├── masters/          # 마스터 데이터 CRUD
│   ├── transactions/     # 거래 입력
│   ├── prepaid/          # 정액권 관리
│   ├── points/           # 포인트 관리
│   └── inventory/        # 재고 관리
├── models/
│   ├── concerns/
│   │   └── store_scoped.rb  # 멀티테넌시
│   └── services/            # 비즈니스 로직
│       ├── pricing_calculator.rb
│       ├── prepaid_ledger.rb
│       ├── point_ledger.rb
│       └── inventory_ledger.rb
└── views/
```

## 데이터 모델

### 기반 테이블
- `stores` - 매장
- `users` - 사용자 (OWNER, MANAGER, STYLIST)
- `staff_members` - 직원
- `customers` - 고객

### 마스터 데이터
- `service_categories` - 서비스 카테고리
- `services` - 서비스 (시술)
- `vendors` - 공급업체
- `products` - 상품 (retail/consumable/both)
- `prepaid_plans` - 정액권 상품
- `pricing_rules` - 가격 규칙
- `point_rules` - 포인트 규칙

### 거래 데이터
- `visits` - 방문 (draft → finalized)
- `sale_line_items` - 판매 라인 (서비스/상품 통합)
- `payments` - 결제 (card/cash/prepaid/points)

### 원장 데이터
- `prepaid_sales` - 정액권 판매
- `prepaid_usages` - 정액권 사용
- `point_transactions` - 포인트 거래

### 재고 데이터
- `inventory_purchases` - 입고
- `inventory_purchase_items` - 입고 품목
- `inventory_events` - 재고 이벤트

## 라이선스

Private
