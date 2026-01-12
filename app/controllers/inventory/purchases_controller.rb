# frozen_string_literal: true

module Inventory
  class PurchasesController < ApplicationController
    before_action :set_purchase, only: [:show, :edit, :update, :destroy]
    before_action :set_form_data, only: [:new, :create, :edit, :update]

    def index
      @purchases = current_store.inventory_purchases.includes(:vendor, :inventory_purchase_items)
                                .order(purchased_at: :desc)
    end

    def show
    end

    def new
      @purchase = current_store.inventory_purchases.build(purchased_at: Time.current)
    end

    def create
      @purchase = current_store.inventory_purchases.build(purchase_params)
      if @purchase.save
        redirect_to inventory_purchases_path, notice: "입고가 등록되었습니다."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      if @purchase.update(purchase_params)
        redirect_to inventory_purchases_path, notice: "입고가 수정되었습니다."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @purchase.destroy
      redirect_to inventory_purchases_path, notice: "입고가 삭제되었습니다."
    end

    private

    def set_purchase
      @purchase = current_store.inventory_purchases.find(params[:id])
    end

    def set_form_data
      @vendors = current_store.vendors.order(:name)
      @products = current_store.products.order(:name)
    end

    def purchase_params
      params.require(:inventory_purchase).permit(:vendor_id, :purchased_at,
        inventory_purchase_items_attributes: [:id, :product_id, :qty, :unit_cost, :_destroy])
    end
  end
end
