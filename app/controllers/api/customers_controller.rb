# frozen_string_literal: true

module Api
  class CustomersController < BaseController
    before_action :set_customer, only: [ :show, :update ]

    def index
      customers = current_store.customers

      if params[:q].present?
        query = "%#{params[:q]}%"
        customers = customers.where("name LIKE ? OR phone LIKE ?", query, query)
      end

      render_success({ customers: customers.map { |c| customer_json(c) } })
    end

    def show
      render_success({ customer: customer_json(@customer) })
    end

    def create
      customer = current_store.customers.build(customer_params)

      if customer.save
        render_success({ customer: customer_json(customer) }, status: :created)
      else
        render_error(customer.errors.full_messages.join(", "))
      end
    end

    def update
      if @customer.update(customer_params)
        render_success({ customer: customer_json(@customer) })
      else
        render_error(@customer.errors.full_messages.join(", "))
      end
    end

    private

    def set_customer
      @customer = current_store.customers.find(params[:id])
    end

    def customer_params
      params.require(:customer).permit(:name, :phone, :memo)
    end

    def customer_json(customer)
      {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        memo: customer.memo,
        created_at: customer.created_at,
        updated_at: customer.updated_at
      }
    end
  end
end
