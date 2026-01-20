# frozen_string_literal: true

module Api
  class StaffMembersController < BaseController
    before_action :set_staff_member, only: [ :show ]

    def index
      staff_members = current_store.staff_members
      staff_members = staff_members.where(active: true) unless params[:include_inactive] == "true"

      render_success({ staff_members: staff_members.map { |s| staff_member_json(s) } })
    end

    def show
      render_success({ staff_member: staff_member_json(@staff_member) })
    end

    private

    def set_staff_member
      @staff_member = current_store.staff_members.find(params[:id])
    end

    def staff_member_json(staff)
      {
        id: staff.id,
        name: staff.name,
        phone: staff.phone,
        role_title: staff.role_title,
        active: staff.active,
        default_commission_rate: staff.default_commission_rate
      }
    end
  end
end
