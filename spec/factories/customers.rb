# frozen_string_literal: true

FactoryBot.define do
  factory :customer do
    association :store
    name { Faker::Name.name }
    phone { Faker::PhoneNumber.cell_phone }
    memo { Faker::Lorem.sentence }
  end
end
