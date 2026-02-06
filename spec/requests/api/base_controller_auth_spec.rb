# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::BaseController JWT jti 검증", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:customer) { create(:customer, store: store) }

  describe "인증 누락 시 액션 실행 방지" do
    it "Authorization 헤더 없으면 401 반환하고 데이터를 노출하지 않는다" do
      get "/api/customers"

      expect(response).to have_http_status(:unauthorized)
      expect(json_response[:data]).to be_nil
    end

    it "잘못된 JWT 토큰이면 401 반환하고 데이터를 노출하지 않는다" do
      get "/api/customers", headers: { "Authorization" => "Bearer invalid.token.here" }

      expect(response).to have_http_status(:unauthorized)
      expect(json_response[:data]).to be_nil
    end
  end

  describe "jti 검증" do
    it "유효한 jti 토큰으로 요청하면 200을 반환한다" do
      headers = auth_headers(user)

      get "/api/visits", headers: headers

      expect(response).to have_http_status(:ok)
    end

    it "jti가 교체된 후 이전 토큰으로 요청하면 401을 반환한다" do
      old_headers = auth_headers(user)

      # jti 교체 (로그아웃 시뮬레이션)
      user.update!(jti: SecureRandom.uuid)

      get "/api/visits", headers: old_headers

      expect(response).to have_http_status(:unauthorized)
      expect(json_response[:error]).to include("만료된 토큰")
    end
  end
end
