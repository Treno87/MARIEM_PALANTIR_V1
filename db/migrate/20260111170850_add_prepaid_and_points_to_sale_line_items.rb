class AddPrepaidAndPointsToSaleLineItems < ActiveRecord::Migration[8.1]
  def change
    add_column :sale_line_items, :prepaid_used, :integer, default: 0
    add_column :sale_line_items, :points_earned, :integer, default: 0
  end
end
