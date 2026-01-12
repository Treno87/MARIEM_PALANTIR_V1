# frozen_string_literal: true

class PrepaidLedger
  def initialize(store)
    @store = store
  end

  def sell(customer:, prepaid_plan:, seller_staff: nil, sold_at: Time.current)
    PrepaidSale.create!(
      store: @store,
      customer: customer,
      prepaid_plan: prepaid_plan,
      amount_paid: prepaid_plan.price_paid,
      value_amount: prepaid_plan.value_amount,
      seller_staff: seller_staff,
      sold_at: sold_at
    )
  end

  def use(customer:, amount:, visit:, sale_line_item: nil, prepaid_sale_id: nil)
    prepaid_sale = if prepaid_sale_id
      customer.prepaid_sales.find(prepaid_sale_id)
    else
      find_available_prepaid_sale(customer, amount)
    end

    raise "사용 가능한 정액권이 없습니다" unless prepaid_sale
    raise "정액권 잔액이 부족합니다" if prepaid_sale.remaining_balance < amount

    PrepaidUsage.create!(
      store: @store,
      customer: customer,
      prepaid_sale: prepaid_sale,
      visit: visit,
      amount_used: amount,
      applied_sale_line_item: sale_line_item,
      used_at: Time.current
    )
  end

  def balance_for(customer)
    customer.prepaid_balance
  end

  def details_for(customer)
    customer.prepaid_sales.includes(:prepaid_plan, :prepaid_usages).map do |sale|
      {
        plan_name: sale.prepaid_plan.name,
        sold_at: sale.sold_at,
        original_amount: sale.value_amount,
        remaining: sale.remaining_balance,
        usages: sale.prepaid_usages.map do |usage|
          {
            used_at: usage.used_at,
            amount: usage.amount_used,
            visit_id: usage.visit_id
          }
        end
      }
    end
  end

  private

  def find_available_prepaid_sale(customer, amount)
    customer.prepaid_sales
            .order(:sold_at)
            .find { |sale| sale.remaining_balance >= amount }
  end
end
