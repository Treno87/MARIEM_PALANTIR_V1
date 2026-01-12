# frozen_string_literal: true

class PricingCalculator
  def initialize(sale_line_item)
    @item = sale_line_item
    @store = sale_line_item.store || sale_line_item.visit&.store
  end

  def apply
    set_list_price
    apply_discount
    calculate_net_total
  end

  private

  def set_list_price
    @item.list_unit_price = if @item.service?
      @item.service&.list_price || 0
    elsif @item.product?
      @item.product&.default_retail_unit_price || 0
    else
      0
    end
  end

  def apply_discount
    # If discount values are manually provided, use them
    if @item.discount_rate.to_f > 0
      @item.discount_amount = (@item.list_unit_price * @item.discount_rate.to_f / 100.0).round
    elsif @item.discount_amount.to_i > 0
      # discount_amount already set
    elsif @item.applied_pricing_rule_id.present?
      # Apply selected pricing rule
      apply_pricing_rule
    else
      # Try to find applicable rule automatically
      find_and_apply_best_rule
    end

    @item.discount_amount ||= 0
    @item.discount_rate ||= 0
    @item.net_unit_price = @item.list_unit_price - @item.discount_amount.to_i
  end

  def apply_pricing_rule
    rule = PricingRule.find_by(id: @item.applied_pricing_rule_id)
    return unless rule

    case rule.rule_type
    when "percent"
      @item.discount_rate = rule.value
      @item.discount_amount = (@item.list_unit_price * rule.value / 100.0).round
    when "amount"
      @item.discount_rate = 0
      @item.discount_amount = [rule.value.to_i, @item.list_unit_price].min
    end
  end

  def find_and_apply_best_rule
    return unless @store

    rules = @store.pricing_rules.active
    applicable_rule = rules.find { |rule| rule.applicable_to?(@item) }

    if applicable_rule
      @item.applied_pricing_rule = applicable_rule
      apply_pricing_rule
    else
      @item.discount_rate = 0
      @item.discount_amount = 0
    end
  end

  def calculate_net_total
    prepaid = @item.prepaid_used.to_i
    @item.net_total = (@item.net_unit_price * @item.qty) - prepaid
    @item.net_total = 0 if @item.net_total < 0
  end
end
