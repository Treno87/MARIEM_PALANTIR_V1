# API Specification

> API 개발 시 이 문서를 참조하세요: `@docs/specs/api.md`

## Overview

- **Base URL**: `/api`
- **Format**: JSON
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`

---

## Authentication

모든 API 요청(인증 제외)에는 Authorization 헤더가 필요합니다:

```
Authorization: Bearer <token>
```

---

## Endpoints Summary

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/sign_in` | 로그인 |
| DELETE | `/api/auth/sign_out` | 로그아웃 |
| GET | `/api/auth/me` | 현재 사용자 |
| GET | `/api/customers` | 고객 목록 |
| POST | `/api/customers` | 고객 생성 |
| GET | `/api/users` | 직원 목록 |
| GET | `/api/catalog_categories` | 카테고리 목록 |
| POST | `/api/catalog_categories` | 카테고리 생성 |
| GET | `/api/catalog_items` | 시술/상품 목록 |
| POST | `/api/catalog_items` | 시술/상품 생성 |
| PUT | `/api/catalog_items/:id` | 시술/상품 수정 |
| GET | `/api/sales` | 거래 목록 |
| POST | `/api/sales` | 거래 생성 |
| GET | `/api/sales/:id` | 거래 상세 |
| PUT | `/api/sales/:id/void` | 거래 취소 |
| GET | `/api/stored_value_accounts/customer/:id` | 정액권 잔액 |
| GET | `/api/reports/daily` | 일별 리포트 |
| GET | `/api/reports/monthly` | 월별 리포트 |
| GET | `/api/reports/by_staff` | 디자이너별 |
| GET | `/api/reports/by_method` | 결제수단별 |

---

## 1. Authentication API

### POST /api/auth/sign_in

로그인

**Request**:
```json
{
  "email": "designer@mariem.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "designer@mariem.com",
    "name": "김디자이너",
    "role": "staff"
  }
}
```

**Response (401)**:
```json
{
  "error": "Invalid email or password"
}
```

### DELETE /api/auth/sign_out

로그아웃

**Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

현재 사용자 정보

**Response (200)**:
```json
{
  "id": 1,
  "email": "designer@mariem.com",
  "name": "김디자이너",
  "role": "staff",
  "tenant": {
    "id": 1,
    "name": "마리엠 1호점"
  }
}
```

---

## 2. Customers API

### GET /api/customers

고객 목록 (검색)

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| q | string | 이름/전화번호 검색 |
| status | string | 상태 필터 |
| page | number | 페이지 (기본: 1) |
| per_page | number | 개수 (기본: 20) |

**Response (200)**:
```json
{
  "customers": [
    {
      "id": 1,
      "name": "홍길동",
      "phone": "010-1234-5678",
      "status": "active",
      "first_visit_at": "2025-06-15",
      "stored_value_balance": 150000
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 98
  }
}
```

### POST /api/customers

고객 생성

**Request**:
```json
{
  "customer": {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "memo": "VIP 고객"
  }
}
```

**Response (201)**:
```json
{
  "id": 1,
  "name": "홍길동",
  "phone": "010-1234-5678",
  "memo": "VIP 고객",
  "status": "active",
  "first_visit_at": null
}
```

---

## 3. Catalog API

### GET /api/catalog_items

시술/상품 목록

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| kind | string | service/product 필터 |
| category_id | number | 카테고리 필터 |
| q | string | 이름 검색 |
| active | boolean | 활성 상태 (기본: true) |

**Response (200)**:
```json
{
  "catalog_items": [
    {
      "id": 1,
      "kind": "service",
      "name": "커트 (여성)",
      "base_price": 35000,
      "category": {
        "id": 1,
        "name": "커트"
      },
      "active": true
    }
  ]
}
```

---

## 4. Sales API (핵심)

### POST /api/sales

거래 생성

