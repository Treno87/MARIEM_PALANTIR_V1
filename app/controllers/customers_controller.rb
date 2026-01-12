# frozen_string_literal: true

class CustomersController < ApplicationController
  before_action :set_customer, only: [:show, :edit, :update, :destroy]

  def index
    @customers_scope = current_store.customers.order(:name)
    if params[:q].present?
      @customers_scope = @customers_scope.where("name LIKE ? OR phone LIKE ?", "%#{params[:q]}%", "%#{params[:q]}%")
    end
    @pagy, @customers = pagy(@customers_scope)
  end

  def start_transaction
    @customer = current_store.customers.find(params[:id])
    @visit = current_store.visits.create!(
      customer: @customer,
      visited_at: Time.current,
      status: "draft",
      subtotal_amount: 0,
      total_amount: 0
    )
    redirect_to edit_transactions_visit_path(@visit)
  end

  def show
    @visits = @customer.visits.includes(:sale_line_items).order(visited_at: :desc).limit(10)
  end

  def new
    @customer = current_store.customers.build
  end

  def create
    @customer = current_store.customers.build(customer_params)
    if @customer.save
      redirect_to @customer, notice: "고객이 등록되었습니다."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @customer.update(customer_params)
      redirect_to @customer, notice: "고객 정보가 수정되었습니다."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @customer.destroy
    redirect_to customers_path, notice: "고객이 삭제되었습니다."
  end

  private

  def set_customer
    @customer = current_store.customers.find(params[:id])
  end

  def customer_params
    params.require(:customer).permit(:name, :phone, :memo)
  end
end
