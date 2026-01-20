# frozen_string_literal: true

FactoryBot.define do
  factory :service do
    association :store
    association :service_category
    name { Faker::Commerce.product_name }
    list_price { Faker::Number.between(from: 10000, to: 100000) }
    active { true }
  end
end
