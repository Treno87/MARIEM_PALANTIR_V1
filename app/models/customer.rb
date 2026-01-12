# frozen_string_literal: true

class Customer < ApplicationRecord
  include StoreScoped

  has_many :visits, dependent: :destroy
  has_many :prepaid_sales, dependent: :destroy
  has_many :prepaid_usages, dependent: :destroy
  has_many :point_transactions, dependent: :destroy

  validates :name, presence: true
  validates :phone, presence: true

  def point_balance
    point_transactions.sum(:points_delta)
  end

  def prepaid_balance
    prepaid_sales.sum(:value_amount) - prepaid_usages.sum(:amount_used)
  end

  def available_prepaid_sales
    prepaid_sales.select { |sale| sale.remaining_balance > 0 }
  end
end
