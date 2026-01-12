# frozen_string_literal: true

module StoreScoped
  extend ActiveSupport::Concern

  included do
    belongs_to :store
    scope :for_store, ->(store_id) { where(store_id: store_id) }
  end
end
