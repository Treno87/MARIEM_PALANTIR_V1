class AddVisitTypeToVisits < ActiveRecord::Migration[8.1]
  def change
    add_column :visits, :visit_type, :string
  end
end
