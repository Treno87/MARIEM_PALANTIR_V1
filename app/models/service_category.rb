# frozen_string_literal: true

class ServiceCategory < ApplicationRecord
  include StoreScoped

  has_many :services, dependent: :destroy

  validates :name, presence: true
end
