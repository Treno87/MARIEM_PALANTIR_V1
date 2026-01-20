# frozen_string_literal: true

FactoryBot.define do
  factory :vendor do
    association :store
    name { Faker::Company.name }
  end
end
