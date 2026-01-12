# frozen_string_literal: true

module Masters
  class VendorsController < ApplicationController
    before_action :set_vendor, only: [:edit, :update, :destroy]

    def index
      @vendors = current_store.vendors.order(:name)
    end

    def new
      @vendor = current_store.vendors.build
    end

    def create
      @vendor = current_store.vendors.build(vendor_params)
      if @vendor.save
        redirect_to masters_vendors_path, notice: "공급업체가 등록되었습니다."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @vendor.update(vendor_params)
        redirect_to masters_vendors_path, notice: "공급업체가 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @vendor.destroy
      redirect_to masters_vendors_path, notice: "공급업체가 삭제되었습니다."
    end

    private

    def set_vendor
      @vendor = current_store.vendors.find(params[:id])
    end

    def vendor_params
      params.require(:vendor).permit(:name, :phone)
    end
  end
end
