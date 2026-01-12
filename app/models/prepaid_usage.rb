# frozen_string_literal: true

class PrepaidUsage < ApplicationRecord
  include StoreScoped

  belongs_to :customer
  belongs_to :prepaid_sale
  belongs_to :visit, optional: true
  belongs_to :applied_sale_line_item, class_name: "SaleLineItem", optional: true

  validates :amount_used, presence: true, numericality: { greater_than: 0 }
  validates :used_at, presence: true
end
