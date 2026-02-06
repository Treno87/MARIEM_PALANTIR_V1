# frozen_string_literal: true

require "rails_helper"

RSpec.describe HandsosImportService do
  let(:store) { create(:store, name: "마리엠 헤어살롱") }
  let(:fixture_path) { Rails.root.join("spec/fixtures/files/handsos_sample.html").to_s }

  subject(:service) { described_class.new(fixture_path, store: store) }


  describe "#call" do
    subject(:result) { service.call }

    it "returns a result struct" do
      expect(result).to respond_to(:visits_created)
      expect(result).to respond_to(:visits_skipped)
      expect(result).to respond_to(:customers_created)
      expect(result).to respond_to(:services_created)
      expect(result).to respond_to(:prepaid_created)
      expect(result).to respond_to(:errors)
    end

    context "전체 import 결과" do
      it "creates visits for transaction rows" do
        expect { result }.to change(Visit, :count).by_at_least(3)
      end

      it "creates customers" do
        expect { result }.to change(Customer, :count).by_at_least(4)
      end

      it "creates staff members" do
        expect { result }.to change(StaffMember, :count).by_at_least(2)
      end

      it "creates service categories" do
        expect { result }.to change(ServiceCategory, :count).by_at_least(3)
      end

      it "creates services" do
        expect { result }.to change(Service, :count).by_at_least(4)
      end

      it "has no errors" do
        expect(result.errors).to be_empty
      end
    end

    context "시술 그룹핑 (같은 고객+시간 = 1 Visit)" do
      before { result }

      it "groups rows with same customer and datetime into one visit" do
        customer = Customer.find_by(name: "테스트고객")
        visits = Visit.where(customer: customer)
        expect(visits.count).to eq(1)
      end

      it "creates multiple line items within one visit" do
        customer = Customer.find_by(name: "테스트고객")
        visit = Visit.find_by(customer: customer)
        expect(visit.sale_line_items.count).to eq(2)
      end

      it "sets correct visit attributes" do
        customer = Customer.find_by(name: "테스트고객")
        visit = Visit.find_by(customer: customer)
        expect(visit.status).to eq("finalized")
        expect(visit.source).to eq("handsos")
        expect(visit.visit_type).to eq("new")
        expect(visit.external_hash).to be_present
      end
    end

    context "SaleLineItem 가격 계산" do
      before { result }

      it "sets correct prices for non-discounted item" do
        customer = Customer.find_by(name: "테스트고객")
        visit = Visit.find_by(customer: customer)
        cut_item = visit.sale_line_items.joins(:service).find_by(services: { name: "여성커트" })
        expect(cut_item.list_unit_price).to eq(40_000)
        expect(cut_item.net_total).to eq(40_000)
      end

      it "sets correct prices for discounted item (할인율)" do
        customer = Customer.find_by(name: "테스트고객")
        visit = Visit.find_by(customer: customer)
        color_item = visit.sale_line_items.joins(:service).find_by(services: { name: "새치염색" })
        expect(color_item.list_unit_price).to eq(80_000)
        expect(color_item.discount_rate).to eq(10)
        expect(color_item.net_total).to eq(72_000)
        expect(color_item.event_name).to eq("1월 할인")
      end

      it "sets correct prices for 30% discount" do
        customer = Customer.find_by(name: "할인고객")
        visit = Visit.find_by(customer: customer)
        item = visit.sale_line_items.first
        expect(item.list_unit_price).to eq(120_000)
        expect(item.discount_rate).to eq(30)
        expect(item.net_total).to eq(84_000)
        expect(item.event_name).to eq("1월 프로모션")
      end
    end

    context "Payment 결제수단 합산" do
      before { result }

      it "creates card and cash payments for grouped visit" do
        customer = Customer.find_by(name: "테스트고객")
        visit = Visit.find_by(customer: customer)
        payments = visit.payments

        card_payment = payments.find_by(method: "card")
        cash_payment = payments.find_by(method: "cash")

        expect(card_payment.amount).to eq(40_000)
        expect(cash_payment.amount).to eq(72_000)
      end

      it "creates pay payment for discount visit" do
        customer = Customer.find_by(name: "할인고객")
        visit = Visit.find_by(customer: customer)
        pay_payment = visit.payments.find_by(method: "pay")
        expect(pay_payment.amount).to eq(84_000)
      end
    end

    context "점판 (product sale)" do
      before { result }

      it "creates a visit for product sale" do
        customer = Customer.find_by(name: "점판고객")
        visit = Visit.find_by(customer: customer)
        expect(visit).to be_present
        expect(visit.sale_line_items.count).to eq(1)
      end

      it "sets correct qty for product" do
        customer = Customer.find_by(name: "점판고객")
        visit = Visit.find_by(customer: customer)
        item = visit.sale_line_items.first
        expect(item.qty).to eq(2)
        expect(item.list_unit_price).to eq(15_000)
        expect(item.net_total).to eq(30_000)
      end
    end

    context "정액/회원 (prepaid purchases)" do
      before { result }

      it "creates prepaid plans" do
        expect(PrepaidPlan.count).to be >= 2
      end

      it "creates prepaid sales for 정액" do
        customer = Customer.find_by(name: "정액고객")
        prepaid_sale = PrepaidSale.find_by(customer: customer)
        expect(prepaid_sale).to be_present
        expect(prepaid_sale.value_amount).to eq(500_000)
        expect(prepaid_sale.amount_paid).to eq(500_000)
      end

      it "creates prepaid sales for 회원" do
        customer = Customer.find_by(name: "회원고객")
        prepaid_sale = PrepaidSale.find_by(customer: customer)
        expect(prepaid_sale).to be_present
        expect(prepaid_sale.value_amount).to eq(100_000)
        expect(prepaid_sale.amount_paid).to eq(100_000)
      end
    end

    context "Customer 속성" do
      before { result }

      it "sets gender on customer" do
        customer = Customer.find_by(name: "테스트고객")
        expect(customer.gender).to eq("female")
      end

      it "sets male gender" do
        customer = Customer.find_by(name: "점판고객")
        expect(customer.gender).to eq("male")
      end
    end

    context "중복 방지 (idempotent)" do
      it "skips already imported visits on re-run" do
        first_result = service.call
        expect(first_result.visits_created).to be > 0

        visit_count_before = Visit.count
        second_result = described_class.new(fixture_path, store: store).call

        expect(second_result.visits_created).to eq(0)
        expect(second_result.visits_skipped).to be > 0
        expect(Visit.count).to eq(visit_count_before)
      end
    end

    context "메모 처리" do
      before { result }

      it "stores memo from handsos data" do
        customer = Customer.find_by(name: "테스트고객")
        visit = Visit.find_by(customer: customer)
        expect(visit.memo).to include("첫 방문 고객")
      end
    end
  end
end
