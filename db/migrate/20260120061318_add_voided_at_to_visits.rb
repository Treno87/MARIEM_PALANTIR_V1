class AddVoidedAtToVisits < ActiveRecord::Migration[8.1]
  def change
    add_column :visits, :voided_at, :datetime
    add_index :visits, :voided_at
  end
end
