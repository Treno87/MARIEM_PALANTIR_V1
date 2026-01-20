# frozen_string_literal: true

FactoryBot.define do
  factory :sale_line_item do
    association :store
    association :visit
    item_type { "service" }
    qty { 1 }
    list_unit_price { 10000 }
    net_unit_price { 10000 }
    net_total { 10000 }
    discount_rate { 0 }
    discount_amount { 0 }

    trait :service_item do
      item_type { "service" }
      association :service
    end

    trait :product_item do
      item_type { "product" }
      association :product
    end
  end
end
