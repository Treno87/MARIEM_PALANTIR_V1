# frozen_string_literal: true

module Api
  class ServiceCategoriesController < BaseController
    before_action :set_service_category, only: [ :update ]

    def index
      categories = current_store.service_categories.includes(:services)

      render_success({ service_categories: categories.map { |c| category_json(c) } })
    end

    def create
      category = current_store.service_categories.build(category_params)

      if category.save
        render_success({ service_category: category_json(category) }, status: :created)
      else
        render_error(category.errors.full_messages.join(", "))
      end
    end

    def update
      if @service_category.update(category_params)
        render_success({ service_category: category_json(@service_category) })
      else
        render_error(@service_category.errors.full_messages.join(", "))
      end
    end

    private

    def set_service_category
      @service_category = current_store.service_categories.find(params[:id])
    end

    def category_params
      params.require(:service_category).permit(:name)
    end

    def category_json(category)
      {
        id: category.id,
        name: category.name,
        services_count: category.services.size,
        created_at: category.created_at,
        updated_at: category.updated_at
      }
    end
  end
end
