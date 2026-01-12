# frozen_string_literal: true

class SaleLineItem < ApplicationRecord
  include StoreScoped

  belongs_to :visit
  belongs_to :service, optional: true
  belongs_to :product, optional: true
  belongs_to :staff, class_name: "StaffMember", optional: true
  belongs_to :applied_pricing_rule, class_name: "PricingRule", optional: true

  has_many :prepaid_usages, foreign_key: :applied_sale_line_item_id, dependent: :nullify
  has_many :inventory_events, dependent: :nullify

  ITEM_TYPES = %w[service product].freeze

  validates :item_type, presence: true, inclusion: { in: ITEM_TYPES }
  validates :qty, presence: true, numericality: { greater_than: 0 }
  validates :list_unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :net_unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :net_total, presence: true, numericality: { greater_than_or_equal_to: 0 }

  validate :item_reference_present

  before_validation :apply_pricing, on: :create

  def service?
    item_type == "service"
  end

  def product?
    item_type == "product"
  end

  def item_name
    service? ? service&.name : product&.name
  end

  private

  def item_reference_present
    if service? && service_id.blank?
      errors.add(:service, "must be present for service item")
    elsif product? && product_id.blank?
      errors.add(:product, "must be present for product item")
    end
  end

  def apply_pricing
    return if list_unit_price.present? && net_total.present?

    calculator = ::PricingCalculator.new(self)
    calculator.apply
  end
end
