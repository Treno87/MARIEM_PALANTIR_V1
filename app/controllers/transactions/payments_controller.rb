# frozen_string_literal: true

module Transactions
  class PaymentsController < ApplicationController
    before_action :set_visit
    before_action :ensure_draft_status

    def create
      @payment = @visit.payments.build(payment_params)
      @payment.store = current_store

      ActiveRecord::Base.transaction do
        if @payment.save
          process_special_payment(@payment)
          redirect_to edit_transactions_visit_path(@visit), notice: "결제가 추가되었습니다."
        else
          redirect_to edit_transactions_visit_path(@visit), alert: @payment.errors.full_messages.join(", ")
        end
      end
    rescue => e
      redirect_to edit_transactions_visit_path(@visit), alert: "결제 처리 오류: #{e.message}"
    end

    def destroy
      @payment = @visit.payments.find(params[:id])

      ActiveRecord::Base.transaction do
        reverse_special_payment(@payment)
        @payment.destroy
      end

      redirect_to edit_transactions_visit_path(@visit), notice: "결제가 삭제되었습니다."
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

    def payment_params
      params.require(:payment).permit(:method, :amount)
    end

    def process_special_payment(payment)
      case payment.method
      when "prepaid"
        PrepaidLedger.new(current_store).use(
          customer: @visit.customer,
          amount: payment.amount,
          visit: @visit,
          prepaid_sale_id: params.dig(:payment, :prepaid_sale_id)
        )
      when "points"
        PointLedger.new(current_store).redeem(
          customer: @visit.customer,
          points: payment.amount,
          visit: @visit,
          payment: payment
        )
      end
    end

    def reverse_special_payment(payment)
      case payment.method
      when "prepaid"
        usage = @visit.prepaid_usages.where(amount_used: payment.amount).last
        usage&.destroy
      when "points"
        txn = @visit.point_transactions.where(txn_type: "redeem", points_delta: -payment.amount).last
        txn&.destroy
      end
    end
  end
end
