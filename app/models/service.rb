# frozen_string_literal: true

class Service < ApplicationRecord
  include StoreScoped

  belongs_to :service_category
  has_many :sale_line_items, dependent: :restrict_with_error

  validates :name, presence: true
  validates :list_price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true) }
end
