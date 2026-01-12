class CreateServices < ActiveRecord::Migration[8.1]
  def change
    create_table :services do |t|
      t.references :store, null: false, foreign_key: true
      t.references :service_category, null: false, foreign_key: true
      t.string :name
      t.integer :list_price
      t.boolean :active

      t.timestamps
    end
  end
end
