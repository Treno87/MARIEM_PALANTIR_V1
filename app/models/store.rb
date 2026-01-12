# frozen_string_literal: true

class Store < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :staff_members, dependent: :destroy
  has_many :service_categories, dependent: :destroy
  has_many :services, dependent: :destroy
  has_many :vendors, dependent: :destroy
  has_many :products, dependent: :destroy
  has_many :prepaid_plans, dependent: :destroy
  has_many :customers, dependent: :destroy
  has_many :visits, dependent: :destroy
  has_many :pricing_rules, dependent: :destroy
  has_many :point_rules, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :sale_line_items, dependent: :destroy
  has_many :prepaid_sales, dependent: :destroy
  has_many :prepaid_usages, dependent: :destroy
  has_many :point_transactions, dependent: :destroy
  has_many :inventory_purchases, dependent: :destroy
  has_many :inventory_events, dependent: :destroy

  validates :name, presence: true
end
