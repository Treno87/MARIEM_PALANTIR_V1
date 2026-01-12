# frozen_string_literal: true

module Masters
  class PrepaidPlansController < ApplicationController
    before_action :set_prepaid_plan, only: [:edit, :update, :destroy]

    def index
      @prepaid_plans = current_store.prepaid_plans.order(:name)
    end

    def new
      @prepaid_plan = current_store.prepaid_plans.build(active: true)
    end

    def create
      @prepaid_plan = current_store.prepaid_plans.build(prepaid_plan_params)
      if @prepaid_plan.save
        redirect_to masters_prepaid_plans_path, notice: "정액권이 등록되었습니다."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @prepaid_plan.update(prepaid_plan_params)
        redirect_to masters_prepaid_plans_path, notice: "정액권이 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @prepaid_plan.destroy
      redirect_to masters_prepaid_plans_path, notice: "정액권이 삭제되었습니다."
    end

    private

    def set_prepaid_plan
      @prepaid_plan = current_store.prepaid_plans.find(params[:id])
    end

    def prepaid_plan_params
      params.require(:prepaid_plan).permit(:name, :price_paid, :value_amount, :active)
    end
  end
end
