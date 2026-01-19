#!/bin/bash
# .claude/hooks/checkers/typescript-checker.sh
# ESLint를 사용한 TypeScript/JavaScript 코드 품질 검사
#
# 사용법: typescript-checker.sh <file_path>
# Exit codes:
#   0: 검사 통과 또는 ESLint 미설치
#   1: ESLint 에러 발견

set -euo pipefail

FILE_PATH="${1:-}"

if [[ -z "$FILE_PATH" ]]; then
  echo "Usage: typescript-checker.sh <file_path>" >&2
  exit 1
fi

if [[ ! -f "$FILE_PATH" ]]; then
  echo "File not found: $FILE_PATH" >&2
  exit 1
fi

# 프로젝트 루트 찾기 (frontend 폴더 또는 package.json이 있는 곳)
find_project_root() {
  local dir="$1"
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/package.json" ]]; then
      echo "$dir"
      return 0
    fi
    dir=$(dirname "$dir")
  done
  return 1
}

# 파일이 속한 프로젝트 루트 찾기
FILE_DIR=$(dirname "$FILE_PATH")
PROJECT_ROOT=$(find_project_root "$FILE_DIR") || {
  echo "⚠️  No package.json found, skipping ESLint check"
  exit 0
}

cd "$PROJECT_ROOT" || exit 0

# ESLint 설치 확인
if [[ ! -f "node_modules/.bin/eslint" ]]; then
  echo "⚠️  ESLint not installed in $PROJECT_ROOT, skipping lint check"
  exit 0
fi

# 상대 경로로 변환 (ESLint는 상대 경로 선호)
RELATIVE_PATH="${FILE_PATH#$PROJECT_ROOT/}"

# ESLint 실행
OUTPUT=$(npx eslint "$RELATIVE_PATH" --format stylish 2>&1) || {
  EXIT_CODE=$?

  # ESLint 에러 (exit code 1 = lint errors)
  if [[ $EXIT_CODE -eq 1 ]]; then
    echo "🔴 ESLint issues in $(basename "$FILE_PATH"):"
    echo "$OUTPUT"
    exit 1
  fi

  # 기타 에러 (설정 문제 등)
  if [[ $EXIT_CODE -eq 2 ]]; then
    echo "⚠️  ESLint configuration error"
    exit 0
  fi
}

echo "✅ ESLint: $(basename "$FILE_PATH") OK"
exit 0
