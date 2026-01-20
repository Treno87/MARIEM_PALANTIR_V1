# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Reports", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }
  let(:customer) { create(:customer, store: store) }
  let(:staff1) { create(:staff_member, store: store, name: "직원A") }
  let(:staff2) { create(:staff_member, store: store, name: "직원B") }
  let(:category) { create(:service_category, store: store) }
  let(:service) { create(:service, store: store, service_category: category, list_price: 10000) }

  describe "GET /api/reports/daily" do
    context "인증된 사용자" do
      before do
        # 오늘 거래 2건
        visit1 = create(:visit, :finalized, store: store, customer: customer, visited_at: Time.current)
        create(:sale_line_item, visit: visit1, store: store, service: service, item_type: "service",
               qty: 1, list_unit_price: 10000, net_unit_price: 10000, net_total: 10000)
        create(:payment, visit: visit1, store: store, amount: 10000)
        visit1.save!

        visit2 = create(:visit, :finalized, store: store, customer: customer, visited_at: Time.current)
        create(:sale_line_item, visit: visit2, store: store, service: service, item_type: "service",
               qty: 2, list_unit_price: 10000, net_unit_price: 10000, net_total: 20000)
        create(:payment, visit: visit2, store: store, amount: 20000)
        visit2.save!

        # 어제 거래 1건
        yesterday_visit = create(:visit, :finalized, store: store, customer: customer, visited_at: 1.day.ago)
        create(:sale_line_item, visit: yesterday_visit, store: store, service: service, item_type: "service",
               qty: 1, list_unit_price: 10000, net_unit_price: 10000, net_total: 10000)
        create(:payment, visit: yesterday_visit, store: store, amount: 10000)
        yesterday_visit.save!
      end

      it "오늘 날짜의 매출 리포트를 반환한다" do
        get "/api/reports/daily", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:report][:date]).to eq(Date.current.to_s)
        expect(json_response[:data][:report][:total_sales]).to eq(30000)
        expect(json_response[:data][:report][:visit_count]).to eq(2)
      end

      it "특정 날짜의 매출 리포트를 반환한다" do
        get "/api/reports/daily", params: { date: 1.day.ago.to_date.to_s }, headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:report][:total_sales]).to eq(10000)
        expect(json_response[:data][:report][:visit_count]).to eq(1)
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        get "/api/reports/daily"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/reports/monthly" do
    context "인증된 사용자" do
      before do
        # 이번달 거래
        visit1 = create(:visit, :finalized, store: store, customer: customer, visited_at: Time.current)
        create(:sale_line_item, visit: visit1, store: store, service: service, item_type: "service",
               qty: 1, list_unit_price: 10000, net_unit_price: 10000, net_total: 10000)
        create(:payment, visit: visit1, store: store, amount: 10000)
        visit1.save!
      end

      it "이번달 매출 리포트를 반환한다" do
        get "/api/reports/monthly", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:report][:year]).to eq(Date.current.year)
        expect(json_response[:data][:report][:month]).to eq(Date.current.month)
        expect(json_response[:data][:report][:total_sales]).to eq(10000)
      end

      it "특정 년월의 매출 리포트를 반환한다" do
        get "/api/reports/monthly", params: { year: 2026, month: 1 }, headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:report][:year]).to eq(2026)
        expect(json_response[:data][:report][:month]).to eq(1)
      end
    end
  end

  describe "GET /api/reports/by_staff" do
    context "인증된 사용자" do
      before do
        # 직원A 거래
        visit1 = create(:visit, :finalized, store: store, customer: customer, visited_at: Time.current)
        create(:sale_line_item, visit: visit1, store: store, service: service, item_type: "service",
               staff: staff1, qty: 1, list_unit_price: 10000, net_unit_price: 10000, net_total: 10000)
        create(:payment, visit: visit1, store: store, amount: 10000)
        visit1.save!

        # 직원B 거래
        visit2 = create(:visit, :finalized, store: store, customer: customer, visited_at: Time.current)
        create(:sale_line_item, visit: visit2, store: store, service: service, item_type: "service",
               staff: staff2, qty: 2, list_unit_price: 10000, net_unit_price: 10000, net_total: 20000)
        create(:payment, visit: visit2, store: store, amount: 20000)
        visit2.save!
      end

      it "직원별 매출 리포트를 반환한다" do
        get "/api/reports/by_staff", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:report][:staff_sales]).to be_present
        expect(json_response[:data][:report][:staff_sales].length).to eq(2)
      end

      it "직원별 매출 합계가 정확하다" do
        get "/api/reports/by_staff", headers: headers

        staff_sales = json_response[:data][:report][:staff_sales]
        staff1_data = staff_sales.find { |s| s[:staff_id] == staff1.id }
        staff2_data = staff_sales.find { |s| s[:staff_id] == staff2.id }

        expect(staff1_data[:total_sales]).to eq(10000)
        expect(staff2_data[:total_sales]).to eq(20000)
      end
    end
  end

  describe "GET /api/reports/by_method" do
    context "인증된 사용자" do
      before do
        visit = create(:visit, :finalized, store: store, customer: customer, visited_at: Time.current)
        create(:sale_line_item, visit: visit, store: store, service: service, item_type: "service",
               qty: 3, list_unit_price: 10000, net_unit_price: 10000, net_total: 30000)
        create(:payment, visit: visit, store: store, amount: 20000)  # card (default)
        create(:payment, :cash, visit: visit, store: store, amount: 10000)
        visit.save!
      end

      it "결제수단별 매출 리포트를 반환한다" do
        get "/api/reports/by_method", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:report][:method_sales]).to be_present
      end

      it "결제수단별 금액이 정확하다" do
        get "/api/reports/by_method", headers: headers

        method_sales = json_response[:data][:report][:method_sales]
        card_data = method_sales.find { |m| m[:method] == "card" }
        cash_data = method_sales.find { |m| m[:method] == "cash" }

        expect(card_data[:total_amount]).to eq(20000)
        expect(cash_data[:total_amount]).to eq(10000)
      end
    end
  end
end
