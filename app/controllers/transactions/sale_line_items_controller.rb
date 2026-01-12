# frozen_string_literal: true

module Transactions
  class SaleLineItemsController < ApplicationController
    before_action :set_visit
    before_action :ensure_draft_status

    def create
      @line_item = @visit.sale_line_items.build(line_item_params)
      @line_item.store = current_store

      if @line_item.save
        # 항목 추가 시 결제도 모두 삭제 (금액이 변경되므로 다시 입력해야 함)
        @visit.payments.destroy_all
        @visit.save # Recalculate totals
        redirect_to edit_transactions_visit_path(@visit), notice: "항목이 추가되었습니다. 결제를 다시 입력하세요."
      else
        redirect_to edit_transactions_visit_path(@visit), alert: @line_item.errors.full_messages.join(", ")
      end
    end

    def destroy
      @line_item = @visit.sale_line_items.find(params[:id])
      @line_item.destroy

      # 시술 항목 삭제 시 결제도 모두 삭제 (금액이 변경되므로 다시 입력해야 함)
      @visit.payments.destroy_all

      @visit.save # Recalculate totals
      redirect_to edit_transactions_visit_path(@visit), notice: "항목이 삭제되었습니다. 결제를 다시 입력하세요."
    end

    private

    def set_visit
      @visit = current_store.visits.find(params[:visit_id])
    end

    def ensure_draft_status
      unless @visit.draft?
        redirect_to transactions_visit_path(@visit), alert: "확정된 거래는 수정할 수 없습니다."
      end
    end

    def line_item_params
      params.require(:sale_line_item).permit(
        :item_type, :service_id, :product_id, :staff_id, :qty,
        :applied_pricing_rule_id, :discount_rate, :discount_amount,
        :prepaid_used, :points_earned
      )
    end
  end
end
