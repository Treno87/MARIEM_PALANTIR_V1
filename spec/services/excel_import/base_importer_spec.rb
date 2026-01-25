# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExcelImport::BaseImporter do
  let(:store) { create(:store) }
  let(:file_path) { Rails.root.join("mariem_db_20260117.xlsx").to_s }

  describe "#initialize" do
    it "accepts file_path and store" do
      importer = described_class.new(file_path, store: store)

      expect(importer.file_path).to eq(file_path)
      expect(importer.store).to eq(store)
    end
  end

  describe "#call" do
    context "when file does not exist" do
      let(:invalid_path) { "/nonexistent/file.xlsx" }

      it "returns failure result" do
        importer = described_class.new(invalid_path, store: store)
        result = importer.call

        expect(result.success?).to be false
        expect(result.error).to include("File not found")
      end
    end

    context "when file exists", :skip_if_no_excel do
      it "returns success result with counts" do
        skip "Excel file not available" unless File.exist?(file_path)

        importer = described_class.new(file_path, store: store)
        result = importer.call

        expect(result.success?).to be true
        expect(result.processed).to be_a(Integer)
        expect(result.created).to be_a(Integer)
        expect(result.skipped).to be_a(Integer)
        expect(result.failed).to be_a(Integer)
      end
    end
  end

  describe "#sheet" do
    context "when file exists", :skip_if_no_excel do
      it "returns the data sheet" do
        skip "Excel file not available" unless File.exist?(file_path)

        importer = described_class.new(file_path, store: store)

        expect(importer.sheet).not_to be_nil
        expect(importer.sheet.first_row).to be >= 1
      end
    end
  end

  describe "Result struct" do
    it "has expected attributes" do
      result = ExcelImport::BaseImporter::Result.new(
        success?: true,
        processed: 100,
        created: 80,
        skipped: 15,
        failed: 5,
        errors: [ "Error 1", "Error 2" ]
      )

      expect(result.success?).to be true
      expect(result.processed).to eq(100)
      expect(result.created).to eq(80)
      expect(result.skipped).to eq(15)
      expect(result.failed).to eq(5)
      expect(result.errors).to eq([ "Error 1", "Error 2" ])
    end
  end
end
