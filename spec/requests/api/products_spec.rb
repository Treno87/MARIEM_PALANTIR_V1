# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Products", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }
  let(:vendor) { create(:vendor, store: store) }

  describe "GET /api/products" do
    context "인증된 사용자" do
      let!(:products) { create_list(:product, 3, store: store) }
      let!(:other_store_product) { create(:product) }

      it "해당 store의 제품 목록을 반환한다" do
        get "/api/products", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:success]).to be true
        expect(json_response[:data][:products].length).to eq(3)
      end

      it "다른 store의 제품은 반환하지 않는다" do
        get "/api/products", headers: headers

        product_ids = json_response[:data][:products].map { |p| p[:id] }
        expect(product_ids).not_to include(other_store_product.id)
      end

      it "active 상태로 필터링할 수 있다" do
        inactive_product = create(:product, store: store, active: false)
        get "/api/products", params: { active: true }, headers: headers

        product_ids = json_response[:data][:products].map { |p| p[:id] }
        expect(product_ids).not_to include(inactive_product.id)
      end

      it "kind로 필터링할 수 있다 (retail)" do
        consumable_product = create(:product, store: store, kind: "consumable")
        get "/api/products", params: { kind: "retail" }, headers: headers

        product_ids = json_response[:data][:products].map { |p| p[:id] }
        expect(product_ids).not_to include(consumable_product.id)
      end

      it "for_sale로 필터링할 수 있다 (retail 또는 both)" do
        consumable_only = create(:product, store: store, kind: "consumable")
        both_kind = create(:product, store: store, kind: "both")

        get "/api/products", params: { for_sale: true }, headers: headers

        product_ids = json_response[:data][:products].map { |p| p[:id] }
        expect(product_ids).not_to include(consumable_only.id)
        expect(product_ids).to include(both_kind.id)
      end
    end

    context "인증되지 않은 요청" do
      it "401을 반환한다" do
        get "/api/products"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/products" do
    let(:valid_params) do
      {
        product: {
          name: "샴푸",
          kind: "retail",
          vendor_id: vendor.id,
          default_retail_unit_price: 15000,
          active: true
        }
      }
    end

    context "유효한 파라미터" do
      it "제품을 생성한다" do
        expect {
          post "/api/products", params: valid_params, headers: headers, as: :json
        }.to change(Product, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:data][:product][:name]).to eq("샴푸")
        expect(json_response[:data][:product][:kind]).to eq("retail")
      end

      it "현재 store에 제품을 생성한다" do
        post "/api/products", params: valid_params, headers: headers, as: :json

        expect(Product.last.store_id).to eq(store.id)
      end
    end

    context "유효하지 않은 파라미터" do
      it "이름이 없으면 에러를 반환한다" do
        invalid_params = { product: { kind: "retail" } }
        post "/api/products", params: invalid_params, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "잘못된 kind면 에러를 반환한다" do
        invalid_params = { product: { name: "테스트", kind: "invalid" } }
        post "/api/products", params: invalid_params, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/products/:id" do
    let(:product) { create(:product, store: store, name: "원래이름", default_retail_unit_price: 10000) }

    context "유효한 파라미터" do
      it "제품 정보를 업데이트한다" do
        patch "/api/products/#{product.id}",
              params: { product: { name: "새이름", default_retail_unit_price: 20000 } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:ok)
        expect(product.reload.name).to eq("새이름")
        expect(product.reload.default_retail_unit_price).to eq(20000)
      end

      it "active 상태를 변경할 수 있다" do
        patch "/api/products/#{product.id}",
              params: { product: { active: false } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:ok)
        expect(product.reload.active).to be false
      end
    end

    context "다른 store의 제품" do
      it "업데이트할 수 없다" do
        other_product = create(:product)
        patch "/api/products/#{other_product.id}",
              params: { product: { name: "해킹" } },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
