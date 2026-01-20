# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Auth", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store, email: "test@example.com", password: "password123") }

  describe "POST /api/auth/sign_in" do
    context "유효한 자격 증명" do
      it "JWT 토큰을 반환한다" do
        post "/api/auth/sign_in", params: {
          user: { email: user.email, password: "password123" }
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.headers["Authorization"]).to be_present
        expect(response.headers["Authorization"]).to match(/^Bearer /)
      end

      it "사용자 정보를 반환한다" do
        post "/api/auth/sign_in", params: {
          user: { email: user.email, password: "password123" }
        }, as: :json

        expect(json_response[:success]).to be true
        expect(json_response[:data][:user][:email]).to eq(user.email)
        expect(json_response[:data][:user][:role]).to eq(user.role)
        expect(json_response[:data][:user][:store_id]).to eq(store.id)
      end
    end

    context "잘못된 이메일" do
      it "401을 반환한다" do
        post "/api/auth/sign_in", params: {
          user: { email: "wrong@example.com", password: "password123" }
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:success]).to be false
      end
    end

    context "잘못된 비밀번호" do
      it "401을 반환한다" do
        post "/api/auth/sign_in", params: {
          user: { email: user.email, password: "wrongpassword" }
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:success]).to be false
      end
    end
  end

  describe "DELETE /api/auth/sign_out" do
    context "인증된 사용자" do
      it "성공적으로 로그아웃한다" do
        delete "/api/auth/sign_out", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
      end

      it "JWT 토큰이 무효화된다" do
        headers = auth_headers(user)
        old_jti = user.jti

        delete "/api/auth/sign_out", headers: headers

        user.reload
        expect(user.jti).not_to eq(old_jti)
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        delete "/api/auth/sign_out"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/auth/me" do
    context "인증된 사용자" do
      it "현재 사용자 정보를 반환한다" do
        get "/api/auth/me", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:user][:id]).to eq(user.id)
        expect(json_response[:data][:user][:email]).to eq(user.email)
        expect(json_response[:data][:user][:role]).to eq(user.role)
        expect(json_response[:data][:user][:store_id]).to eq(store.id)
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        get "/api/auth/me"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
