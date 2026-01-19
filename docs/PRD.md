# PRD: Mariem Palantir MVP

## 1. 제품 개요

### 1.1 제품명
**Mariem Palantir** - 미용실 거래 입력 시스템

### 1.2 목적
미용실 1호점용 CRM/POS MVP. **거래 입력**과 **리포트 조회**가 핵심 기능.

### 1.3 핵심 가치
- **정확한 거래 기록**: 거래 시점의 가격/할인 정보를 스냅샷으로 보존
- **실시간 매출 파악**: 일/월/디자이너별/결제수단별 리포트
- **확장 가능성**: SaaS 멀티테넌트 구조 (현재는 1개 점포만 사용)

---

## 2. 사용자 및 역할

| 역할 | 설명 | 주요 권한 |
|------|------|----------|
| owner | 원장 | 모든 기능, 직원 관리 |
| manager | 매니저 | 거래 관리, 리포트 조회, 할인 권한 |
| staff | 디자이너/스탭 | 거래 생성, 본인 거래 조회 |
| viewer | 열람자 | 조회만 가능 |

### 권한 매트릭스

| 기능 | owner | manager | staff | viewer |
|------|-------|---------|-------|--------|
| 거래 생성 | O | O | O | X |
| 거래 조회 (본인) | O | O | O | O |
| 거래 조회 (전체) | O | O | X | O |
| 거래 취소 | O | O | X | X |
| 할인 적용 | O | O | 제한 | X |
| 리포트 조회 | O | O | X | O |
| 고객 관리 | O | O | O | X |
| 카탈로그 관리 | O | O | X | X |
| 직원 관리 | O | X | X | X |

---

## 3. 핵심 도메인 결정사항

| # | 질문 | 결정 |
|---|------|------|
| 1 | 고객 중복 기준 | `tenant_id + phone` (전화번호 없으면 NULL 허용) |
| 2 | 거래일 기준 | `sale_date` 필드 (결제일과 동일, 수동 변경 가능) |
| 3 | 라인아이템 개수 | 제한 없음 (1개 이상 필수) |
| 4 | 할인 적용 단위 | 거래 전체 (항목별 할인은 2차) |
| 5 | 할인 중복 | MVP에서는 1개만 허용 |
| 6 | 분할 결제 | 가능 (여러 결제수단 사용 가능) |
| 7 | 결제수단 종류 | cash, card, transfer, stored_value, giftcard, other |
| 8 | 거래 취소/환불 | status를 'voided'로 변경 (원본 보존) |
| 9 | 거래 수정 | 원본 수정 (단, audit_log에 기록) |
| 10 | 디자이너 귀속 | 거래 단위 (1명) |
| 11 | 정액권 MVP 범위 | 소진(결제)만, 판매/충전은 수동 조정 |
| 12 | 리포트 매출 기준 | 할인 후 순매출 (최종 결제금액) |
| 13 | 신규 고객 정의 | `customers.first_visit_at`이 조회 기간 내 |
| 14 | 직원별 조회 범위 | staff는 본인 거래만, manager/owner/viewer는 전체 |

---

## 4. MVP 기능 범위

### 4.1 거래 입력 화면 (SalePage)

고객/디자이너 선택 → 시술/상품 추가 → 할인 → 결제 → 저장

**구성 요소**:
1. **거래 기본정보**: 거래일, 메모
2. **고객 선택**: 검색 + 신규 생성
3. **담당 디자이너**: 드롭다운 선택
4. **시술/상품**: 카탈로그 선택 또는 직접 입력
5. **할인**: % 또는 금액
6. **결제**: 복수 결제수단 지원
7. **요약**: 합계 및 잔액 표시

**저장 조건**:
- 고객 선택됨
- 디자이너 선택됨
- 항목 1개 이상
- 결제 합계 = 최종 금액

### 4.2 리포트 화면 (ReportPage)

일/월 매출, 디자이너별, 결제수단별, 시술/상품별 집계

**구성 요소**:
1. **기간 선택**: 일별/월별 토글
2. **요약 카드**: 총매출, 순매출, 거래건수, 신규고객
3. **매출 차트**: 시간대별(일별) / 일별(월별)
4. **상세 테이블**: 디자이너별, 결제수단별, 카테고리별

---

## 5. 데이터 모델

### 5.1 Tenant (점포)
```typescript
interface Tenant {
  id: number;
  name: string;
  timezone: string;  // 기본값: 'Asia/Seoul'
}
```

### 5.2 User (직원/디자이너)
```typescript
interface User {
  id: number;
  tenant_id: number;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'staff' | 'viewer';
  active: boolean;
}
```

### 5.3 Customer (고객)
```typescript
interface Customer {
  id: number;
  tenant_id: number;
  name: string;
  phone: string | null;
  memo: string | null;
  status: 'active' | 'inactive' | 'blocked';
  first_visit_at: string | null;  // 첫 거래 시 자동 설정
}
```

### 5.4 CatalogCategory (카테고리)
```typescript
interface CatalogCategory {
  id: number;
  tenant_id: number;
  name: string;  // 커트, 펌, 염색, 클리닉, 두피, 상품
}
```

### 5.5 CatalogItem (시술/상품)
```typescript
interface CatalogItem {
  id: number;
  tenant_id: number;
  category_id: number | null;
  kind: 'service' | 'product';
  name: string;
  base_price: number;
  active: boolean;
}
```

