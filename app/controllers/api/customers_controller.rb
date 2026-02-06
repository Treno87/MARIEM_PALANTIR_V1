# frozen_string_literal: true

module Api
  class CustomersController < BaseController
    before_action :set_customer, only: [ :show, :update ]

    def index
      customers = current_store.customers
                    .left_joins(:visits)
                    .select(
                      "customers.*",
                      "COUNT(CASE WHEN visits.voided_at IS NULL THEN visits.id END) AS visit_count",
                      "COALESCE(SUM(CASE WHEN visits.voided_at IS NULL THEN visits.total_amount ELSE 0 END), 0) AS total_spent",
                      "MAX(CASE WHEN visits.voided_at IS NULL THEN visits.visited_at END) AS last_visit_at"
                    )
                    .group("customers.id")

      if params[:q].present?
        query = "%#{params[:q]}%"
        customers = customers.where("customers.name LIKE ? OR customers.phone LIKE ?", query, query)
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
      json = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        memo: customer.memo,
        created_at: customer.created_at,
        updated_at: customer.updated_at
      }

      # 집계 컬럼이 있는 경우 추가 (index 액션에서 left_joins로 로드)
      if customer.respond_to?(:visit_count)
        json[:visit_count] = customer.visit_count.to_i
        json[:total_spent] = customer.total_spent.to_i
        json[:last_visit_at] = customer.last_visit_at
      end

      json
    end
  end
end
