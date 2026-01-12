# frozen_string_literal: true

class Vendor < ApplicationRecord
  include StoreScoped

  has_many :products, dependent: :nullify
  has_many :inventory_purchases, dependent: :destroy

  validates :name, presence: true
end
