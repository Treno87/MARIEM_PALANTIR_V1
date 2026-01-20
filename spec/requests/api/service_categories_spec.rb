# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::ServiceCategories", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/service_categories" do
    context "인증된 사용자" do
      let!(:categories) { create_list(:service_category, 3, store: store) }
      let!(:other_store_category) { create(:service_category) }

      it "해당 store의 서비스 카테고리 목록을 반환한다" do
        get "/api/service_categories", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:service_categories].length).to eq(3)
      end

      it "다른 store의 카테고리는 반환하지 않는다" do
        get "/api/service_categories", headers: headers

        category_ids = json_response[:data][:service_categories].map { |c| c[:id] }
        expect(category_ids).not_to include(other_store_category.id)
      end

      it "카테고리에 속한 서비스 수를 반환한다" do
        category = categories.first
        create_list(:service, 2, store: store, service_category: category)

        get "/api/service_categories", headers: headers

        target = json_response[:data][:service_categories].find { |c| c[:id] == category.id }
        expect(target[:services_count]).to eq(2)
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        get "/api/service_categories"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/service_categories" do
    let(:valid_params) do
      {
        service_category: {
          name: "헤어 서비스"
        }
      }
    end

    context "유효한 파라미터" do
      it "서비스 카테고리를 생성한다" do
        expect {
          post "/api/service_categories", params: valid_params, headers: headers, as: :json
        }.to change(ServiceCategory, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:data][:service_category][:name]).to eq("헤어 서비스")
      end

      it "현재 store에 카테고리를 생성한다" do
        post "/api/service_categories", params: valid_params, headers: headers, as: :json

        expect(ServiceCategory.last.store_id).to eq(store.id)
      end
    end

    context "유효하지 않은 파라미터" do
      it "이름이 없으면 에러를 반환한다" do
        invalid_params = { service_category: { name: "" } }
        post "/api/service_categories", params: invalid_params, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/service_categories/:id" do
    let(:category) { create(:service_category, store: store, name: "원래이름") }

    context "유효한 파라미터" do
      it "카테고리 정보를 업데이트한다" do
        patch "/api/service_categories/#{category.id}",
              params: { service_category: { name: "새이름" } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:ok)
        expect(category.reload.name).to eq("새이름")
      end
    end

    context "다른 store의 카테고리" do
      it "업데이트할 수 없다" do
        other_category = create(:service_category)
        patch "/api/service_categories/#{other_category.id}",
              params: { service_category: { name: "해킹" } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
