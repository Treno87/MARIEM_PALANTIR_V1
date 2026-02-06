class AddGenderToCustomers < ActiveRecord::Migration[8.1]
  def change
    add_column :customers, :gender, :string
  end
end
