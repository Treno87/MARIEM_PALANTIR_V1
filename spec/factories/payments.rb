# frozen_string_literal: true

FactoryBot.define do
  factory :payment do
    association :store
    association :visit
    add_attribute(:method) { "card" }
    amount { 10000 }

    trait :cash do
      add_attribute(:method) { "cash" }
    end

    trait :bank do
      add_attribute(:method) { "bank" }
    end
  end
end
