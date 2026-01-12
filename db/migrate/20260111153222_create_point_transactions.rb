class CreatePointTransactions < ActiveRecord::Migration[8.1]
  def change
    create_table :point_transactions do |t|
      t.references :store, null: false, foreign_key: true
      t.references :customer, null: false, foreign_key: true
      t.string :txn_type, null: false
      t.integer :points_delta, null: false
      t.references :visit, foreign_key: true
      t.references :payment, foreign_key: true
      t.references :point_rule, foreign_key: true
      t.text :memo

      t.timestamps
    end

    add_index :point_transactions, [:store_id, :customer_id, :created_at], name: 'idx_point_txn_customer_time'
    add_index :point_transactions, [:store_id, :txn_type]
  end
end
