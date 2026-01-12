class CreateVendors < ActiveRecord::Migration[8.1]
  def change
    create_table :vendors do |t|
      t.references :store, null: false, foreign_key: true
      t.string :name
      t.string :phone

      t.timestamps
    end
  end
end
