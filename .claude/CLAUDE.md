# .claude Directory Guide

> 이 폴더는 Claude Code의 확장 기능을 정의합니다.
> 프로젝트 헌법은 루트의 `CLAUDE.md`를 참조하세요.

## Directory Structure

```
.claude/
├── CLAUDE.md               # 이 파일 - 폴더 가이드
├── settings.json           # Claude Code 설정 (훅, 권한)
├── mcp-setup.md            # MCP 서버 설정 가이드
├── commands/               # Slash 커맨드 정의
│   ├── beck.md             # /beck - 코드 리뷰 (제안만)
│   ├── refactor.md         # /refactor - 리팩토링 실행
│   ├── tidy.md             # /tidy - 코드 정리 후 커밋
│   ├── tcr.md              # /tcr - Test && Commit || Revert
│   ├── verify.md           # /verify - 테스트 실행
│   ├── api-gen.md          # /api-gen - Rails API 자동 생성
│   ├── test-gen.md         # /test-gen - RSpec/Jest 테스트 생성
│   ├── migrate.md          # /migrate - 안전한 DB 마이그레이션
│   ├── component.md        # /component - React 컴포넌트 생성
│   └── connect-api.md      # /connect-api - Mock → API 연동
├── hooks/                  # PostToolUse 훅 (자동 품질 검사)
│   ├── quality-guard.sh    # 메인 훅 - Write/Edit 시 자동 실행
│   └── checkers/           # 언어별 검사기
│       ├── ruby-checker.sh      # RuboCop 검사
│       ├── typescript-checker.sh # ESLint 검사
│       └── security-checker.sh   # 시크릿 감지
├── principles/             # 개발 원칙
│   ├── tdd.md              # TDD 가이드라인
│   └── clean-code.md       # Clean Code 원칙
├── skills/                 # 프로젝트 도메인 스킬
│   ├── mariem-architecture.md  # 아키텍처, 멀티테넌시, 폴더 구조
│   ├── mariem-testing.md       # RSpec + Vitest 테스트 패턴
│   ├── mariem-models.md        # 26개 모델, 서비스 객체, 관계
│   └── mariem-frontend.md      # React 19, 컴포넌트, 훅 패턴
└── agents/                 # AI 에이전트 페르소나
    ├── qa-engineer.md      # QA 엔지니어
    ├── security-reviewer.md # 보안 리뷰어
    ├── code-reviewer.md    # 코드 리뷰어
    ├── rails-expert.md     # Rails 8 전문가
    ├── react-expert.md     # React 18 전문가
    ├── db-architect.md     # DB 아키텍트
    └── api-designer.md     # API 설계자
```

## Commands Usage

```bash
/agent {command} {target}
```

### TDD 사이클에서 사용

| 단계 | 커맨드 | 설명 |
|------|--------|------|
| REFACTOR | `/agent beck {file}` | Kent Beck 4원칙으로 리뷰 |
| REFACTOR | `/agent refactor {file}` | 즉시 리팩토링 실행 |
| REFACTOR | `/agent tidy` | 코드 정리 후 커밋 |
| 검증 | `/agent tcr` | Test && Commit \|\| Revert |
| 검증 | `/agent verify` | 테스트 실행 (revert 안함) |

### 코드 생성

| 커맨드 | 용도 |
|--------|------|
| `/agent api-gen {resource}` | Rails API 엔드포인트 |
| `/agent test-gen {file}` | RSpec/Jest 테스트 |
| `/agent migrate {설명}` | DB 마이그레이션 |
| `/agent component {name}` | React 컴포넌트 |
| `/agent connect-api {page}` | Mock → API 연동 |

## Agents Usage

에이전트를 활성화하려면:

```
Read @.claude/agents/{agent-name}.md and review the code
```

### 사용 가능한 에이전트

| 에이전트 | 용도 |
|----------|------|
| **qa-engineer** | 테스트 커버리지, 엣지 케이스 검토 |
| **security-reviewer** | 보안 취약점 검토 |
| **code-reviewer** | 일반 코드 리뷰 |
| **rails-expert** | 서비스 객체, 멀티테넌시, N+1 방지 |
| **react-expert** | 컴포넌트 분리, 커스텀 훅, React Query |
| **db-architect** | 스키마 설계, 인덱스 최적화 |
| **api-designer** | RESTful 설계, 에러 처리 표준화 |

### 에이전트 사용 예시

```
# Rails 코드 리뷰
Read @.claude/agents/rails-expert.md and review app/services/sale_creation_service.rb

# React 컴포넌트 리뷰
Read @.claude/agents/react-expert.md and review frontend/src/components/sale/SalePage.tsx

# DB 스키마 검토
Read @.claude/agents/db-architect.md and review db/schema.rb
```

## Hooks (PostToolUse 자동 품질 검사)

Claude Code가 파일을 Write/Edit할 때마다 자동으로 코드 품질을 검사합니다.

### 동작 흐름

```
1. Claude가 파일 Write/Edit 실행
        ↓
2. PostToolUse 훅 트리거
        ↓
3. quality-guard.sh 실행
        ↓
4. 보안 검사 (모든 파일)
   └─ secrets 패턴 감지
        ↓
5. 언어별 검사
   ├─ .rb → RuboCop
   └─ .ts/.tsx/.js/.jsx → ESLint
        ↓
6. 결과 반환
   ├─ Exit 0: 성공 (계속 진행)
   └─ Exit 2: 실패 (Claude에 피드백)
```

### 검사 내용

| 검사기 | 대상 | 검사 항목 |
|--------|------|-----------|
| **security-checker** | 모든 파일 | 하드코딩된 비밀번호, API 키, 시크릿, AWS 키, GitHub 토큰, Private Key |
| **ruby-checker** | `.rb` 파일 | RuboCop 규칙 위반 |
| **typescript-checker** | `.ts/.tsx/.js/.jsx` 파일 | ESLint 규칙 위반 |

### 수동 테스트

```bash
# 훅 직접 테스트
echo '{"tool_name":"Write","tool_input":{"file_path":"test.rb"}}' | \
  bash .claude/hooks/quality-guard.sh

# 개별 검사기 테스트
bash .claude/hooks/checkers/security-checker.sh path/to/file.rb
bash .claude/hooks/checkers/ruby-checker.sh path/to/file.rb
bash .claude/hooks/checkers/typescript-checker.sh path/to/file.tsx
```

### 훅 비활성화

특정 세션에서 훅을 비활성화하려면:
```bash
# settings.local.json에서 hooks 설정을 빈 배열로 override
```

---

## MCP (Model Context Protocol) Setup

MCP 서버 설정 방법은 `mcp-setup.md`를 참조하세요.

### 지원 MCP 서버

| MCP | 용도 |
|-----|------|
| **PostgreSQL MCP** | DB 직접 쿼리, 스키마 검증, 리포트 테스트 |
| **GitHub MCP** | 이슈/PR 자동화, 태스크 관리 |

## Related Documents

- **루트 CLAUDE.md** - 프로젝트 헌법, 3단계 경계
- **루트 SPEC.md** - 프로젝트 진실의 원천
- **docs/specs/** - 모듈화된 스펙 문서
