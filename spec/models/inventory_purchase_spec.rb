# frozen_string_literal: true

require "rails_helper"

RSpec.describe InventoryPurchase, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:vendor).required }
  end

  describe "validations" do
    it "vendor 없이 생성하면 유효하지 않다" do
      purchase = build(:inventory_purchase, vendor: nil)
      expect(purchase).not_to be_valid
      expect(purchase.errors[:vendor]).to be_present
    end
  end
end
