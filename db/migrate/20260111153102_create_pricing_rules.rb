class CreatePricingRules < ActiveRecord::Migration[8.1]
  def change
    create_table :pricing_rules do |t|
      t.references :store, null: false, foreign_key: true
      t.string :name
      t.string :rule_type
      t.decimal :value
      t.string :applies_to
      t.integer :target_id
      t.datetime :starts_at
      t.datetime :ends_at

      t.timestamps
    end
  end
end
