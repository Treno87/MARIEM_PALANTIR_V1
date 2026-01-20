# frozen_string_literal: true

module Api
  class BaseController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!

    respond_to :json

    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity
    rescue_from ActionController::ParameterMissing, with: :render_bad_request

    protected

    # Devise: 인증되지 않은 요청에 대해 401 반환 (리다이렉트 대신)
    def authenticate_user!
      if request.headers["Authorization"].present?
        begin
          jwt_payload = JWT.decode(
            request.headers["Authorization"].split(" ").last,
            Devise::JWT.config.secret,
            true,
            { algorithm: "HS256" }
          ).first

          @current_user = User.find(jwt_payload["sub"])
        rescue JWT::DecodeError, ActiveRecord::RecordNotFound
          render json: { success: false, error: "유효하지 않은 토큰입니다" }, status: :unauthorized
        end
      else
        render json: { success: false, error: "인증이 필요합니다" }, status: :unauthorized
      end
    end

    private

    def render_success(data = {}, status: :ok)
      render json: { success: true, data: data }, status: status
    end

    def render_error(message, status: :unprocessable_entity)
      render json: { success: false, error: message }, status: status
    end

    def render_not_found
      render json: { success: false, error: "리소스를 찾을 수 없습니다" }, status: :not_found
    end

    def render_unprocessable_entity(exception)
      render json: { success: false, error: exception.record.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end

    def render_bad_request(exception)
      render json: { success: false, error: exception.message }, status: :bad_request
    end

    def current_user
      @current_user
    end

    def current_store
      current_user&.store
    end

    def true_param?(key)
      params[key].to_s == "true"
    end
  end
end
