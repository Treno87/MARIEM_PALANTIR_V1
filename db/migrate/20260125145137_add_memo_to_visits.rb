class AddMemoToVisits < ActiveRecord::Migration[8.1]
  def change
    add_column :visits, :memo, :text
  end
end
