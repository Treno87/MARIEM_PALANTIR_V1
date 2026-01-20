# frozen_string_literal: true

module Api
  class AuthController < BaseController
    skip_before_action :authenticate_user!, only: [ :sign_in ]

    def sign_in
      user = User.find_by(email: sign_in_params[:email])

      if user&.valid_password?(sign_in_params[:password])
        sign_in_and_respond(user)
      else
        render json: { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다" }, status: :unauthorized
      end
    end

    def sign_out
      # JTI를 변경하여 기존 토큰 무효화
      current_user.update!(jti: SecureRandom.uuid)
      render_success({ message: "로그아웃 되었습니다" })
    end

    def me
      render_success({ user: user_json(current_user) })
    end

    private

    def sign_in_params
      params.require(:user).permit(:email, :password)
    end

    def sign_in_and_respond(user)
      token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
      response.headers["Authorization"] = "Bearer #{token}"
      render_success({ user: user_json(user) })
    end

    def user_json(user)
      {
        id: user.id,
        email: user.email,
        role: user.role,
        store_id: user.store_id
      }
    end
  end
end
