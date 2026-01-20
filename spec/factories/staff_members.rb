# frozen_string_literal: true

FactoryBot.define do
  factory :staff_member do
    association :store
    name { Faker::Name.name }
    phone { Faker::PhoneNumber.cell_phone }
    role_title { %w[디자이너 인턴 매니저].sample }
    active { true }
    default_commission_rate { 0.4 }
  end
end
