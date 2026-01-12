class CreatePrepaidSales < ActiveRecord::Migration[8.1]
  def change
    create_table :prepaid_sales do |t|
      t.references :store, null: false, foreign_key: true
      t.references :customer, null: false, foreign_key: true
      t.references :prepaid_plan, null: false, foreign_key: true
      t.integer :amount_paid, null: false
      t.integer :value_amount, null: false
      t.references :seller_staff, foreign_key: { to_table: :staff_members }
      t.datetime :sold_at, null: false

      t.timestamps
    end

    add_index :prepaid_sales, [:store_id, :customer_id]
  end
end
