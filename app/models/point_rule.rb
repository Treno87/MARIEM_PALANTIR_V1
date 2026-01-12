# frozen_string_literal: true

class PointRule < ApplicationRecord
  include StoreScoped

  has_many :point_transactions, dependent: :nullify

  RULE_TYPES = %w[percent_of_net fixed].freeze

  validates :name, presence: true
  validates :rule_type, presence: true, inclusion: { in: RULE_TYPES }
  validates :value, presence: true, numericality: { greater_than: 0 }

  scope :active, -> {
    where("starts_at IS NULL OR starts_at <= ?", Time.current)
      .where("ends_at IS NULL OR ends_at >= ?", Time.current)
  }

  def calculate_points(amount)
    case rule_type
    when "percent_of_net"
      (amount * value / 100.0).floor
    when "fixed"
      value.to_i
    else
      0
    end
  end
end
