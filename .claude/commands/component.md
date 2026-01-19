---
description: React 컴포넌트 및 커스텀 훅 생성
---

# Role
당신은 React 컴포넌트 생성기입니다.

# Prerequisites
1. `.claude/agents/react-expert.md` 원칙을 준수하세요
2. 기존 컴포넌트 구조를 확인하세요: `ls frontend/src/components/`

# Task
사용자가 요청한 React 컴포넌트를 생성합니다.

## 컴포넌트 유형

### 1. 페이지 컴포넌트
```typescript
// frontend/src/components/{feature}/{Feature}Page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface {Feature}PageProps {
  // props
}

export function {Feature}Page({}: {Feature}PageProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, error } = use{Feature}s();

  if (isLoading) return <{Feature}Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{Feature} 관리</h1>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <{Feature}List
          data={data}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <{Feature}Detail id={selectedId} />
      </main>
    </div>
  );
}
```

### 2. 폼 컴포넌트
```typescript
// frontend/src/components/{feature}/{Feature}Form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const {feature}Schema = z.object({
  name: z.string().min(1, '필수 입력입니다'),
  // ...other fields
});

type {Feature}FormData = z.infer<typeof {feature}Schema>;

interface {Feature}FormProps {
  initialData?: Partial<{Feature}FormData>;
  onSubmit: (data: {Feature}FormData) => void;
  isSubmitting?: boolean;
}

export function {Feature}Form({
  initialData,
  onSubmit,
  isSubmitting = false,
}: {Feature}FormProps) {
  const form = useForm<{Feature}FormData>({
    resolver: zodResolver({feature}Schema),
    defaultValues: {
      name: '',
      ...initialData,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            초기화
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 3. 목록 컴포넌트
```typescript
// frontend/src/components/{feature}/{Feature}List.tsx
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface {Feature}ListProps {
  data: {Feature}[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function {Feature}List({ data, selectedId, onSelect }: {Feature}ListProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2 pr-4">
        {data.map((item) => (
          <Card
            key={item.id}
            className={cn(
              'cursor-pointer transition-colors hover:bg-accent',
              selectedId === item.id && 'border-primary bg-accent'
            )}
            onClick={() => onSelect(item.id)}
          >
            <CardContent className="p-4">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
```

### 4. 커스텀 훅
```typescript
// frontend/src/hooks/use{Feature}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {feature}Api } from '@/lib/api/{feature}';

export function use{Feature}s(params?: {Feature}QueryParams) {
  return useQuery({
    queryKey: ['{features}', params],
    queryFn: () => {feature}Api.getAll(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

export function use{Feature}(id: number | null) {
  return useQuery({
    queryKey: ['{features}', id],
    queryFn: () => {feature}Api.getById(id!),
    enabled: id !== null,
  });
}

export function useCreate{Feature}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: {feature}Api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{features}'] });
    },
  });
}

export function useUpdate{Feature}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{Feature}> }) =>
      {feature}Api.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['{features}', id] });
      queryClient.invalidateQueries({ queryKey: ['{features}'] });
    },
  });
}
```

### 5. 타입 정의
```typescript
// frontend/src/types/{feature}.ts
export interface {Feature} {
  id: number;
  name: string;
  description?: string;
  status: '{feature}Status';
  created_at: string;
  updated_at: string;
}

export type {Feature}Status = 'active' | 'inactive';

export interface {Feature}QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: {Feature}Status;
}
```

## 폴더 구조

```
frontend/src/components/{feature}/
├── {Feature}Page.tsx       # 페이지 컴포넌트
├── {Feature}Form.tsx       # 폼 컴포넌트
├── {Feature}List.tsx       # 목록 컴포넌트
├── {Feature}Detail.tsx     # 상세 컴포넌트
├── {Feature}Skeleton.tsx   # 로딩 스켈레톤
└── index.ts                # 배럴 export

frontend/src/hooks/
└── use{Feature}.ts         # 커스텀 훅

frontend/src/types/
└── {feature}.ts            # 타입 정의
```

## Checklist
- [ ] TypeScript 타입이 정의되었는가?
- [ ] React Hook Form + Zod를 사용했는가?
- [ ] React Query로 서버 상태를 관리하는가?
- [ ] shadcn/ui 컴포넌트를 활용했는가?
- [ ] 로딩/에러 상태가 처리되었는가?
- [ ] 컴포넌트가 300줄 이하인가?

## Example Usage
```
/component CustomerForm - 고객 등록 폼
/component ServiceList - 시술 목록
/component PaymentSection - 결제 섹션
```
