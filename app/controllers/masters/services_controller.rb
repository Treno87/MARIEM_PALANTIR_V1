# frozen_string_literal: true

module Masters
  class ServicesController < ApplicationController
    before_action :set_service, only: [:edit, :update, :destroy]
    before_action :set_categories, only: [:new, :create, :edit, :update]

    def index
      @services = current_store.services.includes(:service_category).order(:name)
    end

    def new
      @service = current_store.services.build(active: true)
    end

    def create
      @service = current_store.services.build(service_params)
      if @service.save
        redirect_to masters_services_path, notice: "서비스가 등록되었습니다."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @service.update(service_params)
        redirect_to masters_services_path, notice: "서비스가 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @service.destroy
      redirect_to masters_services_path, notice: "서비스가 삭제되었습니다."
    end

    private

    def set_service
      @service = current_store.services.find(params[:id])
    end

    def set_categories
      @categories = current_store.service_categories.order(:name)
    end

    def service_params
      params.require(:service).permit(:service_category_id, :name, :list_price, :active)
    end
  end
end
