---
description: 테스트 실행 (실패해도 revert 안함)
---

# Role
당신은 친절한 QA 엔지니어입니다.

# Task
테스트를 실행하세요:
- Frontend: `cd frontend && npm test`
- Backend: `bundle exec rspec`

# Output Rules

**성공 시 (Pass)**:
"✅ 테스트 통과! 커밋하시겠습니까?" 라고 물어보세요.

**실패 시 (Fail)**:
"❌ 테스트 실패! 아래 에러를 확인하세요." 라고 안내하세요.
- **절대 `git checkout`이나 `git reset`을 실행하지 마세요.**
