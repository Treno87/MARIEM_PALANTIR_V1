---
description: Rails API 엔드포인트 자동 생성
---

# Role
당신은 Rails API 생성기입니다.

# Prerequisites
1. `docs/specs/api.md` 파일을 읽어 API 명세를 확인하세요
2. `docs/specs/database.md` 파일을 읽어 데이터 모델을 확인하세요

# Task
사용자가 요청한 리소스에 대해 RESTful API를 생성합니다.

## 생성 순서

### 1. 모델 확인
```bash
# 모델이 존재하는지 확인
ls app/models/
```

### 2. 컨트롤러 생성
```ruby
# app/controllers/api/v1/{resource}_controller.rb
module Api
  module V1
    class {Resource}Controller < ApplicationController
      before_action :set_{resource}, only: [:show, :update, :destroy]

      # GET /api/v1/{resources}
      def index
        @{resources} = {Resource}.includes(:associated).page(params[:page])
        render :index
      end

      # GET /api/v1/{resources}/:id
      def show
        render :show
      end

      # POST /api/v1/{resources}
      def create
        service = {Resource}CreationService.new({resource}_params, current_user: current_user)
        @{resource} = service.call
        render :show, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors }, status: :unprocessable_entity
      end

      # PATCH/PUT /api/v1/{resources}/:id
      def update
        @{resource}.update!({resource}_params)
        render :show
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors }, status: :unprocessable_entity
      end

      # DELETE /api/v1/{resources}/:id
      def destroy
        @{resource}.destroy!
        head :no_content
      end

      private

      def set_{resource}
        @{resource} = {Resource}.find(params[:id])
      end

      def {resource}_params
        params.require(:{resource}).permit(:field1, :field2, nested_attributes: [:id, :field])
      end
    end
  end
end
```

### 3. 라우트 추가
```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :{resources}
    end
  end
end
```

### 4. Jbuilder 뷰 생성
```ruby
# app/views/api/v1/{resources}/index.json.jbuilder
json.{resources} @{resources} do |{resource}|
  json.partial! {resource}
end

json.meta do
  json.total_count @{resources}.total_count
  json.total_pages @{resources}.total_pages
  json.current_page @{resources}.current_page
end

# app/views/api/v1/{resources}/show.json.jbuilder
json.{resource} do
  json.partial! @{resource}
end

# app/views/api/v1/{resources}/_{resource}.json.jbuilder
json.extract! {resource}, :id, :field1, :field2, :created_at, :updated_at
```

### 5. 서비스 객체 생성 (필요시)
```ruby
# app/services/{resource}_creation_service.rb
class {Resource}CreationService
  def initialize(params, current_user:)
    @params = params
    @current_user = current_user
  end

  def call
    ActiveRecord::Base.transaction do
      create_{resource}
    end
  end

  private

  attr_reader :params, :current_user

  def create_{resource}
    {Resource}.create!(
      tenant: current_user.tenant,
      **params
    )
  end
end
```

## Checklist
- [ ] acts_as_tenant이 적용된 모델인가?
- [ ] includes로 N+1을 방지했는가?
- [ ] 페이지네이션이 적용되었는가?
- [ ] 서비스 객체로 복잡한 로직을 분리했는가?
- [ ] 적절한 HTTP 상태 코드를 반환하는가?
- [ ] 에러 응답이 일관된 형식인가?

## Example Usage
```
/api-gen sales
/api-gen customers
/api-gen services
```
