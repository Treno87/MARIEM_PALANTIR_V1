# frozen_string_literal: true

class InventoryEvent < ApplicationRecord
  include StoreScoped

  belongs_to :product
  belongs_to :visit, optional: true
  belongs_to :sale_line_item, optional: true

  EVENT_TYPES = %w[purchase sale consume adjust waste].freeze

  validates :event_type, presence: true, inclusion: { in: EVENT_TYPES }
  validates :qty_delta, presence: true
  validates :occurred_at, presence: true

  scope :chronological, -> { order(occurred_at: :asc) }

  def purchase?
    event_type == "purchase"
  end

  def sale?
    event_type == "sale"
  end

  def consume?
    event_type == "consume"
  end

  def adjust?
    event_type == "adjust"
  end

  def waste?
    event_type == "waste"
  end
end
