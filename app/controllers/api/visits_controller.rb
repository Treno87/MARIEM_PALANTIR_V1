# frozen_string_literal: true

module Api
  class VisitsController < BaseController
    before_action :set_visit, only: [ :show, :void ]

    def index
      visits = current_store.visits.includes(:customer, :sale_line_items, :payments)
      visits = visits.where("DATE(visited_at) = ?", params[:date]) if params[:date].present?
      visits = visits.where(status: params[:status]) if params[:status].present?
      visits = visits.order(visited_at: :desc)

      render_success({ visits: visits.map { |v| visit_list_json(v) } })
    end

    def show
      render_success({ visit: visit_detail_json(@visit) })
    end

    def create
      result = VisitCreationService.new(visit_params, current_store: current_store).call

      if result.success?
        render_success({ visit: visit_detail_json(result.visit) }, status: :created)
      else
        render_error(result.error)
      end
    end

    def void
      @visit.void!
      render_success({ visit: visit_detail_json(@visit) })
    end

    private

    def set_visit
      @visit = current_store.visits.find(params[:id])
    end

    def visit_params
      params.require(:visit).permit(
        :customer_id,
        :visited_at,
        :status,
        line_items: [ :item_type, :service_id, :product_id, :staff_id, :qty, :discount_rate, :discount_amount ],
        payments: [ :method, :amount ]
      )
    end

    def visit_list_json(visit)
      {
        id: visit.id,
        visited_at: visit.visited_at,
        status: visit.status,
        visit_type: visit.visit_type,
        voided: visit.voided?,
        subtotal_amount: visit.subtotal_amount,
        total_amount: visit.total_amount,
        customer: {
          id: visit.customer.id,
          name: visit.customer.name,
          phone: visit.customer.phone
        },
        line_items_count: visit.sale_line_items.size,
        payments_count: visit.payments.size,
        created_at: visit.created_at,
        updated_at: visit.updated_at
      }
    end

    def visit_detail_json(visit)
      {
        id: visit.id,
        visited_at: visit.visited_at,
        status: visit.status,
        visit_type: visit.visit_type,
        voided: visit.voided?,
        voided_at: visit.voided_at,
        subtotal_amount: visit.subtotal_amount,
        total_amount: visit.total_amount,
        paid_amount: visit.paid_amount,
        remaining_amount: visit.remaining_amount,
        customer: {
          id: visit.customer.id,
          name: visit.customer.name,
          phone: visit.customer.phone
        },
        line_items: visit.sale_line_items.map { |item| line_item_json(item) },
        payments: visit.payments.map { |payment| payment_json(payment) },
        created_at: visit.created_at,
        updated_at: visit.updated_at
      }
    end

    def line_item_json(item)
      {
        id: item.id,
        item_type: item.item_type,
        service_id: item.service_id,
        product_id: item.product_id,
        staff_id: item.staff_id,
        item_name: item.item_name,
        qty: item.qty,
        list_unit_price: item.list_unit_price,
        net_unit_price: item.net_unit_price,
        discount_rate: item.discount_rate,
        discount_amount: item.discount_amount,
        net_total: item.net_total
      }
    end

    def payment_json(payment)
      {
        id: payment.id,
        method: payment.method,
        method_label: payment.method_label,
        amount: payment.amount
      }
    end
  end
end
