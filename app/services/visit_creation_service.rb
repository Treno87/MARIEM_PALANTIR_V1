# frozen_string_literal: true

class VisitCreationService
  Result = Struct.new(:success?, :visit, :error, keyword_init: true)

  def initialize(params, current_store:)
    @params = params
    @store = current_store
  end

  def call
    ActiveRecord::Base.transaction do
      create_visit
      create_line_items
      create_payments
      @visit.save!

      Result.new(success?: true, visit: @visit.reload)
    end
  rescue ActiveRecord::RecordInvalid => e
    Result.new(success?: false, error: e.record.errors.full_messages.join(", "))
  rescue StandardError => e
    Result.new(success?: false, error: e.message)
  end

  private

  def create_visit
    @visit = @store.visits.build(
      customer_id: @params[:customer_id],
      visited_at: @params[:visited_at] || Time.current,
      status: @params[:status] || "finalized"
    )
  end

  def create_line_items
    return unless @params[:line_items].present?

    @params[:line_items].each do |item_params|
      @visit.sale_line_items.build(
        store: @store,
        item_type: item_params[:item_type],
        service_id: item_params[:service_id],
        product_id: item_params[:product_id],
        staff_id: item_params[:staff_id],
        qty: item_params[:qty] || 1,
        discount_rate: item_params[:discount_rate],
        discount_amount: item_params[:discount_amount]
      )
    end
  end

  def create_payments
    return unless @params[:payments].present?

    @params[:payments].each do |payment_params|
      @visit.payments.build(
        store: @store,
        method: payment_params[:method],
        amount: payment_params[:amount]
      )
    end
  end
end
