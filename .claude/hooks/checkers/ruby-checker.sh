#!/bin/bash
# .claude/hooks/checkers/ruby-checker.sh
# RuboCop을 사용한 Ruby 코드 품질 검사
#
# 사용법: ruby-checker.sh <file_path>
# Exit codes:
#   0: 검사 통과 또는 RuboCop 미설치
#   1: RuboCop 위반 발견

set -euo pipefail

FILE_PATH="${1:-}"

if [[ -z "$FILE_PATH" ]]; then
  echo "Usage: ruby-checker.sh <file_path>" >&2
  exit 1
fi

if [[ ! -f "$FILE_PATH" ]]; then
  echo "File not found: $FILE_PATH" >&2
  exit 1
fi

# RuboCop 설치 확인
if ! command -v rubocop &> /dev/null; then
  # bundle exec로 시도
  if [[ -f "Gemfile" ]] && bundle show rubocop &> /dev/null; then
    RUBOCOP_CMD="bundle exec rubocop"
  else
    # RuboCop 미설치 시 경고만
    echo "⚠️  RuboCop not installed, skipping Ruby lint check"
    exit 0
  fi
else
  RUBOCOP_CMD="rubocop"
fi

# RuboCop 실행 (autocorrect 없이 검사만)
OUTPUT=$($RUBOCOP_CMD "$FILE_PATH" --format simple 2>&1) || {
  EXIT_CODE=$?

  # 실제 위반이 있는 경우만 에러 처리
  if [[ $EXIT_CODE -eq 1 ]]; then
    echo "🔴 RuboCop issues in $(basename "$FILE_PATH"):"
    echo "$OUTPUT" | grep -E "^(C|W|E|F):" || echo "$OUTPUT"
    exit 1
  fi

  # 기타 에러 (설정 문제 등)는 경고로 처리
  echo "⚠️  RuboCop execution warning: $OUTPUT"
  exit 0
}

echo "✅ RuboCop: $(basename "$FILE_PATH") OK"
exit 0
