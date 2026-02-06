# frozen_string_literal: true

class AddStoreToInventoryPurchaseItems < ActiveRecord::Migration[8.1]
  def up
    add_reference :inventory_purchase_items, :store, null: true, foreign_key: true

    # 기존 데이터: inventory_purchase의 store_id를 복사
    execute <<~SQL
      UPDATE inventory_purchase_items
      SET store_id = inventory_purchases.store_id
      FROM inventory_purchases
      WHERE inventory_purchase_items.inventory_purchase_id = inventory_purchases.id
    SQL

    change_column_null :inventory_purchase_items, :store_id, false
  end

  def down
    remove_reference :inventory_purchase_items, :store
  end
end
