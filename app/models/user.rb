# frozen_string_literal: true

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

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
end
