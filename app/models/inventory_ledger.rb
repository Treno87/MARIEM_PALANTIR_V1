# frozen_string_literal: true

class InventoryLedger
  def initialize(store)
    @store = store
  end

  def record_purchase(product:, qty:, occurred_at: Time.current)
    InventoryEvent.create!(
      store: @store,
      product: product,
      event_type: "purchase",
      qty_delta: qty,
      occurred_at: occurred_at
    )
  end

  def record_sale(product:, qty:, visit:, sale_line_item:, occurred_at: Time.current)
    InventoryEvent.create!(
      store: @store,
      product: product,
      event_type: "sale",
      qty_delta: -qty,
      occurred_at: occurred_at,
      visit: visit,
      sale_line_item: sale_line_item
    )
  end

  def record_consume(product:, qty:, visit: nil, memo: nil, occurred_at: Time.current)
    InventoryEvent.create!(
      store: @store,
      product: product,
      event_type: "consume",
      qty_delta: -qty,
      occurred_at: occurred_at,
      visit: visit,
      memo: memo
    )
  end

  def adjust(product:, qty_delta:, memo:, occurred_at: Time.current)
    InventoryEvent.create!(
      store: @store,
      product: product,
      event_type: "adjust",
      qty_delta: qty_delta,
      occurred_at: occurred_at,
      memo: memo
    )
  end

  def record_waste(product:, qty:, memo: nil, occurred_at: Time.current)
    InventoryEvent.create!(
      store: @store,
      product: product,
      event_type: "waste",
      qty_delta: -qty,
      occurred_at: occurred_at,
      memo: memo
    )
  end

  def current_stock(product)
    product.current_stock
  end

  def stock_summary
    @store.products.for_inventory.map do |product|
      {
        product: product,
        current_stock: current_stock(product),
        last_purchase_at: product.inventory_events.where(event_type: "purchase").maximum(:occurred_at)
      }
    end
  end

  def history_for(product, limit: 50)
    product.inventory_events
           .order(occurred_at: :desc)
           .limit(limit)
  end
end
