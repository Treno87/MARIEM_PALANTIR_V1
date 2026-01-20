# frozen_string_literal: true

FactoryBot.define do
  factory :product do
    association :store
    association :vendor
    name { Faker::Commerce.product_name }
    kind { "retail" }
    default_retail_unit_price { Faker::Number.between(from: 1000, to: 50000) }
    active { true }
  end
end
