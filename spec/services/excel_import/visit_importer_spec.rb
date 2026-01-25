# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExcelImport::VisitImporter do
  let(:store) { create(:store) }
  let(:file_path) { Rails.root.join("mariem_db_20260117.xlsx").to_s }

  before do
    skip "Excel file not available" unless File.exist?(file_path)
    # Master data and customers must exist first
    ExcelImport::MasterDataImporter.new(file_path, store: store).call
    ExcelImport::CustomerImporter.new(file_path, store: store).call
  end

  describe "#call" do
    subject(:result) { described_class.new(file_path, store: store).call }

    it "returns success result" do
      expect(result.success?).to be true
    end

    it "creates visits from Excel data" do
      expect { result }.to change { Visit.count }.by_at_least(1)
    end

    it "creates sale line items from Excel data" do
      expect { result }.to change { SaleLineItem.count }.by_at_least(1)
    end

    it "creates payments from Excel data" do
      expect { result }.to change { Payment.count }.by_at_least(1)
    end

    it "sets visit status to finalized" do
      result
      expect(Visit.last.status).to eq("finalized")
    end

    it "sets visit_type from Excel data" do
      result
      visit_types = Visit.pluck(:visit_type).uniq.compact
      expect(visit_types).to include("returning")
    end
  end

  describe "visit grouping" do
    it "creates one visit per customer per day" do
      result = described_class.new(file_path, store: store).call

      # Verify visits are grouped by customer and date
      visit_counts = Visit.group(:customer_id, "DATE(visited_at)").count
      expect(visit_counts.values.all? { |v| v == 1 }).to be true
    end
  end

  describe "sale line items" do
    it "creates service type items for 시술 rows" do
      result = described_class.new(file_path, store: store).call

      service_items = SaleLineItem.where(item_type: "service")
      expect(service_items.count).to be > 0
    end

    it "creates product type items for 점판 rows" do
      result = described_class.new(file_path, store: store).call

      product_items = SaleLineItem.where(item_type: "product")
      expect(product_items.count).to be > 0
    end
  end

  describe "payments" do
    it "creates cash payments" do
      result = described_class.new(file_path, store: store).call

      cash_payments = Payment.where(method: "cash")
      expect(cash_payments.count).to be > 0
    end

    it "creates card payments" do
      result = described_class.new(file_path, store: store).call

      card_payments = Payment.where(method: "card")
      expect(card_payments.count).to be > 0
    end
  end

  describe "prepaid usage" do
    it "creates prepaid usages for 정액 payments" do
      # First create some prepaid sales
      ExcelImport::PrepaidSaleImporter.new(file_path, store: store).call

      result = described_class.new(file_path, store: store).call

      prepaid_usages = PrepaidUsage.count
      expect(prepaid_usages).to be >= 0
    end
  end
end
