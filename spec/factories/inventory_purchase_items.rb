# frozen_string_literal: true

FactoryBot.define do
  factory :inventory_purchase_item do
    association :store
    association :inventory_purchase
    association :product
    qty { 1 }
    unit_cost { 1000 }
  end
end