### 5.6 Sale (거래 헤더)
```typescript
interface Sale {
  id: number;
  tenant_id: number;
  customer_id: number;
  staff_id: number;
  sale_date: string;  // YYYY-MM-DD
  status: 'completed' | 'voided' | 'refunded';
  note: string | null;

  // 계산 필드 (조회 시)
  subtotal: number;       // sum(items.line_total)
  discount_amount: number;
  total: number;          // subtotal - discount_amount
}
```

### 5.7 SaleItem (거래 라인아이템)
```typescript
interface SaleItem {
  id: number;
  sale_id: number;
  catalog_item_id: number | null;
  kind: 'service' | 'product' | 'custom';
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;  // quantity * unit_price
}
```

### 5.8 SaleDiscount (할인)
```typescript
interface SaleDiscount {
  id: number;
  sale_id: number;
  discount_type: 'percent' | 'amount';
  value: number;  // percent: 0~100, amount: 원
  reason: string | null;
}
```

### 5.9 Payment (결제)
```typescript
interface Payment {
  id: number;
  sale_id: number;
  method: 'cash' | 'card' | 'transfer' | 'stored_value' | 'giftcard' | 'other';
  amount: number;
  paid_at: string;
}
```

### 5.10 StoredValueAccount (정액권 잔액)
```typescript
interface StoredValueAccount {
  id: number;
  tenant_id: number;
  customer_id: number;
  balance: number;
}
```

### 5.11 StoredValueTransaction (정액권 원장)
```typescript
interface StoredValueTransaction {
  id: number;
  account_id: number;
  sale_id: number | null;
  payment_id: number | null;
  tx_type: 'topup' | 'redeem' | 'adjust' | 'refund';
  amount: number;  // +충전, -차감
  memo: string | null;
}
```

---

## 6. API 요약

### 6.1 인증
- `POST /api/auth/sign_in` - 로그인
- `DELETE /api/auth/sign_out` - 로그아웃
- `GET /api/auth/me` - 현재 사용자

### 6.2 기초 데이터
- `GET/POST /api/customers` - 고객 목록/생성
- `GET /api/users` - 직원 목록
- `GET/POST /api/catalog_categories` - 카테고리
- `GET/POST/PUT /api/catalog_items` - 시술/상품

### 6.3 거래 (핵심)
- `GET /api/sales` - 거래 목록
- `POST /api/sales` - 거래 생성 (nested: items, discount, payments)
- `GET /api/sales/:id` - 거래 상세
- `PUT /api/sales/:id/void` - 거래 취소

### 6.4 정액권
- `GET /api/stored_value_accounts/customer/:id` - 고객 정액권 잔액

### 6.5 리포트
- `GET /api/reports/daily` - 일별 리포트
- `GET /api/reports/monthly` - 월별 리포트
- `GET /api/reports/by_staff` - 디자이너별 매출
- `GET /api/reports/by_method` - 결제수단별 매출

---

## 7. 비즈니스 로직

### 7.1 거래 생성 프로세스

```
1. 요청 검증
   ├── customer_id 존재 확인
   ├── staff_id 존재 확인 (active 사용자)
   ├── items 1개 이상 확인
   └── 결제 합계 == 최종 금액 확인

2. 트랜잭션 시작
   ├── Sale 생성
   ├── SaleItem 일괄 생성
   ├── SaleDiscount 생성 (있는 경우)
   ├── Payment 일괄 생성
   ├── StoredValue 처리 (method='stored_value'인 경우)
   ├── Customer.first_visit_at 설정 (null인 경우)
   └── AuditLog 생성

3. 트랜잭션 커밋
```

### 7.2 할인 계산

```typescript
function calculateDiscountAmount(subtotal: number, discount: SaleDiscount): number {
  if (discount.discount_type === 'percent') {
    return Math.floor(subtotal * discount.value / 100);
  } else {
    return discount.value;
  }
}
```

### 7.3 정액권 소진

```
1. 결제 시 method='stored_value'이면:
   - 잔액 확인 (balance >= amount)
   - Payment 생성
   - StoredValueTransaction 생성 (tx_type='redeem', amount=-payment.amount)
   - StoredValueAccount.balance 차감

2. 거래 취소 시 stored_value 결제가 있었다면:
   - StoredValueTransaction 생성 (tx_type='refund', amount=+원래금액)
   - StoredValueAccount.balance 복구
```

---

## 8. 제외 범위 (Out of Scope)

다음 기능은 MVP에서 제외:

- ❌ 순이익 계산
- ❌ 급여/인센티브 자동 계산
- ❌ 재고 관리
- ❌ KPI 대시보드
- ❌ 자동 마케팅/메시지
- ❌ 예약 관리
- ❌ 정액권 판매/충전 (수동 조정으로 처리)

---

## 9. 성능 요구사항

### 9.1 응답 시간
- API 응답: 95% < 500ms
- 페이지 로드: 95% < 2초
- 리포트 조회: 95% < 1초

### 9.2 동시 사용자
- MVP: 5명 동시 접속
- 목표: 20명 동시 접속

### 9.3 데이터 규모
- 일 평균 거래: 30건
- 월 평균 거래: 900건
- 연간 거래: 10,000건

---

## 10. 성공 지표

1. 거래 입력부터 저장까지 30초 이내 완료
2. 모든 거래 유형(시술, 상품, 정액권)을 정확히 기록
3. 거래 시점의 가격 정보가 스냅샷으로 보존
4. 리포트 집계와 실제 거래 합계 일치
5. 정액권 원장 합계와 잔액 일치
