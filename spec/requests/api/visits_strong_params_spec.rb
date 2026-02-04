# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Visits Strong Parameters", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }
  let(:customer) { create(:customer, store: store) }
  let(:staff) { create(:staff_member, store: store) }
  let(:category) { create(:service_category, store: store) }
  let(:service) { create(:service, store: store, service_category: category, list_price: 20000) }

  describe "POST /api/visits" do
    it "클라이언트가 status를 보내도 서버가 무시하고 기본값(finalized)으로 생성한다" do
      params = {
        visit: {
          customer_id: customer.id,
          visited_at: Time.current.iso8601,
          status: "draft",
          line_items: [
            { item_type: "service", service_id: service.id, staff_id: staff.id, qty: 1 }
          ],
          payments: [
            { method: "card", amount: 20000 }
          ]
        }
      }

      post "/api/visits", params: params, headers: headers, as: :json

      expect(response).to have_http_status(:created)
      expect(json_response[:data][:visit][:status]).to eq("finalized")
    end
  end
end
