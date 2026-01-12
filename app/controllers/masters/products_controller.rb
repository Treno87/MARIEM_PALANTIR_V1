# frozen_string_literal: true

module Masters
  class ProductsController < ApplicationController
    before_action :set_product, only: [:edit, :update, :destroy]
    before_action :set_vendors, only: [:new, :create, :edit, :update]

    def index
      @products = current_store.products.includes(:vendor).order(:name)
    end

    def new
      @product = current_store.products.build(active: true, kind: "retail")
    end

    def create
      @product = current_store.products.build(product_params)
      if @product.save
        redirect_to masters_products_path, notice: "상품이 등록되었습니다."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @product.update(product_params)
        redirect_to masters_products_path, notice: "상품이 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @product.destroy
      redirect_to masters_products_path, notice: "상품이 삭제되었습니다."
    end

    private

    def set_product
      @product = current_store.products.find(params[:id])
    end

    def set_vendors
      @vendors = current_store.vendors.order(:name)
    end

    def product_params
      params.require(:product).permit(:vendor_id, :name, :kind, :size_value, :size_unit,
                                      :default_purchase_unit_price, :default_retail_unit_price, :active)
    end
  end
end
