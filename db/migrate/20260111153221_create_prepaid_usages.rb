class CreatePrepaidUsages < ActiveRecord::Migration[8.1]
  def change
    create_table :prepaid_usages do |t|
      t.references :store, null: false, foreign_key: true
      t.references :customer, null: false, foreign_key: true
      t.references :prepaid_sale, null: false, foreign_key: true
      t.references :visit, foreign_key: true
      t.integer :amount_used, null: false
      t.references :applied_sale_line_item, foreign_key: { to_table: :sale_line_items }
      t.datetime :used_at, null: false

      t.timestamps
    end

    add_index :prepaid_usages, [:store_id, :customer_id]
  end
end
