# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExcelImport::MasterDataImporter do
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

    it "creates staff members from Excel data" do
      expect { result }.to change { StaffMember.count }.by_at_least(1)
    end

    it "creates service categories from Excel data" do
      expect { result }.to change { ServiceCategory.count }.by_at_least(1)
    end

    it "creates services from Excel data" do
      expect { result }.to change { Service.count }.by_at_least(1)
    end

    it "creates vendors from 점판 rows" do
      expect { result }.to change { Vendor.count }.by_at_least(1)
    end

    it "creates products from 점판 rows" do
      expect { result }.to change { Product.count }.by_at_least(1)
    end

    it "creates prepaid plans from 회원/정액 rows" do
      expect { result }.to change { PrepaidPlan.count }.by_at_least(1)
    end

    it "does not create duplicate staff members" do
      described_class.new(file_path, store: store).call
      initial_count = StaffMember.count

      described_class.new(file_path, store: store).call
      expect(StaffMember.count).to eq(initial_count)
    end

    it "does not create duplicate services" do
      described_class.new(file_path, store: store).call
      initial_count = Service.count

      described_class.new(file_path, store: store).call
      expect(Service.count).to eq(initial_count)
    end
  end

  describe "staff member creation" do
    it "creates staff with expected names" do
      described_class.new(file_path, store: store).call

      expect(StaffMember.pluck(:name)).to include("장다솜", "정재희")
    end

    it "sets default role_title" do
      described_class.new(file_path, store: store).call

      expect(StaffMember.first.role_title).to eq("디자이너")
    end
  end

  describe "service category creation" do
    it "creates categories from 시술 rows menu column" do
      described_class.new(file_path, store: store).call

      expect(ServiceCategory.pluck(:name)).to include("컷", "펌", "염색")
    end
  end

  describe "vendor creation" do
    it "creates vendors from 점판 rows menu column" do
      described_class.new(file_path, store: store).call

      expect(Vendor.pluck(:name)).to include("아윤채", "르벨")
    end
  end

  describe "prepaid plan creation" do
    it "creates plans from 회원 rows" do
      described_class.new(file_path, store: store).call

      expect(PrepaidPlan.pluck(:name)).to include("남자커트3회권", "두피관리 10회")
    end
  end
end
