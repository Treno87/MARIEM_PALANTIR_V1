# frozen_string_literal: true

# CORS 설정 - Frontend와 API 통신을 위해 필요
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 개발 환경: localhost의 여러 포트 허용
    origins "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose: [ "Authorization" ],
      credentials: true
  end
end
