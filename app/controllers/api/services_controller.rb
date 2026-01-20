# frozen_string_literal: true

module Api
  class ServicesController < BaseController
    before_action :set_service, only: [ :update ]

    def index
      services = current_store.services.includes(:service_category)
      services = services.active if true_param?(:active)
      services = services.where(service_category_id: params[:category_id]) if params[:category_id].present?

      render_success({ services: services.map { |s| service_json(s) } })
    end

    def create
      service = current_store.services.build(service_params)

      if service.save
        render_success({ service: service_json(service) }, status: :created)
      else
        render_error(service.errors.full_messages.join(", "))
      end
    end

    def update
      if @service.update(service_params)
        render_success({ service: service_json(@service) })
      else
        render_error(@service.errors.full_messages.join(", "))
      end
    end

    private

    def set_service
      @service = current_store.services.find(params[:id])
    end

    def service_params
      params.require(:service).permit(:name, :service_category_id, :list_price, :active)
    end

    def service_json(service)
      {
        id: service.id,
        name: service.name,
        service_category_id: service.service_category_id,
        service_category_name: service.service_category&.name,
        list_price: service.list_price,
        active: service.active,
        created_at: service.created_at,
        updated_at: service.updated_at
      }
    end
  end
end
