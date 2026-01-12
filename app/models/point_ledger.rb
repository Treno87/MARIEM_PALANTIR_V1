# frozen_string_literal: true

class PointLedger
  def initialize(store)
    @store = store
  end

  def earn_from_visit(visit)
    return if visit.draft?

    rule = find_applicable_rule
    return unless rule

    points = rule.calculate_points(visit.total_amount)
    return if points <= 0

    PointTransaction.create!(
      store: @store,
      customer: visit.customer,
      txn_type: "earn",
      points_delta: points,
      visit: visit,
      point_rule: rule
    )
  end

  def redeem(customer:, points:, visit:, payment:)
    raise "포인트 잔액이 부족합니다" if customer.point_balance < points

    PointTransaction.create!(
      store: @store,
      customer: customer,
      txn_type: "redeem",
      points_delta: -points,
      visit: visit,
      payment: payment
    )
  end

  def adjust(customer:, points:, memo:)
    PointTransaction.create!(
      store: @store,
      customer: customer,
      txn_type: "adjust",
      points_delta: points,
      memo: memo
    )
  end

  def balance_for(customer)
    customer.point_balance
  end

  def history_for(customer, limit: 50)
    customer.point_transactions
            .includes(:visit, :point_rule)
            .order(created_at: :desc)
            .limit(limit)
  end

  private

  def find_applicable_rule
    @store.point_rules.active.first
  end
end
