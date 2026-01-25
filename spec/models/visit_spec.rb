# frozen_string_literal: true

require "rails_helper"

RSpec.describe Visit, type: :model do
  describe "visit_type" do
    let(:store) { create(:store) }
    let(:customer) { create(:customer, store: store) }

    it "저장된 visit_type을 반환" do
      visit = create(:visit, :finalized, customer: customer, store: store, visit_type: "new")
      expect(visit.visit_type).to eq("new")
    end

    it "visit_type이 없으면 nil" do
      visit = create(:visit, :finalized, customer: customer, store: store)
      expect(visit.visit_type).to be_nil
    end
  end
end
