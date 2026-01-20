# frozen_string_literal: true

class Visit < ApplicationRecord
  include StoreScoped

  belongs_to :customer
  has_many :sale_line_items, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :prepaid_usages, dependent: :destroy
  has_many :point_transactions, dependent: :destroy
  has_many :inventory_events, dependent: :nullify

  STATUSES = %w[draft finalized].freeze

  validates :visited_at, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }

  scope :draft, -> { where(status: "draft") }
  scope :finalized, -> { where(status: "finalized") }
  scope :active, -> { where(voided_at: nil) }
  scope :voided, -> { where.not(voided_at: nil) }
  scope :for_report, -> { finalized.active }

  before_save :calculate_totals

  def draft?
    status == "draft"
  end

  def finalized?
    status == "finalized"
  end

  def finalize!
    update!(status: "finalized")
  end

  def voided?
    voided_at.present?
  end

  def void!
    update!(voided_at: Time.current)
  end

  def paid_amount
    payments.sum(:amount)
  end

  def remaining_amount
    total_amount.to_i - paid_amount
  end

  def fully_paid?
    remaining_amount <= 0
  end

  private

  def calculate_totals
    self.subtotal_amount = sale_line_items.sum { |item| item.list_unit_price.to_i * item.qty.to_i }
    self.total_amount = sale_line_items.sum(&:net_total)
  end
end
