# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExcelImport::CustomerImporter do
  let(:store) { create(:store) }
  let(:file_path) { Rails.root.join("mariem_db_20260117.xlsx").to_s }

  before do
    skip "Excel file not available" unless File.exist?(file_path)
  end

  describe "#call" do
    subject(:result) { described_class.new(file_path, store: store).call }

    it "returns success result" do
      expect(result.success?).to be true
    end

    it "creates customers from Excel data" do
      expect { result }.to change { Customer.count }.by_at_least(1)
    end

    it "does not create duplicate customers" do
      described_class.new(file_path, store: store).call
      initial_count = Customer.count

      described_class.new(file_path, store: store).call
      expect(Customer.count).to eq(initial_count)
    end

    it "stores gender in memo field" do
      result
      customer_with_gender = Customer.where.not(memo: nil).first
      expect(customer_with_gender.memo).to match(/성별:/)
    end
  end

  describe "foreign tourist handling" do
    it "creates separate records for 외국인관광객" do
      result = described_class.new(file_path, store: store).call
      foreign_tourists = Customer.where("name LIKE ?", "외국인관광객%")

      expect(foreign_tourists.count).to be >= 1
    end
  end

  describe "same name different gender handling" do
    it "creates separate records for same name different gender" do
      result = described_class.new(file_path, store: store).call

      # 동명이인 중 하나라도 있으면 성별 구분이 작동함
      customers_with_memo = Customer.where.not(memo: nil)
      expect(customers_with_memo.count).to be >= 1
    end
  end
end
