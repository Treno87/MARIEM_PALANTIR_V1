# SPEC.md - The Living Source of Truth

> 이 파일은 프로젝트의 **진실의 원천(Source of Truth)**입니다.
> 작업 시작 시 "Read @SPEC.md and start phase X"와 같이 참조하세요.

## High-level Vision

### 제품명
**Mariem Palantir** - 미용실 거래 입력 시스템

### 목적
미용실 1호점용 CRM/POS MVP. **거래 입력**과 **리포트 조회**가 핵심 기능.

### 성공의 정의
1. 거래 입력부터 저장까지 30초 이내 완료
2. 모든 거래 유형(시술, 상품, 정액권)을 정확히 기록
3. 거래 시점의 가격 정보가 스냅샷으로 보존
4. 리포트 집계와 실제 거래 합계 일치
5. 정액권 원장 합계와 잔액 일치

### 핵심 가치
- **정확한 거래 기록**: 거래 시점의 가격/할인 정보를 스냅샷으로 보존
- **실시간 매출 파악**: 일/월/디자이너별/결제수단별 리포트
- **확장 가능성**: SaaS 멀티테넌트 구조 (현재는 1개 점포만 사용)

---

## 6 Core Areas

### 1. Commands (실행 명령어)

```bash
# Backend 설정
bundle install
rails db:create db:migrate db:seed

# Backend 서버 실행
rails server                    # localhost:3000

# Backend 테스트
bundle exec rspec               # 전체 테스트
bundle exec rspec spec/models/  # 모델 테스트만
bundle exec rspec --format documentation  # 상세 출력

# Frontend 설정
cd frontend && npm install

# Frontend 개발 서버
cd frontend && npm run dev      # localhost:5173

# Frontend 빌드
cd frontend && npm run build
cd frontend && npm run lint

# Docker (선택)
docker-compose up -d            # 백그라운드 실행
docker-compose logs -f          # 로그 확인
```

### 2. Testing (테스트)

| 영역 | 프레임워크 | 위치 | 실행 명령어 |
|------|-----------|------|------------|
| Backend Models | RSpec | `spec/models/` | `bundle exec rspec spec/models/` |
| Backend Requests | RSpec | `spec/requests/` | `bundle exec rspec spec/requests/` |
| Backend Services | RSpec | `spec/services/` | `bundle exec rspec spec/services/` |
| Frontend | Vitest | `frontend/src/__tests__/` | `cd frontend && npm test` |

**커버리지 목표**:
- 라인 커버리지: 80% 이상
- 브랜치 커버리지: 70% 이상

**TDD 사이클**:
```
RED → GREEN → REFACTOR
```

### 3. Project Structure (폴더 구조)

```
mariem_palantir_v1/
├── CLAUDE.md               # [헌법] 경계 및 규칙
├── SPEC.md                 # [진실의 원천] 이 파일
├── docs/
│   ├── specs/              # [모듈화] 세분화된 스펙
│   │   ├── database.md     # 스키마 정의
│   │   ├── api.md          # API 명세
│   │   └── ui.md           # UI/UX 명세
│   └── TASKS.md            # 구현 태스크 목록
│
├── .claude/
│   ├── commands/           # Slash 커맨드 정의
│   ├── principles/         # TDD, Clean Code 원칙
│   └── agents/             # AI 에이전트 페르소나
│
├── app/                    # Rails 애플리케이션
│   ├── controllers/api/    # API 컨트롤러
│   ├── models/             # ActiveRecord 모델
│   ├── services/           # 서비스 객체
│   └── views/api/          # Jbuilder 템플릿
│
├── config/
│   ├── routes.rb           # API 라우트
│   └── initializers/       # Devise, JWT, CORS 설정
│
├── db/
│   ├── migrate/            # 마이그레이션
│   ├── schema.rb           # 스키마 정의
│   └── seeds.rb            # 시드 데이터
│
├── spec/                   # RSpec 테스트
│   ├── models/
│   ├── requests/
│   └── services/
│
└── frontend/               # React 프론트엔드
    └── src/
        ├── components/
        │   ├── ui/         # shadcn/ui 컴포넌트
        │   ├── layout/     # Header, Sidebar
        │   ├── sale/       # 거래 입력 컴포넌트
        │   └── report/     # 리포트 컴포넌트
        ├── pages/          # 페이지 컴포넌트
        ├── hooks/          # 커스텀 훅
        ├── lib/            # API, 타입, 유틸리티
        └── contexts/       # React Context
```

### 4. Code Style (코드 스타일)

