# CLAUDE.md - Project Constitution

> 이 파일은 Claude Code가 세션 시작 시 자동으로 로드하는 **프로젝트 헌법**입니다.
> 모든 AI 작업의 안전 가드레일과 불변의 규칙을 정의합니다.

## Three-tier Boundaries (3단계 경계)

### ✅ Always Do

1. **테스트 먼저 실행**: 코드 변경 전 `bundle exec rspec` 또는 `npm test` 실행
2. **TDD 사이클 준수**: RED → GREEN → REFACTOR
3. **한국어 응답**: 모든 대화는 한국어로
4. **변경 전 설명**: 코드 수정 전 무엇을 왜 바꾸는지 설명
5. **커밋 메시지 명확히**: 컨벤션 준수 (feat/fix/refactor/chore)
6. **SPEC.md 참조**: 작업 시작 시 `@SPEC.md` 읽고 컨텍스트 확인
7. **tenant_id 포함**: 모든 쿼리에 멀티테넌시 조건 적용

### ⚠️ Ask First

1. **DB 스키마 변경**: 마이그레이션 생성 전 사용자 확인
2. **새 의존성 추가**: gem/npm 패키지 추가 전 사용자 확인
3. **API 엔드포인트 변경**: 기존 API 시그니처 변경 시 사용자 확인
4. **환경 설정 변경**: config/ 폴더 내 파일 수정 시 사용자 확인
5. **테스트 삭제**: 기존 테스트 제거 시 사용자 확인

### 🚫 Never Do

1. **`.env` 파일 수정 금지**: 시크릿 키, API 키 절대 수정하지 않음
2. **시크릿 커밋 금지**: credentials, secrets 파일 커밋하지 않음
3. **프로덕션 DB 직접 조작 금지**: 로컬/개발 환경에서만 작업
4. **force push 금지**: `git push --force` 사용하지 않음
5. **audit_logs 삭제 금지**: 감사 로그는 절대 삭제하지 않음
6. **Out of Scope 기능 구현 금지**: MVP 제외 범위 기능 구현하지 않음

---

## Code Principles (필수 준수)

> 모든 코드 생성 시 반드시 적용해야 하는 원칙입니다.

### TDD (Test-Driven Development)

- **RED**: 실패하는 테스트를 먼저 작성
- **GREEN**: 테스트를 통과하는 최소한의 코드 작성
- **REFACTOR**: 중복 제거, 코드 개선
- 테스트 없이 프로덕션 코드 작성 금지
- 테스트는 문서이자 설계 도구
- 상세: `.claude/principles/tdd.md`

### Clean Code

- **함수**: 한 가지 일만, 작게, 인수는 적게 (0~2개)
- **이름**: 의도를 드러내는 명확한 이름 사용
- **주석**: 코드로 의도를 표현, 불필요한 주석 금지
- **SOLID 원칙 준수**:
  - Single Responsibility (단일 책임)
  - Open/Closed (확장에 열림, 수정에 닫힘)
  - Liskov Substitution (리스코프 치환)
  - Interface Segregation (인터페이스 분리)
  - Dependency Inversion (의존성 역전)
