class CreateInventoryEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :inventory_events do |t|
      t.references :store, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.string :event_type, null: false
      t.integer :qty_delta, null: false
      t.datetime :occurred_at, null: false
      t.references :visit, foreign_key: true
      t.references :sale_line_item, foreign_key: true
      t.text :memo

      t.timestamps
    end

    add_index :inventory_events, [:store_id, :product_id, :occurred_at], name: 'idx_inv_event_product_time'
    add_index :inventory_events, [:store_id, :event_type]
  end
end
