# frozen_string_literal: true

class InventoryPurchase < ApplicationRecord
  include StoreScoped

  belongs_to :vendor, optional: true
  has_many :inventory_purchase_items, dependent: :destroy

  validates :purchased_at, presence: true

  accepts_nested_attributes_for :inventory_purchase_items, allow_destroy: true
end