- **중복 제거**: DRY (Don't Repeat Yourself)
- **Null 반환/전달 금지**: Optional, 빈 배열 사용
- 상세: `.claude/principles/clean-code.md`

---

## Tech Stack (기술 스택)

### Backend
- **Ruby 3.3+** / **Rails 8.0+** (API 모드)
- **PostgreSQL 16+**
- **Devise + JWT** (인증)
- **Pundit** (권한)
- **RSpec** (테스트)
- **acts_as_tenant** (멀티테넌시)

### Frontend
- **Vite 5.0+** / **React 18.2+** / **TypeScript 5.3+**
- **Tailwind CSS 3.4+** / **shadcn/ui**
- **React Query 5.0+** (서버 상태)
- **React Hook Form + Zod** (폼)
- **Recharts** (차트)

---

## Commands (실행 명령어)

```bash
# Backend
bundle install                              # 의존성 설치
rails db:create db:migrate db:seed          # DB 설정
rails server                                # 서버 실행
bundle exec rspec                           # 전체 테스트
bundle exec rspec spec/models/sale_spec.rb  # 단일 파일
bundle exec rspec spec/models/sale_spec.rb:42  # 특정 라인

# Frontend
cd frontend && npm install                  # 의존성 설치
cd frontend && npm run dev                  # 개발 서버
cd frontend && npm test                     # 테스트
cd frontend && npm run build                # 빌드
```

---

## Code Style (코드 스타일)

### Ruby/Rails

```ruby
# Good: 명확한 서비스 객체
class SaleCreationService
  def initialize(params, current_user:)
    @params = params
    @current_user = current_user
  end

  def call
    ActiveRecord::Base.transaction do
      create_sale
      create_items
      process_payments
    end
  end

  private

  def create_sale
    # 구현
  end
end

# Good: 스코프와 검증
class Sale < ApplicationRecord
  acts_as_tenant(:tenant)

  belongs_to :customer
  belongs_to :staff, class_name: 'User'

  validates :sale_date, presence: true
  validates :status, inclusion: { in: %w[completed voided refunded] }

  scope :completed, -> { where(status: 'completed') }
  scope :for_date, ->(date) { where(sale_date: date) }
end
```

### TypeScript/React

```typescript
// Good: 타입 정의
interface Sale {
  id: number;
  customer_id: number;
  staff_id: number;
  sale_date: string;
  status: 'completed' | 'voided' | 'refunded';
  items: SaleItem[];
  payments: Payment[];
}

// Good: 커스텀 훅
function useSales(date: string) {
  return useQuery({
    queryKey: ['sales', date],
    queryFn: () => api.getSales({ date }),
  });
}

// Good: 컴포넌트
function SaleForm({ onSubmit }: SaleFormProps) {
  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

---

## Git Workflow

```bash
# 브랜치 명명
feature/거래-입력-화면
fix/정액권-잔액-계산-오류
refactor/sale-service-분리

# 커밋 메시지 형식
feat: 거래 입력 화면 구현
fix: 정액권 잔액 계산 오류 수정
refactor: SaleCreationService 분리
chore: 불필요한 의존성 제거
test: Sale 모델 테스트 추가
docs: API 명세 업데이트
```

---

## Project Structure (폴더 구조)

```
mariem_palantir_v1/
├── CLAUDE.md           # [헌법] 이 파일 - 경계 및 규칙
├── SPEC.md             # [진실의 원천] 프로젝트 로드맵
├── docs/
│   ├── specs/          # [모듈화] 세분화된 스펙
│   │   ├── database.md
│   │   ├── api.md
│   │   └── ui.md
│   └── TASKS.md        # 구현 태스크 목록
├── .claude/
│   ├── commands/       # Claude Code 커맨드
│   ├── principles/     # TDD, Clean Code 등 원칙
│   └── agents/         # AI 에이전트 페르소나
├── app/                # Rails 앱
├── spec/               # RSpec 테스트
└── frontend/           # React 프론트엔드
```

---

## Slash Commands

| 명령어 | 설명 |
|--------|------|
| `/beck` | Kent Beck의 4원칙으로 코드 리뷰 (제안만) |
| `/refactor` | Kent Beck의 4원칙으로 즉시 리팩토링 실행 |
| `/tidy` | 코드 정리 후 즉시 커밋 (기능 변경 없음) |
| `/tcr` | Test && Commit \|\| Revert 실행 |
| `/verify` | 테스트 실행 (실패해도 revert 안함) |

---

## Related Documents

### 필수 참조
- **.claude/principles/tdd.md** - TDD 상세 가이드라인
- **.claude/principles/clean-code.md** - Clean Code 상세 원칙

### 프로젝트 스펙
- **SPEC.md** - 프로젝트 목표, MVP 범위, 6 Core Areas
- **docs/specs/database.md** - 스키마 정의
- **docs/specs/api.md** - API 명세
- **docs/specs/ui.md** - UI/UX 명세
- **docs/TASKS.md** - 구현 태스크 목록
