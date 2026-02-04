# frozen_string_literal: true

FactoryBot.define do
  factory :prepaid_sale do
    association :store
    association :customer
    association :prepaid_plan
    amount_paid { 100_000 }
    value_amount { 120_000 }
    sold_at { Time.current }
  end
end
