# frozen_string_literal: true

class PricingRule < ApplicationRecord
  include StoreScoped

  has_many :sale_line_items, foreign_key: :applied_pricing_rule_id, dependent: :nullify

  RULE_TYPES = %w[percent amount].freeze
  APPLIES_TO_OPTIONS = %w[all_services service_category specific_service all_products specific_product].freeze

  validates :name, presence: true
  validates :rule_type, presence: true, inclusion: { in: RULE_TYPES }
  validates :value, presence: true, numericality: { greater_than: 0 }
  validates :applies_to, inclusion: { in: APPLIES_TO_OPTIONS }, allow_nil: true

  scope :active, -> {
    where("starts_at IS NULL OR starts_at <= ?", Time.current)
      .where("ends_at IS NULL OR ends_at >= ?", Time.current)
  }

  def percent?
    rule_type == "percent"
  end

  def amount?
    rule_type == "amount"
  end

  def applicable_to?(item)
    case applies_to
    when "all_services"
      item.service?
    when "service_category"
      item.service? && item.service&.service_category_id == target_id
    when "specific_service"
      item.service? && item.service_id == target_id
    when "all_products"
      item.product?
    when "specific_product"
      item.product? && item.product_id == target_id
    else
      false
    end
  end

  def calculate_discount(base_price)
    case rule_type
    when "percent"
      (base_price * value / 100.0).round
    when "amount"
      [value.to_i, base_price].min
    else
      0
    end
  end
end
