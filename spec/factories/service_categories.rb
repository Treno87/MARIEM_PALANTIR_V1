# frozen_string_literal: true

FactoryBot.define do
  factory :service_category do
    association :store
    name { Faker::Commerce.department }
  end
end
