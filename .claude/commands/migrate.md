---
description: 안전한 DB 마이그레이션 생성 및 실행
---

# Role
당신은 안전한 마이그레이션 전문가입니다.

# Prerequisites
1. `docs/specs/database.md` 파일을 읽어 현재 스키마를 확인하세요
2. `.claude/agents/db-architect.md` 원칙을 준수하세요

# Task
사용자가 요청한 DB 변경을 안전하게 마이그레이션으로 생성합니다.

## 사전 확인

### 1. 현재 마이그레이션 상태
```bash
rails db:migrate:status
```

### 2. 테이블 구조 확인
```bash
rails runner "puts ActiveRecord::Base.connection.columns('테이블명').map(&:name)"
```

## 마이그레이션 생성 규칙

### ✅ 안전한 작업 (즉시 실행 가능)
- 새 테이블 생성
- NULL 허용 컬럼 추가
- 인덱스 CONCURRENTLY 추가

### ⚠️ 주의 필요한 작업 (사용자 확인 필요)
- NOT NULL 컬럼 추가 (기본값 필요)
- 컬럼 타입 변경
- 컬럼명 변경
- 외래 키 추가

### 🚫 위험한 작업 (분리 실행 권장)
- 대량 데이터 업데이트
- 컬럼 삭제
- 테이블 삭제

## 마이그레이션 패턴

### 1. 새 테이블 생성
```ruby
class Create{TableName} < ActiveRecord::Migration[8.0]
  def change
    create_table :{table_name} do |t|
      t.references :tenant, null: false, foreign_key: true, index: true
      t.string :name, null: false
      t.decimal :amount, precision: 12, scale: 2
      t.string :status, null: false, default: 'active'

      t.timestamps
    end

    # 복합 인덱스
    add_index :{table_name}, [:tenant_id, :name], unique: true
  end
end
```

### 2. 컬럼 추가 (안전)
```ruby
class Add{Column}To{Table} < ActiveRecord::Migration[8.0]
  def change
    # NULL 허용으로 먼저 추가
    add_column :{table}, :{column}, :string
  end
end
```

### 3. NOT NULL 컬럼 추가 (3단계)
```ruby
# Step 1: 컬럼 추가
class Add{Column}To{Table} < ActiveRecord::Migration[8.0]
  def change
    add_column :{table}, :{column}, :string
  end
end

# Step 2: 기존 데이터 채우기
class Backfill{Column}On{Table} < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    {Model}.in_batches(of: 1000) do |batch|
      batch.update_all({column}: 'default_value')
    end
  end
end

# Step 3: NOT NULL 제약 추가
class Add{Column}NotNullTo{Table} < ActiveRecord::Migration[8.0]
  def change
    change_column_null :{table}, :{column}, false
    change_column_default :{table}, :{column}, 'default_value'
  end
end
```

### 4. 인덱스 추가 (안전)
```ruby
class AddIndexTo{Table} < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_index :{table}, :{column}, algorithm: :concurrently
  end
end
```

### 5. 컬럼 삭제 (안전)
```ruby
class Remove{Column}From{Table} < ActiveRecord::Migration[8.0]
  def change
    # 먼저 코드에서 컬럼 사용 제거 후 실행
    safety_assured { remove_column :{table}, :{column}, :string }
  end
end
```

## 실행 순서

### 개발 환경
```bash
# 1. 마이그레이션 생성
rails generate migration Add{Column}To{Table} {column}:string

# 2. 마이그레이션 파일 편집 (위 패턴 적용)

# 3. 테스트 환경에서 먼저 실행
RAILS_ENV=test rails db:migrate

# 4. 개발 환경 실행
rails db:migrate

# 5. 스키마 확인
rails db:schema:dump
```

### 프로덕션 환경 (주의)
```bash
# 1. 백업 확인
# 2. 유지보수 창 설정
# 3. 마이그레이션 실행
rails db:migrate

# 4. 검증
rails runner "puts {Model}.count"
```

## strong_migrations 설정

`Gemfile`:
```ruby
gem 'strong_migrations'
```

`config/initializers/strong_migrations.rb`:
```ruby
StrongMigrations.start_after = 20240101000000

StrongMigrations.lock_timeout = 10.seconds
StrongMigrations.statement_timeout = 1.hour
```

## Checklist
- [ ] 현재 마이그레이션 상태를 확인했는가?
- [ ] 안전한 패턴을 사용했는가?
- [ ] tenant_id가 필요한 테이블인가?
- [ ] 인덱스가 적절히 추가되었는가?
- [ ] 롤백이 가능한가?
- [ ] strong_migrations 경고가 없는가?

## Example Usage
```
/migrate customers 테이블에 email 컬럼 추가
/migrate sales 테이블에 discount_amount 컬럼 추가 (NOT NULL)
/migrate 새로운 prepaid_cards 테이블 생성
```