**상세한 코드 예시는 `CLAUDE.md`의 Code Style 섹션 참조**

핵심 원칙:
- Ruby: 서비스 객체 패턴, 스코프와 검증 명확히
- TypeScript: 엄격한 타입 정의, 커스텀 훅 활용
- 모든 코드: 의도를 드러내는 이름, 작은 함수

### 5. Git Workflow

```bash
# 브랜치 전략
main                    # 프로덕션 브랜치
├── feature/*           # 기능 개발
├── fix/*               # 버그 수정
└── refactor/*          # 리팩토링

# 커밋 메시지 형식
<type>: <description>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

# type 종류
feat:     새 기능
fix:      버그 수정
refactor: 리팩토링
chore:    유지보수
test:     테스트
docs:     문서
```

### 6. Boundaries (MVP 범위)

#### In Scope (MVP 포함)

| 기능 | 설명 |
|------|------|
| 거래 입력 화면 | 고객/디자이너 선택 → 시술/상품 추가 → 할인 → 결제 → 저장 |
| 리포트 화면 | 일/월 매출, 디자이너별, 결제수단별, 시술/상품별 집계 |
| 정액권 소진 | 결제 수단으로 정액권 사용 |
| 거래 취소 | status를 'voided'로 변경 (원본 보존) |

#### Out of Scope (MVP 제외)

| 기능 | 상태 |
|------|------|
| 순이익 계산 | ❌ 제외 |
| 급여/인센티브 계산 | ❌ 제외 |
| 재고 관리 | ❌ 제외 |
| KPI 대시보드 | ❌ 제외 |
| 자동 마케팅/메시지 | ❌ 제외 |
| 예약 관리 | ❌ 제외 |
| 정액권 판매/충전 | ❌ 수동 조정으로 처리 |

---

## Domain Decisions (도메인 결정사항)

| # | 질문 | 결정 |
|---|------|------|
| 1 | 고객 중복 기준 | `tenant_id + phone` |
| 2 | 거래일 기준 | `sale_date` 필드 (수동 변경 가능) |
| 3 | 할인 적용 단위 | 거래 전체 (MVP에서 1개만) |
| 4 | 분할 결제 | 가능 (여러 결제수단) |
| 5 | 거래 취소 | status를 'voided'로 변경 (원본 보존) |
| 6 | 디자이너 귀속 | 거래 단위 (1명) |
| 7 | 정액권 MVP | 소진만, 충전은 수동 조정 |
| 8 | 리포트 매출 기준 | 할인 후 순매출 |

---

## User Roles (사용자 역할)

| 역할 | 설명 | 주요 권한 |
|------|------|----------|
| owner | 원장 | 모든 기능, 직원 관리 |
| manager | 매니저 | 거래 관리, 리포트 조회, 할인 권한 |
| staff | 디자이너/스탭 | 거래 생성, 본인 거래 조회 |
| viewer | 열람자 | 조회만 가능 |

---

## Implementation Phases (구현 단계)

### Phase 1: 프로젝트 초기화
- Rails 8 API 프로젝트 생성
- 핵심 Gem 설치 (Devise, JWT, RSpec 등)
- Frontend 설정 (Vite + React + TypeScript)

### Phase 2: DB 스키마 구현
- 12개 테이블 마이그레이션 생성
- 모델 생성 및 관계 설정
- 시드 데이터 생성

### Phase 3: Backend API 구현
- 인증 API (sign_in, sign_out, me)
- 기초 데이터 API (customers, users, catalog)
- 거래 API (sales - CRUD + void)
- 리포트 API (daily, monthly, by_staff, by_method)

### Phase 4: Frontend 구현
- 레이아웃 및 라우팅
- 거래 입력 화면 (SalePage)
- 리포트 화면 (ReportPage)
- 거래 목록 화면 (SaleListPage)

### Phase 5: 테스트 및 배포
- 모델/Request/Service 테스트
- E2E 시나리오 테스트
- Docker 이미지 빌드
- 배포 (Railway 또는 Render)

---

## Related Documents

| 문서 | 설명 | 용도 |
|------|------|------|
| `CLAUDE.md` | 프로젝트 헌법 | 경계, 규칙, 코드 스타일 |
| `docs/specs/database.md` | 스키마 정의 | DB 작업 시 참조 |
| `docs/specs/api.md` | API 명세 | API 개발 시 참조 |
| `docs/specs/ui.md` | UI/UX 명세 | 프론트엔드 작업 시 참조 |
| `docs/TASKS.md` | 태스크 목록 | 진행 상황 추적 |
