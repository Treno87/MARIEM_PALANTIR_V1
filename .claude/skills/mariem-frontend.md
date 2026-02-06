---
name: mariem-frontend
description: Mariem Palantir React 19 + Vite 7 + shadcn/ui 프론트엔드 패턴, 컴포넌트 구조, 커스텀 훅, API 연동. Use when working with React components, hooks, frontend state, or UI.
---

# Mariem Frontend Skill

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.0 | UI 프레임워크 |
| TypeScript | 5.9.3 | 타입 안전성 |
| Vite | 7.2.4 | 빌드 도구 |
| Tailwind CSS | 4.1.18 | 스타일링 |
| shadcn/ui | - | UI 컴포넌트 |
| TanStack React Query | 5.90.19 | 서버 상태 관리 |
| React Router | 7.12.0 | 라우팅 |
| Axios | 1.13.2 | HTTP 클라이언트 |
| Vitest | 4.0.17 | 테스트 |

## 실행 명령어

```bash
cd frontend
npm install        # 의존성 설치
npm run dev        # 개발 서버 (Vite)
npm test           # 테스트 (Vitest)
npm run build      # 프로덕션 빌드
```

## 폴더 구조

```
frontend/src/
├── api/
│   ├── client.ts         # Axios 인스턴스 (JWT 인터셉터)
│   ├── endpoints.ts      # API 엔드포인트 정의
│   └── types.ts          # API 응답 타입
├── components/
│   ├── layout/           # AppLayout, Sidebar
│   ├── sale/             # POS 인터페이스 (SalePage, CartTable, etc.)
│   ├── sales/            # 판매 이력 (SalesListPage)
│   ├── customers/        # 고객 관리
│   ├── staff/            # 시술자 관리
│   ├── catalog/          # 서비스/제품 카탈로그
│   ├── reports/          # 리포트
│   ├── reservations/     # 예약
│   ├── marketing/        # 마케팅
│   ├── landing/          # 로그인 페이지
│   └── ui/               # shadcn/ui 컴포넌트
├── hooks/
│   ├── useApi.ts         # 기본 API 훅
│   ├── use{Domain}Api.ts # 도메인별 API 훅
│   ├── useCart.ts         # 장바구니 상태
│   └── use{Feature}.ts   # 비즈니스 로직 훅
├── contexts/              # React Context (Auth, Staff, Customer, etc.)
├── types/                 # TypeScript 타입 정의
├── lib/                   # 유틸리티
├── constants/             # 상수
└── App.tsx                # 라우팅 + Provider 계층
```

## Provider 계층

```tsx
<QueryClientProvider>
  <AuthProvider>
    <StaffProvider>
      <CustomerProvider>
        <SaleProvider>
          <CatalogProvider>
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
          </CatalogProvider>
        </SaleProvider>
      </CustomerProvider>
    </StaffProvider>
  </AuthProvider>
</QueryClientProvider>
```

## 라우팅

| 경로 | 컴포넌트 | 설명 |
|------|---------|------|
| `/` | LandingPage | 로그인 |
| `/sale` | SalePage | POS 거래 입력 |
| `/sales` | SalesListPage | 판매 이력 |
| `/customers` | CustomersPage | 고객 관리 |
| `/staff` | StaffPage | 시술자 관리 |
| `/catalog/services` | ServicesPage | 서비스 카탈로그 |
| `/catalog/products` | ProductsPage | 제품 카탈로그 |
| `/reports` | ReportsPage | 리포트 |
| `/reservations` | ReservationPage | 예약 관리 |

## API 연동 패턴

### Axios 클라이언트

```typescript
// api/client.ts
const client = axios.create({ baseURL: '/api' });

// JWT 자동 주입
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 자동 처리
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);
```

### API 훅 패턴

```typescript
// hooks/useCustomersApi.ts
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.list(),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerInput) => customersApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
```

### 컴포넌트 패턴

```tsx
// 페이지 컴포넌트
function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return <Skeleton />;

  return (
    <div className="p-6">
      <Header onAdd={() => setIsModalOpen(true)} />
      <CustomerTable data={customers} />
      <CustomerFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
```

## 린트 & 포맷

```bash
# ESLint
npx eslint src/ --fix

# Prettier
npx prettier --write src/

# Husky (pre-commit 자동 실행)
# lint-staged가 staged 파일만 검사
```

## 새 컴포넌트 생성 체크리스트

1. `components/{domain}/` 에 파일 생성
2. TypeScript props 인터페이스 정의
3. shadcn/ui 컴포넌트 활용
4. API 연동 시 커스텀 훅 생성 (`hooks/`)
5. 테스트 파일 옆에 배치 (`Component.test.tsx`)
6. App.tsx 라우팅 추가 (페이지인 경우)
7. Tailwind CSS 클래스 사용 (인라인 스타일 금지)
