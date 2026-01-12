# frozen_string_literal: true

class InventoryPurchaseItem < ApplicationRecord
  belongs_to :inventory_purchase
  belongs_to :product

  validates :qty, presence: true, numericality: { greater_than: 0 }
  validates :unit_cost, presence: true, numericality: { greater_than_or_equal_to: 0 }

  def total_cost
    qty * unit_cost
  end
end
