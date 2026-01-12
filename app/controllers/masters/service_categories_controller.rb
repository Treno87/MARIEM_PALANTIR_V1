# frozen_string_literal: true

module Masters
  class ServiceCategoriesController < ApplicationController
    before_action :set_service_category, only: [:edit, :update, :destroy]

    def index
      @service_categories = current_store.service_categories.includes(:services).order(:name)
    end

    def new
      @service_category = current_store.service_categories.build
    end

    def create
      @service_category = current_store.service_categories.build(service_category_params)
      if @service_category.save
        redirect_to masters_service_categories_path, notice: "카테고리가 등록되었습니다."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @service_category.update(service_category_params)
        redirect_to masters_service_categories_path, notice: "카테고리가 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @service_category.destroy
      redirect_to masters_service_categories_path, notice: "카테고리가 삭제되었습니다."
    end

    private

    def set_service_category
      @service_category = current_store.service_categories.find(params[:id])
    end

    def service_category_params
      params.require(:service_category).permit(:name)
    end
  end
end
