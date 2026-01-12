# frozen_string_literal: true

class PointTransaction < ApplicationRecord
  include StoreScoped

  belongs_to :customer
  belongs_to :visit, optional: true
  belongs_to :payment, optional: true
  belongs_to :point_rule, optional: true

  TXN_TYPES = %w[earn redeem adjust expire].freeze

  validates :txn_type, presence: true, inclusion: { in: TXN_TYPES }
  validates :points_delta, presence: true

  validate :redeem_not_exceed_balance, if: :redeem?

  scope :chronological, -> { order(created_at: :asc) }

  def earn?
    txn_type == "earn"
  end

  def redeem?
    txn_type == "redeem"
  end

  def adjust?
    txn_type == "adjust"
  end

  def expire?
    txn_type == "expire"
  end

  private

  def redeem_not_exceed_balance
    return unless customer

    current_balance = customer.point_balance
    if points_delta.abs > current_balance
      errors.add(:points_delta, "cannot exceed current balance (#{current_balance})")
    end
  end
end
