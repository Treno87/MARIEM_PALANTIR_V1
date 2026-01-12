# frozen_string_literal: true

class Product < ApplicationRecord
  include StoreScoped

  belongs_to :vendor, optional: true
  has_many :sale_line_items, dependent: :restrict_with_error
  has_many :inventory_events, dependent: :destroy
  has_many :inventory_purchase_items, dependent: :destroy

  KINDS = %w[retail consumable both].freeze

  validates :name, presence: true
  validates :kind, presence: true, inclusion: { in: KINDS }
  validates :default_retail_unit_price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  scope :active, -> { where(active: true) }
  scope :for_sale, -> { where(kind: %w[retail both]) }
  scope :for_inventory, -> { where(kind: %w[consumable both]) }

  def retail?
    kind == "retail"
  end

  def consumable?
    kind == "consumable"
  end

  def current_stock
    inventory_events.sum(:qty_delta)
  end
end
