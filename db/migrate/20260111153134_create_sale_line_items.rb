class CreateSaleLineItems < ActiveRecord::Migration[8.1]
  def change
    create_table :sale_line_items do |t|
      t.references :store, null: false, foreign_key: true
      t.references :visit, null: false, foreign_key: true
      t.string :item_type, null: false
      t.references :service, foreign_key: true
      t.references :product, foreign_key: true
      t.references :staff, foreign_key: { to_table: :staff_members }
      t.integer :qty, null: false, default: 1
      t.integer :list_unit_price, null: false
      t.decimal :discount_rate, precision: 5, scale: 2, default: 0
      t.integer :discount_amount, default: 0
      t.integer :net_unit_price, null: false
      t.integer :net_total, null: false
      t.references :applied_pricing_rule, foreign_key: { to_table: :pricing_rules }

      t.timestamps
    end

    add_index :sale_line_items, [:visit_id, :item_type]
  end
end
