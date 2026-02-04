# frozen_string_literal: true

require "rails_helper"

RSpec.describe Product, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:vendor).required }
  end

  describe "validations" do
    it "vendor 없이 생성하면 유효하지 않다" do
      product = build(:product, vendor: nil)
      expect(product).not_to be_valid
      expect(product.errors[:vendor]).to be_present
    end
  end
end
