---
name: mariem-testing
description: Mariem Palantir 테스트 패턴, RSpec + Vitest 실행 방법, Factory Bot, 단위/통합 테스트 가이드. Use when writing tests, running tests, or reviewing test coverage.
---

# Mariem Testing Skill

## 테스트 프레임워크

| 영역 | 프레임워크 | 설정 파일 |
|------|-----------|----------|
| **Backend** | RSpec Rails 7.0 | spec/rails_helper.rb |
| **Frontend** | Vitest 4.0 + React Testing Library | frontend/vitest.config.ts |

## Backend 테스트 (RSpec)

### 실행 명령어

```bash
# 전체 실행
bundle exec rspec

# 단일 파일
bundle exec rspec spec/models/visit_spec.rb

# 특정 라인
bundle exec rspec spec/models/visit_spec.rb:42

# 특정 태그
bundle exec rspec --tag focus
```

### 테스트 구조

```
spec/
├── models/              # 모델 유닛 테스트
├── requests/            # API 통합 테스트
│   └── api/             # /api 네임스페이스 테스트
├── services/            # 서비스 객체 테스트
├── factories/           # FactoryBot 팩토리
├── support/             # 테스트 헬퍼
│   └── auth_helpers.rb  # JWT 인증 헬퍼
├── rails_helper.rb      # Rails 통합 설정
└── spec_helper.rb       # 기본 RSpec 설정
```

### Factory Bot 패턴

```ruby
# 기본 팩토리
FactoryBot.define do
  factory :visit do
    association :store
    association :customer
    visited_at { Time.current }
    status { 'draft' }
    visit_type { 'new' }
  end
end

# 트레잇 활용
factory :visit do
  trait :finalized do
    status { 'finalized' }
  end

  trait :with_items do
    after(:create) do |visit|
      create(:sale_line_item, visit: visit, store: visit.store)
    end
  end
end
```

### 모델 테스트 패턴

```ruby
RSpec.describe Visit, type: :model do
  # 연관 관계
  describe 'associations' do
    it { should belong_to(:customer) }
    it { should have_many(:sale_line_items) }
    it { should have_many(:payments) }
  end

  # 검증
  describe 'validations' do
    it { should validate_presence_of(:visited_at) }
    it { should validate_inclusion_of(:status).in_array(%w[draft finalized]) }
  end

  # 스코프
  describe 'scopes' do
    describe '.finalized' do
      it 'returns only finalized visits' do
        finalized = create(:visit, :finalized)
        draft = create(:visit)
        expect(Visit.finalized).to include(finalized)
        expect(Visit.finalized).not_to include(draft)
      end
    end
  end

  # 비즈니스 로직
  describe '#finalize!' do
    it 'changes status to finalized' do
      visit = create(:visit)
      visit.finalize!
      expect(visit.status).to eq('finalized')
    end
  end
end
```

### API 테스트 패턴

```ruby
RSpec.describe 'Api::Visits', type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/visits' do
    it 'returns visits for current store' do
      create(:visit, store: store)
      get '/api/visits', headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(1)
    end
  end
end
```

### Shoulda Matchers 활용

```ruby
# spec/support/shoulda_matchers.rb
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
```

## Frontend 테스트 (Vitest)

### 실행 명령어

```bash
cd frontend

# 전체 실행
npm test

# Watch 모드
npx vitest

# 단일 파일
npx vitest src/hooks/useCart.test.ts

# 커버리지
npx vitest --coverage
```

### 테스트 구조

```
frontend/src/
├── hooks/
│   ├── useCart.ts
│   └── useCart.test.ts          # 훅 바로 옆에 테스트
├── components/
│   ├── sale/
│   │   ├── SalePage.tsx
│   │   └── SalePage.test.tsx    # 컴포넌트 옆에 테스트
│   └── customers/
│       └── CustomerFormModal.test.tsx
└── test/
    └── setup.ts                 # 글로벌 테스트 설정
```

### 커스텀 훅 테스트 패턴

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';

describe('useCart', () => {
  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 1,
        name: 'Test Service',
        price: 10000,
      });
    });

    expect(result.current.items).toHaveLength(1);
  });
});
```

### 컴포넌트 테스트 패턴

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalePage } from './SalePage';

describe('SalePage', () => {
  it('renders sale interface', () => {
    render(<SalePage />);
    expect(screen.getByText('거래 입력')).toBeInTheDocument();
  });
});
```

## TDD 워크플로우

```
1. RED:   실패하는 테스트 작성 → bundle exec rspec / npx vitest
2. GREEN: 최소한의 코드로 통과 → 테스트 재실행
3. REFACTOR: /agent beck → /agent tidy
4. VERIFY: /agent tcr (테스트 && 커밋 || 되돌리기)
```

## 핵심 규칙

1. **테스트 먼저** 작성 (TDD 필수)
2. **Factory Bot** 으로 테스트 데이터 생성 (fixtures 사용 안 함)
3. **멀티테넌시** 테스트 시 store 연관 반드시 설정
4. **API 테스트**에서 JWT 인증 헬퍼 사용
5. **프론트엔드** 테스트는 컴포넌트/훅 파일 옆에 배치
