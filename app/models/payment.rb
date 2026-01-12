# frozen_string_literal: true

class Payment < ApplicationRecord
  include StoreScoped

  belongs_to :visit
  has_many :point_transactions, dependent: :nullify

  METHODS = %w[card cash bank credit pay other prepaid points].freeze

  validates :method, presence: true, inclusion: { in: METHODS }
  validates :amount, presence: true, numericality: { greater_than: 0 }

  METHOD_LABELS = {
    "card" => "카드",
    "cash" => "현금",
    "bank" => "통장",
    "credit" => "외상",
    "pay" => "Pay",
    "other" => "기타",
    "prepaid" => "정액금",
    "points" => "포인트결제"
  }.freeze

  def method_label
    METHOD_LABELS[method] || method
  end
end
