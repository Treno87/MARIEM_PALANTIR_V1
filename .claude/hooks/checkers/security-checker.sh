#!/bin/bash
# .claude/hooks/checkers/security-checker.sh
# 시크릿/민감 정보 감지 검사
#
# 사용법: security-checker.sh <file_path>
# Exit codes:
#   0: 보안 이슈 없음
#   1: 시크릿 감지됨

set -euo pipefail

FILE_PATH="${1:-}"

if [[ -z "$FILE_PATH" ]]; then
  echo "Usage: security-checker.sh <file_path>" >&2
  exit 1
fi

if [[ ! -f "$FILE_PATH" ]]; then
  echo "File not found: $FILE_PATH" >&2
  exit 1
fi

# 검사 제외 파일들
BASENAME=$(basename "$FILE_PATH")
EXTENSION="${FILE_PATH##*.}"

# 바이너리 파일, 락 파일 등 제외
case "$BASENAME" in
  *.lock|package-lock.json|yarn.lock|Gemfile.lock)
    exit 0
    ;;
esac

# 이미지, 폰트 등 제외
case "$EXTENSION" in
  png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)
    exit 0
    ;;
esac

# 민감한 패턴들
# 각 패턴을 개별 검사하여 더 정확한 에러 메시지 제공
FOUND_SECRETS=""

# 1. 하드코딩된 비밀번호
if grep -qiE 'password\s*[:=]\s*["\x27][^"\x27]{8,}["\x27]' "$FILE_PATH" 2>/dev/null; then
  # 예외: 테스트 파일, 스키마 정의 등
  if [[ ! "$FILE_PATH" =~ (spec|test|schema|migration|example) ]]; then
    FOUND_SECRETS+="  - Hardcoded password detected\n"
  fi
fi

# 2. API 키 패턴
if grep -qiE 'api[_-]?key\s*[:=]\s*["\x27][a-zA-Z0-9]{20,}["\x27]' "$FILE_PATH" 2>/dev/null; then
  FOUND_SECRETS+="  - Hardcoded API key detected\n"
fi

# 3. Secret 패턴
if grep -qiE '(secret|token)[_-]?(key)?\s*[:=]\s*["\x27][a-zA-Z0-9_-]{16,}["\x27]' "$FILE_PATH" 2>/dev/null; then
  # ENV 참조는 제외
  if ! grep -qiE '(ENV|process\.env|config)\[' "$FILE_PATH" 2>/dev/null; then
    FOUND_SECRETS+="  - Hardcoded secret/token detected\n"
  fi
fi

# 4. AWS Credentials
if grep -qE 'AKIA[0-9A-Z]{16}' "$FILE_PATH" 2>/dev/null; then
  FOUND_SECRETS+="  - AWS Access Key ID detected\n"
fi

# 5. GitHub Personal Access Token
if grep -qE 'ghp_[a-zA-Z0-9]{36}' "$FILE_PATH" 2>/dev/null; then
  FOUND_SECRETS+="  - GitHub Personal Access Token detected\n"
fi

# 6. OpenAI API Key
if grep -qE 'sk-[a-zA-Z0-9]{48}' "$FILE_PATH" 2>/dev/null; then
  FOUND_SECRETS+="  - OpenAI API Key detected\n"
fi

# 7. Private Key 블록
if grep -qE 'BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY' "$FILE_PATH" 2>/dev/null; then
  FOUND_SECRETS+="  - Private key detected\n"
fi

# 8. JWT Token (하드코딩된 경우)
if grep -qE 'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.' "$FILE_PATH" 2>/dev/null; then
  # 테스트 파일 제외
  if [[ ! "$FILE_PATH" =~ (spec|test|fixture) ]]; then
    FOUND_SECRETS+="  - Hardcoded JWT token detected\n"
  fi
fi

# 시크릿 발견 시 에러
if [[ -n "$FOUND_SECRETS" ]]; then
  echo "🚨 Security Alert in $(basename "$FILE_PATH"):"
  echo -e "$FOUND_SECRETS"
  echo ""
  echo "💡 해결 방법:"
  echo "  - 환경 변수 사용: ENV['SECRET_KEY'] 또는 process.env.SECRET_KEY"
  echo "  - Rails credentials 사용: Rails.application.credentials.secret_key"
  echo "  - .env 파일 사용 (절대 커밋하지 않음)"
  exit 1
fi

exit 0
