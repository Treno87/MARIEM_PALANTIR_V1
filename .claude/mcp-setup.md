# MCP (Model Context Protocol) 설정 가이드

> Claude Code에서 MCP 서버를 활용하여 DB 직접 쿼리, GitHub 연동 등을 수행합니다.

## 1. PostgreSQL MCP 설정

### 설치
```bash
# MCP 서버 패키지 확인 (npx로 자동 설치)
npx -y @modelcontextprotocol/server-postgres --help
```

### 설정 방법
Claude Code 설정에서 MCP 서버 추가:

```bash
# Claude Code 실행 후
/mcp add postgresql
```

또는 수동으로 `~/.config/claude-code/mcp.json` 파일 편집:

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://username:password@localhost:5432/mariem_palantir_development"
      ]
    }
  }
}
```

### 환경변수 활용 (권장)
```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${DATABASE_URL}"
      ]
    }
  }
}
```

### 활용 예시
```
# DB 스키마 확인
"sales 테이블의 구조를 보여줘"

# 데이터 검증
"오늘 생성된 거래 목록을 조회해줘"

# 리포트 쿼리 테스트
"이번 달 매출 합계를 계산해줘"
```

## 2. GitHub MCP 설정

### 설치
```bash
npx -y @modelcontextprotocol/server-github --help
```

### 설정
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### GitHub Token 생성
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. 필요한 권한: `repo`, `workflow`, `read:org`
4. 환경변수로 설정: `export GITHUB_TOKEN=ghp_xxx`

### 활용 예시
```
# 이슈 조회
"열린 이슈 목록을 보여줘"

# PR 생성
"현재 브랜치로 PR을 생성해줘"

# 이슈 생성
"새로운 버그 이슈를 생성해줘: 로그인 오류"
```

## 3. 통합 설정 예시

`~/.config/claude-code/mcp.json`:
```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${DATABASE_URL}"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## 4. 환경변수 설정

`.env` 또는 shell profile에 추가:
```bash
# PostgreSQL
export DATABASE_URL="postgresql://username:password@localhost:5432/mariem_palantir_development"

# GitHub
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## 5. 확인 방법

Claude Code 재시작 후:
```
/mcp list
```

MCP 서버가 정상적으로 연결되면 관련 도구가 활성화됩니다.

## 주의사항

- `.env` 파일은 절대 커밋하지 마세요
- 프로덕션 DB 연결 정보는 사용하지 마세요
- GitHub Token은 필요한 최소 권한만 부여하세요
