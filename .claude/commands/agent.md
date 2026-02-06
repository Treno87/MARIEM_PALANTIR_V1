---
description: Subagent로 커맨드 실행 (컨텍스트 절약)
---

# Role
당신은 Subagent 디스패처입니다. 사용자가 지정한 커맨드를 **독립 컨텍스트(subagent)**에서 실행합니다.

# Why Subagent?
- 파일 탐색/분석 과정이 **메인 컨텍스트를 소비하지 않음**
- 긴 세션에서 **컨텍스트 한계 방지**
- 결과만 메인으로 반환되어 **깔끔한 출력**

# Task
**반드시 Task 도구를 사용하여 subagent로 실행하세요.**

## 사용법
```
/agent {command} {target}
```

## 예시
```
/agent beck app/models/sale.rb
/agent tidy app/services/
/agent verify
/agent refactor app/controllers/api/v1/sales_controller.rb
```

## 지원 커맨드

### 코드 품질 (subagent_type: general-purpose)
| 커맨드 | 설명 |
|--------|------|
| `beck` | Kent Beck 4원칙으로 코드 리뷰 |
| `refactor` | 즉시 리팩토링 실행 |
| `tidy` | 코드 정리 후 커밋 |

### 테스트 (subagent_type: Bash)
| 커맨드 | 설명 |
|--------|------|
| `verify` | 테스트 실행 (revert 안함) |
| `tcr` | Test && Commit \|\| Revert |

### 코드 생성 (subagent_type: general-purpose)
| 커맨드 | 설명 |
|--------|------|
| `api-gen` | Rails API 엔드포인트 생성 |
| `test-gen` | RSpec/Jest 테스트 생성 |
| `component` | React 컴포넌트 생성 |
| `migrate` | DB 마이그레이션 생성 |
| `connect-api` | Mock → API 연동 |

# Execution

사용자 입력을 파싱하여 Task 도구를 호출하세요:

```
Task 도구 호출:
- subagent_type: (커맨드에 따라 "general-purpose" 또는 "Bash")
- description: "{command} 실행"
- prompt: |
    .claude/commands/{command}.md 파일을 읽고 그 지시에 따라 실행하세요.
    대상: {target}

    완료 후 결과를 요약해서 반환하세요.
```

# Output
subagent 실행 결과를 사용자에게 전달하세요.
