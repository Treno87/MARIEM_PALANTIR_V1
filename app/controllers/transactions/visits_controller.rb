# frozen_string_literal: true

module Transactions
  class VisitsController < ApplicationController
    before_action :set_visit, only: [:show, :edit, :update, :finalize]

    def index
      @pagy, @visits = pagy(
        current_store.visits.includes(:customer, :payments).order(visited_at: :desc)
      )
    end

    def new
      @visit = current_store.visits.build(visited_at: Time.current, status: "draft")
      @customers = current_store.customers.order(:name)
    end

    def create
      @visit = current_store.visits.build(visit_params)
      @visit.status = "draft"
      @visit.subtotal_amount = 0
      @visit.total_amount = 0

      if @visit.save
        redirect_to edit_transactions_visit_path(@visit), notice: "방문이 생성되었습니다."
      else
        @customers = current_store.customers.order(:name)
        render :new, status: :unprocessable_entity
      end
    end

    def show
      @sale_line_items = @visit.sale_line_items.includes(:service, :product, :staff)
      @payments = @visit.payments
    end

    def edit
      @sale_line_items = @visit.sale_line_items.includes(:service, :product, :staff, :applied_pricing_rule)
      @payments = @visit.payments
      @service_categories = current_store.service_categories.includes(:services).order(:name)
      @services = current_store.services.active.includes(:service_category)
      @products = current_store.products.active.for_sale
      @staff_members = current_store.staff_members.active
      @pricing_rules = current_store.pricing_rules.active.order(:name)
    end

    def update
      if @visit.update(visit_params)
        redirect_to transactions_visit_path(@visit), notice: "방문이 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def finalize
      if @visit.draft? && @visit.fully_paid?
        ActiveRecord::Base.transaction do
          @visit.finalize!
          PointLedger.new(current_store).earn_from_visit(@visit)
        end
        redirect_to transactions_visit_path(@visit), notice: "거래가 확정되었습니다."
      elsif !@visit.fully_paid?
        redirect_to edit_transactions_visit_path(@visit), alert: "미결제 금액이 있습니다."
      else
        redirect_to transactions_visit_path(@visit), alert: "이미 확정된 거래입니다."
      end
    rescue => e
      redirect_to transactions_visit_path(@visit), alert: "오류: #{e.message}"
    end

    private

    def set_visit
      @visit = current_store.visits.find(params[:id])
    end

    def visit_params
      params.require(:visit).permit(:customer_id, :visited_at)
    end
  end
end
