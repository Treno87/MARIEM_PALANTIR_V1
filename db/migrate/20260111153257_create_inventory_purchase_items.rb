class CreateInventoryPurchaseItems < ActiveRecord::Migration[8.1]
  def change
    create_table :inventory_purchase_items do |t|
      t.references :inventory_purchase, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :qty
      t.integer :unit_cost

      t.timestamps
    end
  end
end
