class AddImportFieldsToVisits < ActiveRecord::Migration[8.1]
  def change
    add_column :visits, :external_hash, :string
    add_column :visits, :source, :string, default: "manual"
    add_index :visits, %i[store_id external_hash], unique: true,
              where: "external_hash IS NOT NULL",
              name: "index_visits_on_store_id_and_external_hash"
  end
end
