class CreateInventoryPurchases < ActiveRecord::Migration[8.1]
  def change
    create_table :inventory_purchases do |t|
      t.references :store, null: false, foreign_key: true
      t.references :vendor, null: false, foreign_key: true
      t.datetime :purchased_at

      t.timestamps
    end
  end
end
