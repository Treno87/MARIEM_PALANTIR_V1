class AddEventNameToSaleLineItems < ActiveRecord::Migration[8.1]
  def change
    add_column :sale_line_items, :event_name, :string
  end
end
