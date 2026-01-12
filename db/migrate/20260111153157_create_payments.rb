class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :store, null: false, foreign_key: true
      t.references :visit, null: false, foreign_key: true
      t.string :method
      t.integer :amount

      t.timestamps
    end
  end
end
