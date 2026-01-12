class CreateStaffMembers < ActiveRecord::Migration[8.1]
  def change
    create_table :staff_members do |t|
      t.references :store, null: false, foreign_key: true
      t.string :name
      t.string :role_title
      t.string :phone
      t.boolean :active
      t.decimal :default_commission_rate

      t.timestamps
    end
  end
end
