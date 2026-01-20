# frozen_string_literal: true

FactoryBot.define do
  factory :visit do
    association :store
    association :customer
    visited_at { Time.current }
    status { "draft" }
    subtotal_amount { 0 }
    total_amount { 0 }

    trait :finalized do
      status { "finalized" }
    end

    trait :with_line_items do
      transient do
        items_count { 1 }
      end

      after(:create) do |visit, evaluator|
        create_list(:sale_line_item, evaluator.items_count, visit: visit, store: visit.store)
        visit.reload
      end
    end
  end
end
