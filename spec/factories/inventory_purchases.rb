# frozen_string_literal: true

FactoryBot.define do
  factory :inventory_purchase do
    association :store
    association :vendor
    purchased_at { Time.current }
  end
end
