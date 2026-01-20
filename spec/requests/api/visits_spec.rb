# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Visits", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }
  let(:customer) { create(:customer, store: store) }
  let(:staff) { create(:staff_member, store: store) }
  let(:category) { create(:service_category, store: store) }
  let(:service) { create(:service, store: store, service_category: category, list_price: 20000) }

  describe "GET /api/visits" do
    context "인증된 사용자" do
      let!(:visits) { create_list(:visit, 3, store: store, customer: customer) }
      let!(:other_store_visit) { create(:visit) }

      it "해당 store의 거래 목록을 반환한다" do
        get "/api/visits", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:visits].length).to eq(3)
      end

      it "다른 store의 거래는 반환하지 않는다" do
        get "/api/visits", headers: headers

        visit_ids = json_response[:data][:visits].map { |v| v[:id] }
        expect(visit_ids).not_to include(other_store_visit.id)
      end

      it "날짜로 필터링할 수 있다" do
        today_visit = create(:visit, store: store, customer: customer, visited_at: Time.current)
        yesterday_visit = create(:visit, store: store, customer: customer, visited_at: 1.day.ago)

        get "/api/visits", params: { date: Date.current.to_s }, headers: headers

        visit_ids = json_response[:data][:visits].map { |v| v[:id] }
        expect(visit_ids).to include(today_visit.id)
      end

      it "status로 필터링할 수 있다" do
        finalized_visit = create(:visit, :finalized, store: store, customer: customer)

        get "/api/visits", params: { status: "finalized" }, headers: headers

        visit_ids = json_response[:data][:visits].map { |v| v[:id] }
        expect(visit_ids).to include(finalized_visit.id)
        expect(json_response[:data][:visits].all? { |v| v[:status] == "finalized" }).to be true
      end

      it "고객 정보를 포함한다" do
        get "/api/visits", headers: headers

        visit = json_response[:data][:visits].first
        expect(visit[:customer]).to be_present
        expect(visit[:customer][:name]).to eq(customer.name)
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        get "/api/visits"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/visits/:id" do
    let(:visit) { create(:visit, store: store, customer: customer) }

    context "인증된 사용자" do
      it "거래 상세 정보를 반환한다" do
        get "/api/visits/#{visit.id}", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:visit][:id]).to eq(visit.id)
        expect(json_response[:data][:visit][:customer]).to be_present
      end

      it "line_items 정보를 포함한다" do
        line_item = create(:sale_line_item, visit: visit, store: store, service: service, item_type: "service")

        get "/api/visits/#{visit.id}", headers: headers

        expect(json_response[:data][:visit][:line_items]).to be_present
        expect(json_response[:data][:visit][:line_items].length).to eq(1)
      end

      it "payments 정보를 포함한다" do
        payment = create(:payment, visit: visit, store: store, amount: 10000)

        get "/api/visits/#{visit.id}", headers: headers

        expect(json_response[:data][:visit][:payments]).to be_present
        expect(json_response[:data][:visit][:payments].length).to eq(1)
      end

      it "다른 store의 거래는 조회할 수 없다" do
        other_visit = create(:visit)
        get "/api/visits/#{other_visit.id}", headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/visits" do
    let(:valid_params) do
      {
        visit: {
          customer_id: customer.id,
          visited_at: Time.current.iso8601,
          line_items: [
            {
              item_type: "service",
              service_id: service.id,
              staff_id: staff.id,
              qty: 1
            }
          ],
          payments: [
            {
              method: "card",
              amount: 20000
            }
          ]
        }
      }
    end

    context "유효한 파라미터" do
      it "거래를 생성한다" do
        expect {
          post "/api/visits", params: valid_params, headers: headers, as: :json
        }.to change(Visit, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:data][:visit][:customer][:id]).to eq(customer.id)
      end

      it "line_items를 함께 생성한다" do
        expect {
          post "/api/visits", params: valid_params, headers: headers, as: :json
        }.to change(SaleLineItem, :count).by(1)

        expect(json_response[:data][:visit][:line_items].length).to eq(1)
      end

      it "payments를 함께 생성한다" do
        expect {
          post "/api/visits", params: valid_params, headers: headers, as: :json
        }.to change(Payment, :count).by(1)

        expect(json_response[:data][:visit][:payments].length).to eq(1)
      end

      it "현재 store에 거래를 생성한다" do
        post "/api/visits", params: valid_params, headers: headers, as: :json

        expect(Visit.last.store_id).to eq(store.id)
      end

      it "finalized 상태로 거래를 생성할 수 있다" do
        params_with_finalized = valid_params.deep_dup
        params_with_finalized[:visit][:status] = "finalized"

        post "/api/visits", params: params_with_finalized, headers: headers, as: :json

        expect(json_response[:data][:visit][:status]).to eq("finalized")
      end
    end

    context "유효하지 않은 파라미터" do
      it "customer_id가 없으면 에러를 반환한다" do
        invalid_params = valid_params.deep_dup
        invalid_params[:visit].delete(:customer_id)

        post "/api/visits", params: invalid_params, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PUT /api/visits/:id/void" do
    let(:visit) { create(:visit, :finalized, store: store, customer: customer) }

    context "인증된 사용자" do
      it "거래를 void 상태로 변경한다" do
        put "/api/visits/#{visit.id}/void", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:visit][:voided]).to be true
        expect(json_response[:data][:visit][:voided_at]).to be_present
      end

      it "다른 store의 거래는 void할 수 없다" do
        other_visit = create(:visit, :finalized)
        put "/api/visits/#{other_visit.id}/void", headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
