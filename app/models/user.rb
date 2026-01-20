# frozen_string_literal: true

class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  belongs_to :store

  ROLES = %w[OWNER MANAGER STYLIST].freeze

  validates :role, presence: true, inclusion: { in: ROLES }

  def owner?
    role == "OWNER"
  end

  def manager?
    role == "MANAGER"
  end

  def stylist?
    role == "STYLIST"
  end

  # JWT payload에 추가 정보 포함
  def jwt_payload
    {
      "store_id" => store_id,
      "role" => role
    }
  end
end
