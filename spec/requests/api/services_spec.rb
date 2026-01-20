# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Services", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }
  let(:category) { create(:service_category, store: store) }

  describe "GET /api/services" do
    context "인증된 사용자" do
      let!(:services) { create_list(:service, 3, store: store, service_category: category) }
      let!(:other_store_service) { create(:service) }

      it "해당 store의 서비스 목록을 반환한다" do
        get "/api/services", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:services].length).to eq(3)
      end

      it "다른 store의 서비스는 반환하지 않는다" do
        get "/api/services", headers: headers

        service_ids = json_response[:data][:services].map { |s| s[:id] }
        expect(service_ids).not_to include(other_store_service.id)
      end

      it "서비스에 카테고리 정보를 포함한다" do
        get "/api/services", headers: headers

        service = json_response[:data][:services].first
        expect(service[:service_category_id]).to eq(category.id)
        expect(service[:service_category_name]).to eq(category.name)
      end

      it "active 상태로 필터링할 수 있다" do
        inactive_service = create(:service, store: store, service_category: category, active: false)
        get "/api/services", params: { active: true }, headers: headers

        service_ids = json_response[:data][:services].map { |s| s[:id] }
        expect(service_ids).not_to include(inactive_service.id)
      end

      it "category_id로 필터링할 수 있다" do
        other_category = create(:service_category, store: store)
        other_service = create(:service, store: store, service_category: other_category)

        get "/api/services", params: { category_id: category.id }, headers: headers

        service_ids = json_response[:data][:services].map { |s| s[:id] }
        expect(service_ids).not_to include(other_service.id)
        expect(service_ids.length).to eq(3)
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        get "/api/services"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/services" do
    let(:valid_params) do
      {
        service: {
          name: "커트",
          service_category_id: category.id,
          list_price: 15000,
          active: true
        }
      }
    end

    context "유효한 파라미터" do
      it "서비스를 생성한다" do
        expect {
          post "/api/services", params: valid_params, headers: headers, as: :json
        }.to change(Service, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:data][:service][:name]).to eq("커트")
        expect(json_response[:data][:service][:list_price]).to eq(15000)
      end

      it "현재 store에 서비스를 생성한다" do
        post "/api/services", params: valid_params, headers: headers, as: :json

        expect(Service.last.store_id).to eq(store.id)
      end
    end

    context "유효하지 않은 파라미터" do
      it "이름이 없으면 에러를 반환한다" do
        invalid_params = { service: { service_category_id: category.id, list_price: 10000 } }
        post "/api/services", params: invalid_params, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "가격이 없으면 에러를 반환한다" do
        invalid_params = { service: { name: "커트", service_category_id: category.id } }
        post "/api/services", params: invalid_params, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/services/:id" do
    let(:service) { create(:service, store: store, service_category: category, name: "원래이름", list_price: 10000) }

    context "유효한 파라미터" do
      it "서비스 정보를 업데이트한다" do
        patch "/api/services/#{service.id}",
              params: { service: { name: "새이름", list_price: 20000 } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:ok)
        expect(service.reload.name).to eq("새이름")
        expect(service.reload.list_price).to eq(20000)
      end

      it "active 상태를 변경할 수 있다" do
        patch "/api/services/#{service.id}",
              params: { service: { active: false } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:ok)
        expect(service.reload.active).to be false
      end
    end

    context "다른 store의 서비스" do
      it "업데이트할 수 없다" do
        other_service = create(:service)
        patch "/api/services/#{other_service.id}",
              params: { service: { name: "해킹" } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
