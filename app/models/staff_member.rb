# frozen_string_literal: true

class StaffMember < ApplicationRecord
  include StoreScoped

  has_many :sale_line_items, foreign_key: :staff_id, dependent: :nullify
  has_many :prepaid_sales, foreign_key: :seller_staff_id, dependent: :nullify

  validates :name, presence: true

  scope :active, -> { where(active: true) }
end
