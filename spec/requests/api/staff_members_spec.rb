# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::StaffMembers", type: :request do
  let(:store) { create(:store) }
  let(:user) { create(:user, store: store) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/staff_members" do
    let!(:staff_members) { create_list(:staff_member, 3, store: store, active: true) }
    let!(:inactive_staff) { create(:staff_member, store: store, active: false) }
    let!(:other_store_staff) { create(:staff_member) }

    context "인증된 사용자" do
      it "해당 store의 활성 직원 목록을 반환한다" do
        get "/api/staff_members", headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data][:staff_members].length).to eq(3)
      end

      it "비활성 직원도 포함해서 조회할 수 있다" do
        get "/api/staff_members", params: { include_inactive: true }, headers: headers

        expect(json_response[:data][:staff_members].length).to eq(4)
      end
    end
  end

  describe "GET /api/staff_members/:id" do
    let(:staff_member) { create(:staff_member, store: store) }

    it "직원 상세 정보를 반환한다" do
      get "/api/staff_members/#{staff_member.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response[:data][:staff_member][:id]).to eq(staff_member.id)
      expect(json_response[:data][:staff_member][:name]).to eq(staff_member.name)
    end
  end
end
