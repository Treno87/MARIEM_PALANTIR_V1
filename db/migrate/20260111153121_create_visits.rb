class CreateVisits < ActiveRecord::Migration[8.1]
  def change
    create_table :visits do |t|
      t.references :store, null: false, foreign_key: true
      t.references :customer, null: false, foreign_key: true
      t.datetime :visited_at
      t.integer :subtotal_amount
      t.integer :total_amount
      t.string :status

      t.timestamps
    end
  end
end
