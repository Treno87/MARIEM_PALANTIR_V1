#!/bin/bash
# .claude/hooks/quality-guard.sh
# PostToolUse 훅 - 코드 품질 자동 검사
#
# 동작:
#   1. stdin에서 JSON 입력 (tool_name, tool_input.file_path)
#   2. Write/Edit 도구만 처리
#   3. 보안 검사 (모든 파일)
#   4. 언어별 검사 (Ruby → RuboCop, TS/JS → ESLint)
#   5. 결과에 따라 exit code 반환
#
# Exit codes:
#   0: 성공 (계속 진행)
#   2: 차단 + 피드백 (Claude에 메시지 전달)

set -euo pipefail

# 스크립트 위치 기준으로 checkers 폴더 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/checkers"

# stdin에서 JSON 읽기
INPUT=$(cat)

# JSON 파싱 (jq 사용)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Write/Edit만 처리
if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

# 파일 경로 없으면 종료
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# 파일이 존재하지 않으면 종료 (삭제된 경우)
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# 결과 수집
ERRORS=""
WARNINGS=""

# 파일 확장자 추출
EXTENSION="${FILE_PATH##*.}"
BASENAME=$(basename "$FILE_PATH")

# 1. 보안 검사 (모든 파일)
if [[ -x "$HOOKS_DIR/security-checker.sh" ]]; then
  SECURITY_OUTPUT=$("$HOOKS_DIR/security-checker.sh" "$FILE_PATH" 2>&1) || {
    ERRORS+="$SECURITY_OUTPUT\n"
  }
fi

# 2. 언어별 검사
case "$EXTENSION" in
  rb)
    if [[ -x "$HOOKS_DIR/ruby-checker.sh" ]]; then
      RUBY_OUTPUT=$("$HOOKS_DIR/ruby-checker.sh" "$FILE_PATH" 2>&1) || {
        WARNINGS+="$RUBY_OUTPUT\n"
      }
    fi
    ;;
  ts|tsx|js|jsx)
    if [[ -x "$HOOKS_DIR/typescript-checker.sh" ]]; then
      TS_OUTPUT=$("$HOOKS_DIR/typescript-checker.sh" "$FILE_PATH" 2>&1) || {
        WARNINGS+="$TS_OUTPUT\n"
      }
    fi
    ;;
esac

# 에러가 있으면 차단 (보안 이슈는 즉시 차단)
if [[ -n "$ERRORS" ]]; then
  echo -e "🚨 Quality Guard: 보안 이슈 발견!\n$ERRORS" >&2
  exit 2
fi

# 경고만 있으면 피드백 제공하지만 차단하지 않음
if [[ -n "$WARNINGS" ]]; then
  echo -e "⚠️  Quality Guard: 코드 품질 경고\n$WARNINGS" >&2
  # exit 0으로 변경하면 경고만 표시하고 진행
  # exit 2로 유지하면 경고도 차단
  exit 2
fi

# 모든 검사 통과
echo "✅ Quality Guard: $BASENAME 검사 통과"
exit 0
