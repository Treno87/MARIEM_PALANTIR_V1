class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.references :store, null: false, foreign_key: true
      t.references :vendor, null: false, foreign_key: true
      t.string :name
      t.string :kind
      t.decimal :size_value
      t.string :size_unit
      t.integer :default_purchase_unit_price
      t.integer :default_retail_unit_price
      t.boolean :active

      t.timestamps
    end
  end
end
