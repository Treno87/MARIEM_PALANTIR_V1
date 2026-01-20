# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Customers", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/customers" do
    context "인증된 사용자" do
      let!(:customers) { create_list(:customer, 3, store: store) }
      let!(:other_store_customer) { create(:customer) } # 다른 store

      it "해당 store의 고객 목록을 반환한다" do
        get "/api/customers", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:customers].length).to eq(3)
      end

      it "다른 store의 고객은 반환하지 않는다" do
        get "/api/customers", headers: headers

        customer_ids = json_response[:data][:customers].map { |c| c[:id] }
        expect(customer_ids).not_to include(other_store_customer.id)
      end

      it "이름으로 검색할 수 있다" do
        target = customers.first
        get "/api/customers", params: { q: target.name }, headers: headers

        expect(json_response[:data][:customers].length).to be >= 1
      end

      it "전화번호로 검색할 수 있다" do
        target = customers.first
        get "/api/customers", params: { q: target.phone }, headers: headers

        expect(json_response[:data][:customers].length).to be >= 1
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        get "/api/customers"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/customers/:id" do
    let(:customer) { create(:customer, store: store) }

    context "인증된 사용자" do
      it "고객 상세 정보를 반환한다" do
        get "/api/customers/#{customer.id}", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:customer][:id]).to eq(customer.id)
        expect(json_response[:data][:customer][:name]).to eq(customer.name)
        expect(json_response[:data][:customer][:phone]).to eq(customer.phone)
      end

      it "다른 store의 고객은 조회할 수 없다" do
        other_customer = create(:customer)
        get "/api/customers/#{other_customer.id}", headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/customers" do
    let(:valid_params) do
      {
        customer: {
          name: "홍길동",
          phone: "010-1234-5678",
          memo: "VIP 고객"
        }
      }
    end

    context "유효한 파라미터" do
      it "고객을 생성한다" do
        expect {
          post "/api/customers", params: valid_params, headers: headers, as: :json
        }.to change(Customer, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:data][:customer][:name]).to eq("홍길동")
      end

      it "현재 store에 고객을 생성한다" do
        post "/api/customers", params: valid_params, headers: headers, as: :json

        expect(Customer.last.store_id).to eq(store.id)
      end
    end

    context "유효하지 않은 파라미터" do
      it "이름이 없으면 에러를 반환한다" do
        invalid_params = { customer: { phone: "010-1234-5678" } }
        post "/api/customers", params: invalid_params, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/customers/:id" do
    let(:customer) { create(:customer, store: store, name: "원래이름") }

    context "유효한 파라미터" do
      it "고객 정보를 업데이트한다" do
        patch "/api/customers/#{customer.id}", params: { customer: { name: "새이름" } }, headers: headers, as: :json

        expect(response).to have_http_status(:ok)
        expect(customer.reload.name).to eq("새이름")
      end
    end

    context "다른 store의 고객" do
      it "업데이트할 수 없다" do
        other_customer = create(:customer)
        patch "/api/customers/#{other_customer.id}", params: { customer: { name: "해킹" } }, headers: headers, as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
