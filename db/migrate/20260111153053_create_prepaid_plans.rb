class CreatePrepaidPlans < ActiveRecord::Migration[8.1]
  def change
    create_table :prepaid_plans do |t|
      t.references :store, null: false, foreign_key: true
      t.string :name
      t.integer :price_paid
      t.integer :value_amount
      t.boolean :active

      t.timestamps
    end
  end
end
