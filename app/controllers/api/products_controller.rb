# frozen_string_literal: true

module Api
  class ProductsController < BaseController
    before_action :set_product, only: [ :update ]

    def index
      products = current_store.products.includes(:vendor)
      products = products.active if true_param?(:active)
      products = products.where(kind: params[:kind]) if params[:kind].present?
      products = products.for_sale if true_param?(:for_sale)

      render_success({ products: products.map { |p| product_json(p) } })
    end

    def create
      product = current_store.products.build(product_params)

      if product.save
        render_success({ product: product_json(product) }, status: :created)
      else
        render_error(product.errors.full_messages.join(", "))
      end
    end

    def update
      if @product.update(product_params)
        render_success({ product: product_json(@product) })
      else
        render_error(@product.errors.full_messages.join(", "))
      end
    end

    private

    def set_product
      @product = current_store.products.find(params[:id])
    end

    def product_params
      params.require(:product).permit(:name, :kind, :vendor_id, :default_retail_unit_price, :active)
    end

    def product_json(product)
      {
        id: product.id,
        name: product.name,
        kind: product.kind,
        vendor_id: product.vendor_id,
        vendor_name: product.vendor&.name,
        default_retail_unit_price: product.default_retail_unit_price,
        active: product.active,
        created_at: product.created_at,
        updated_at: product.updated_at
      }
    end
  end
end
