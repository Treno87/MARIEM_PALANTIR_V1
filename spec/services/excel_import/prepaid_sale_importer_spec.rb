# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExcelImport::PrepaidSaleImporter do
  let(:store) { create(:store) }
  let(:file_path) { Rails.root.join("mariem_db_20260117.xlsx").to_s }

  before do
    skip "Excel file not available" unless File.exist?(file_path)
    ExcelImport::MasterDataImporter.new(file_path, store: store).call
    ExcelImport::CustomerImporter.new(file_path, store: store).call
  end

  describe "#call" do
    subject(:result) { described_class.new(file_path, store: store).call }

    it "returns success result" do
      expect(result.success?).to be true
    end

    it "creates prepaid sales from 회원/정액 rows" do
      expect { result }.to change { PrepaidSale.count }.by_at_least(1)
    end

    it "does not create duplicate prepaid sales" do
      described_class.new(file_path, store: store).call
      initial_count = PrepaidSale.count

      described_class.new(file_path, store: store).call
      expect(PrepaidSale.count).to eq(initial_count)
    end
  end
end
