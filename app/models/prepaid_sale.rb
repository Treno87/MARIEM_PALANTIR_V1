# frozen_string_literal: true

class PrepaidSale < ApplicationRecord
  include StoreScoped

  belongs_to :customer
  belongs_to :prepaid_plan
  belongs_to :seller_staff, class_name: "StaffMember", optional: true

  has_many :prepaid_usages, dependent: :restrict_with_error

  validates :amount_paid, presence: true, numericality: { greater_than: 0 }
  validates :value_amount, presence: true, numericality: { greater_than: 0 }
  validates :sold_at, presence: true

  def remaining_balance
    value_amount - prepaid_usages.sum(:amount_used)
  end

  def fully_used?
    remaining_balance <= 0
  end
end