**Request**:
```json
{
  "sale": {
    "sale_date": "2026-01-17",
    "customer_id": 123,
    "staff_id": 45,
    "note": "정액권 고객 할인 적용",
    "items": [
      {
        "catalog_item_id": 10,
        "kind": "service",
        "name": "커트 (여성)",
        "quantity": 1,
        "unit_price": 35000
      },
      {
        "kind": "product",
        "name": "샴푸 500ml",
        "quantity": 1,
        "unit_price": 18000
      }
    ],
    "discount": {
      "discount_type": "percent",
      "value": 15,
      "reason": "정액권 고객 할인"
    },
    "payments": [
      {
        "method": "card",
        "amount": 30000
      },
      {
        "method": "stored_value",
        "amount": 15050
      }
    ]
  }
}
```

**Response (201)**:
```json
{
  "sale": {
    "id": 1001,
    "sale_date": "2026-01-17",
    "status": "completed",
    "customer": {
      "id": 123,
      "name": "홍길동"
    },
    "staff": {
      "id": 45,
      "name": "김디자이너"
    },
    "items": [...],
    "discount": {...},
    "payments": [...],
    "subtotal": 53000,
    "discount_amount": 7950,
    "total": 45050
  }
}
```

**Response (422) - 검증 실패**:
```json
{
  "errors": {
    "payments": ["Payment total (40000) does not match sale total (45050)"],
    "stored_value": ["Insufficient balance (10000). Required: 15050"]
  }
}
```

### GET /api/sales

거래 목록

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| date_from | date | 시작일 |
| date_to | date | 종료일 |
| staff_id | number | 담당자 필터 |
| customer_id | number | 고객 필터 |
| status | string | 상태 필터 |
| page | number | 페이지 번호 |

### GET /api/sales/:id

거래 상세 (items, discount, payments 포함)

### PUT /api/sales/:id/void

거래 취소

**Response (200)**:
```json
{
  "sale": {
    "id": 1001,
    "status": "voided"
  }
}
```

---

## 5. Stored Value API

### GET /api/stored_value_accounts/customer/:customer_id

고객 정액권 잔액 및 거래 내역

**Response (200)**:
```json
{
  "customer_id": 123,
  "balance": 150000,
  "transactions": [
    {
      "id": 1,
      "tx_type": "topup",
      "amount": 300000,
      "memo": "30만원권 구매",
      "created_at": "2025-12-01T10:00:00+09:00"
    },
    {
      "id": 2,
      "tx_type": "redeem",
      "amount": -150000,
      "sale_id": 980,
      "created_at": "2026-01-10T15:30:00+09:00"
    }
  ]
}
```

---

## 6. Reports API

### GET /api/reports/daily

일별 리포트

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| date | date | 조회 일자 (기본: 오늘) |

**Response (200)**:
```json
{
  "date": "2026-01-17",
  "summary": {
    "total_revenue": 1250000,
    "total_discount": 87500,
    "net_revenue": 1162500,
    "transaction_count": 25,
    "new_customer_count": 3,
    "avg_transaction": 46500
  },
  "by_staff": [
    {
      "staff_id": 45,
      "staff_name": "김디자이너",
      "revenue": 520000,
      "transaction_count": 12
    }
  ],
  "by_method": [
    { "method": "card", "amount": 750000, "count": 18 },
    { "method": "cash", "amount": 280000, "count": 8 }
  ],
  "by_category": [
    { "category_id": 1, "category_name": "커트", "amount": 450000 }
  ],
  "by_hour": [
    { "hour": 10, "revenue": 120000, "count": 3 }
  ]
}
```

### GET /api/reports/monthly

월별 리포트

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| year | number | 연도 |
| month | number | 월 (1-12) |

---

## Error Responses

### HTTP Status Codes

| 상태 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 422 | 검증 실패 |
| 500 | 서버 오류 |

### Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field_name": ["error message"]
    }
  }
}
```

---

## Routes Definition (Rails)

```ruby
namespace :api do
  # Auth
  post 'auth/sign_in', to: 'auth#sign_in'
  delete 'auth/sign_out', to: 'auth#sign_out'
  get 'auth/me', to: 'auth#me'

  # Resources
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

  # Reports
  namespace :reports do
    get :daily
    get :monthly
    get :by_staff
    get :by_method
  end
end
```
