# frozen_string_literal: true

class PrepaidPlan < ApplicationRecord
  include StoreScoped

  has_many :prepaid_sales, dependent: :restrict_with_error

  validates :name, presence: true
  validates :price_paid, presence: true, numericality: { greater_than: 0 }
  validates :value_amount, presence: true, numericality: { greater_than: 0 }

  scope :active, -> { where(active: true) }
end
