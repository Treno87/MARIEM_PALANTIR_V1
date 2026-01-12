# frozen_string_literal: true

module Masters
  class StaffMembersController < ApplicationController
    before_action :set_staff_member, only: [:edit, :update, :destroy]

    def index
      @staff_members = current_store.staff_members.order(:name)
    end

    def new
      @staff_member = current_store.staff_members.build(active: true)
    end

    def create
      @staff_member = current_store.staff_members.build(staff_member_params)
      if @staff_member.save
        redirect_to masters_staff_members_path, notice: "직원이 등록되었습니다."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @staff_member.update(staff_member_params)
        redirect_to masters_staff_members_path, notice: "직원 정보가 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @staff_member.destroy
      redirect_to masters_staff_members_path, notice: "직원이 삭제되었습니다."
    end

    private

    def set_staff_member
      @staff_member = current_store.staff_members.find(params[:id])
    end

    def staff_member_params
      params.require(:staff_member).permit(:name, :role_title, :phone, :active, :default_commission_rate)
    end
  end
end
