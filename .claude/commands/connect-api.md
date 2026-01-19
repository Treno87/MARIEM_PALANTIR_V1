---
description: Mock 데이터를 실제 API로 연동
---

# Role
당신은 API 연동 전문가입니다.

# Prerequisites
1. `docs/specs/api.md` 파일을 읽어 API 명세를 확인하세요
2. 현재 Mock 데이터 구현을 확인하세요

# Task
Mock 데이터로 구현된 컴포넌트를 실제 Rails API와 연동합니다.

## 연동 단계

### 1. API 클라이언트 설정

```typescript
// frontend/src/lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. API 함수 생성

```typescript
// frontend/src/lib/api/{resource}.ts
import { apiClient } from './client';
import type { {Resource}, {Resource}QueryParams } from '@/types/{resource}';

interface PaginatedResponse<T> {
  {resources}: T[];
  meta: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

export const {resource}Api = {
  getAll: async (params?: {Resource}QueryParams): Promise<PaginatedResponse<{Resource}>> => {
    const { data } = await apiClient.get('/{resources}', { params });
    return data;
  },

  getById: async (id: number): Promise<{Resource}> => {
    const { data } = await apiClient.get(`/{resources}/${id}`);
    return data.{resource};
  },

  create: async (payload: Omit<{Resource}, 'id' | 'created_at' | 'updated_at'>): Promise<{Resource}> => {
    const { data } = await apiClient.post('/{resources}', { {resource}: payload });
    return data.{resource};
  },

  update: async (id: number, payload: Partial<{Resource}>): Promise<{Resource}> => {
    const { data } = await apiClient.patch(`/{resources}/${id}`, { {resource}: payload });
    return data.{resource};
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/{resources}/${id}`);
  },
};
```

### 3. React Query 훅 수정

```typescript
// frontend/src/hooks/use{Resource}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {resource}Api } from '@/lib/api/{resource}';
import type { {Resource}, {Resource}QueryParams } from '@/types/{resource}';

// Before: Mock 데이터
// const mockData: {Resource}[] = [...]

// After: 실제 API 호출
export function use{Resource}s(params?: {Resource}QueryParams) {
  return useQuery({
    queryKey: ['{resources}', params],
    queryFn: () => {resource}Api.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreate{Resource}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: {resource}Api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{resources}'] });
    },
    onError: (error: any) => {
      // 에러 처리
      console.error('생성 실패:', error.response?.data?.error);
    },
  });
}
```

### 4. 환경 변수 설정

```bash
# frontend/.env.development
VITE_API_URL=http://localhost:3000/api/v1

# frontend/.env.production
VITE_API_URL=/api/v1
```

### 5. CORS 설정 (Rails)

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'localhost:5173', 'localhost:3001'  # Vite 개발 서버

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization'],
      credentials: true
  end
end
```

### 6. 컴포넌트 수정

```typescript
// Before: Mock 데이터 직접 사용
function {Resource}Page() {
  const [data] = useState(MOCK_DATA);
  // ...
}

// After: React Query 사용
function {Resource}Page() {
  const { data, isLoading, error } = use{Resource}s();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    // data.{resources}로 접근
  );
}
```

## 연동 체크리스트

### API 측
- [ ] 엔드포인트가 구현되었는가?
- [ ] 인증이 설정되었는가?
- [ ] CORS가 설정되었는가?
- [ ] 응답 형식이 일관되는가?

### 프론트엔드 측
- [ ] API 클라이언트가 설정되었는가?
- [ ] 환경 변수가 설정되었는가?
- [ ] React Query 훅이 수정되었는가?
- [ ] 에러 상태가 처리되었는가?
- [ ] 로딩 상태가 처리되었는가?

## 점진적 마이그레이션

Mock과 실제 API를 동시에 유지하면서 점진적으로 전환:

```typescript
// frontend/src/lib/api/{resource}.ts
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const {resource}Api = {
  getAll: async (params?: {Resource}QueryParams) => {
    if (USE_MOCK) {
      return mockGetAll(params);
    }
    const { data } = await apiClient.get('/{resources}', { params });
    return data;
  },
  // ...
};
```

## Example Usage
```
/connect-api SalePage - sales API 연동
/connect-api CustomerSearch - customers API 연동
/connect-api PaymentSection - payments API 연동
```
