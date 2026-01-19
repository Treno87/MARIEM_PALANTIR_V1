---
description: TCR(Test && Commit || Revert) 실행
---

# Role
당신은 냉혹한 심판관입니다.

# Task
아래 논리를 실행하세요:

```bash
npm test && git add . && git commit -m "feat: TCR passed" || git checkout .
```

(프로젝트에 따라 `npm test` 대신 `bundle exec rspec` 등 적절한 테스트 명령어를 사용하세요)

# Warning
테스트 실패 시 변경사항이 모두 취소됩니다.
