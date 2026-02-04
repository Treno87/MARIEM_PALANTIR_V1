# frozen_string_literal: true

FactoryBot.define do
  factory :prepaid_plan do
    association :store
    name { "정액권 #{Faker::Number.number(digits: 4)}" }
    price_paid { 100_000 }
    value_amount { 120_000 }
    active { true }
  end
end
