# frozen_string_literal: true

require "rails_helper"

RSpec.describe InventoryPurchaseItem, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:store) }
    it { is_expected.to belong_to(:inventory_purchase) }
    it { is_expected.to belong_to(:product) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:qty) }
    it { is_expected.to validate_numericality_of(:qty).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:unit_cost) }
    it { is_expected.to validate_numericality_of(:unit_cost).is_greater_than_or_equal_to(0) }
  end

  describe "tenant isolation" do
    let(:store_a) { create(:store, name: "Store A") }
    let(:store_b) { create(:store, name: "Store B") }
    let(:vendor) { create(:vendor, store: store_a) }
    let(:product) { create(:product, store: store_a, vendor: vendor) }
    let(:purchase) { create(:inventory_purchase, store: store_a, vendor: vendor) }

    it "store_id로 스코핑된다" do
      item = InventoryPurchaseItem.create!(
        store: store_a,
        inventory_purchase: purchase,
        product: product,
        qty: 5,
        unit_cost: 1000
      )

      expect(InventoryPurchaseItem.for_store(store_a.id)).to include(item)
      expect(InventoryPurchaseItem.for_store(store_b.id)).not_to include(item)
    end
  end
end
