---
description: RSpec/Jest 테스트 자동 생성
---

# Role
당신은 테스트 생성기입니다. TDD 원칙에 따라 철저한 테스트를 작성합니다.

# Prerequisites
1. `.claude/principles/tdd.md` 파일을 읽으세요
2. 테스트 대상 코드를 먼저 분석하세요

# Task
사용자가 지정한 파일/클래스에 대해 테스트를 생성합니다.

## RSpec (Rails) 테스트

### 1. 모델 테스트
```ruby
# spec/models/{model}_spec.rb
require 'rails_helper'

RSpec.describe {Model}, type: :model do
  # Tenant
  it_behaves_like 'a tenant-scoped model'

  # Associations
  describe 'associations' do
    it { is_expected.to belong_to(:tenant) }
    it { is_expected.to belong_to(:customer).optional }
    it { is_expected.to have_many(:items).dependent(:destroy) }
  end

  # Validations
  describe 'validations' do
    it { is_expected.to validate_presence_of(:field) }
    it { is_expected.to validate_numericality_of(:amount).is_greater_than(0) }
    it { is_expected.to validate_inclusion_of(:status).in_array(%w[active inactive]) }
  end

  # Scopes
  describe 'scopes' do
    describe '.active' do
      let!(:active) { create(:{model}, status: 'active') }
      let!(:inactive) { create(:{model}, status: 'inactive') }

      it 'returns only active records' do
        expect(described_class.active).to contain_exactly(active)
      end
    end
  end

  # Instance methods
  describe '#total_amount' do
    let(:{model}) { create(:{model}) }
    let!(:items) { create_list(:item, 3, {model}: {model}, price: 10000) }

    it 'calculates sum of item prices' do
      expect({model}.total_amount).to eq(30000)
    end
  end
end
```

### 2. 서비스 테스트
```ruby
# spec/services/{service}_spec.rb
require 'rails_helper'

RSpec.describe {Service} do
  let(:tenant) { create(:tenant) }
  let(:user) { create(:user, tenant: tenant) }
  let(:params) { { field: 'value' } }

  subject(:service) { described_class.new(params, current_user: user) }

  before do
    ActsAsTenant.current_tenant = tenant
  end

  describe '#call' do
    context 'with valid params' do
      it 'creates a new record' do
        expect { service.call }.to change({Model}, :count).by(1)
      end

      it 'returns the created record' do
        result = service.call
        expect(result).to be_a({Model})
        expect(result).to be_persisted
      end
    end

    context 'with invalid params' do
      let(:params) { { field: nil } }

      it 'raises RecordInvalid' do
        expect { service.call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context 'with transaction rollback' do
      before do
        allow_any_instance_of({Model}).to receive(:save!).and_raise(ActiveRecord::RecordInvalid)
      end

      it 'does not create partial records' do
        expect { service.call rescue nil }.not_to change({Model}, :count)
      end
    end
  end
end
```

### 3. 컨트롤러 테스트 (Request Spec)
```ruby
# spec/requests/api/v1/{resources}_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::{Resources}', type: :request do
  let(:tenant) { create(:tenant) }
  let(:user) { create(:user, tenant: tenant) }
  let(:headers) { auth_headers(user) }

  before do
    ActsAsTenant.current_tenant = tenant
  end

  describe 'GET /api/v1/{resources}' do
    let!(:records) { create_list(:{resource}, 3, tenant: tenant) }

    it 'returns paginated list' do
      get '/api/v1/{resources}', headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['{resources}'].size).to eq(3)
    end

    it 'does not return other tenant records' do
      other_tenant = create(:tenant)
      create(:{resource}, tenant: other_tenant)

      get '/api/v1/{resources}', headers: headers

      expect(json_response['{resources}'].size).to eq(3)
    end
  end

  describe 'POST /api/v1/{resources}' do
    let(:valid_params) { { {resource}: attributes_for(:{resource}) } }

    context 'with valid params' do
      it 'creates a new record' do
        expect {
          post '/api/v1/{resources}', params: valid_params, headers: headers
        }.to change({Resource}, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end

    context 'with invalid params' do
      let(:invalid_params) { { {resource}: { field: nil } } }

      it 'returns validation errors' do
        post '/api/v1/{resources}', params: invalid_params, headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to be_present
      end
    end
  end
end
```

### 4. Factory 생성
```ruby
# spec/factories/{resources}.rb
FactoryBot.define do
  factory :{resource} do
    tenant
    association :customer
    field { 'value' }
    status { 'active' }
    amount { 10000 }

    trait :with_items do
      after(:create) do |{resource}|
        create_list(:item, 3, {resource}: {resource})
      end
    end

    trait :inactive do
      status { 'inactive' }
    end
  end
end
```

## Jest (React) 테스트

### 1. 컴포넌트 테스트
```typescript
// src/components/__tests__/{Component}.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { {Component} } from '../{Component}';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('{Component}', () => {
  it('renders correctly', () => {
    render(<{Component} />, { wrapper });
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<{Component} onSubmit={onSubmit} />, { wrapper });

    await user.type(screen.getByLabelText('이름'), '홍길동');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: '홍길동' });
    });
  });
});
```

### 2. 커스텀 훅 테스트
```typescript
// src/hooks/__tests__/{useHook}.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { {useHook} } from '../{useHook}';

describe('{useHook}', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => {useHook}(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches data successfully', async () => {
    const { result } = renderHook(() => {useHook}(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });
});
```

## Checklist
- [ ] Happy path 테스트가 있는가?
- [ ] 실패 케이스 테스트가 있는가?
- [ ] 경계값 테스트가 있는가?
- [ ] 멀티테넌시 격리 테스트가 있는가?
- [ ] Factory가 올바르게 정의되었는가?
- [ ] Mock이 최소화되었는가?

## Example Usage
```
/test-gen app/models/sale.rb
/test-gen app/services/sale_creation_service.rb
/test-gen frontend/src/components/SalePage.tsx
```
