# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    association :store
    email { Faker::Internet.email }
    password { "password123" }
    password_confirmation { "password123" }
    role { "STYLIST" }
    jti { SecureRandom.uuid }

    trait :owner do
      role { "OWNER" }
    end

    trait :manager do
      role { "MANAGER" }
    end

    trait :stylist do
      role { "STYLIST" }
    end
  end
end
