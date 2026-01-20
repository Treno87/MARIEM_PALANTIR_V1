# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_20_061318) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "customers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "memo"
    t.string "name"
    t.string "phone"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.index ["store_id"], name: "index_customers_on_store_id"
  end

  create_table "inventory_events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "event_type", null: false
    t.text "memo"
    t.datetime "occurred_at", null: false
    t.bigint "product_id", null: false
    t.integer "qty_delta", null: false
    t.bigint "sale_line_item_id"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "visit_id"
    t.index ["product_id"], name: "index_inventory_events_on_product_id"
    t.index ["sale_line_item_id"], name: "index_inventory_events_on_sale_line_item_id"
    t.index ["store_id", "event_type"], name: "index_inventory_events_on_store_id_and_event_type"
    t.index ["store_id", "product_id", "occurred_at"], name: "idx_inv_event_product_time"
    t.index ["store_id"], name: "index_inventory_events_on_store_id"
    t.index ["visit_id"], name: "index_inventory_events_on_visit_id"
  end

  create_table "inventory_purchase_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "inventory_purchase_id", null: false
    t.bigint "product_id", null: false
    t.integer "qty"
    t.integer "unit_cost"
    t.datetime "updated_at", null: false
    t.index ["inventory_purchase_id"], name: "index_inventory_purchase_items_on_inventory_purchase_id"
    t.index ["product_id"], name: "index_inventory_purchase_items_on_product_id"
  end

  create_table "inventory_purchases", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "purchased_at"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "vendor_id", null: false
    t.index ["store_id"], name: "index_inventory_purchases_on_store_id"
    t.index ["vendor_id"], name: "index_inventory_purchases_on_vendor_id"
  end

  create_table "payments", force: :cascade do |t|
    t.integer "amount"
    t.datetime "created_at", null: false
    t.string "method"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "visit_id", null: false
    t.index ["store_id"], name: "index_payments_on_store_id"
    t.index ["visit_id"], name: "index_payments_on_visit_id"
  end

  create_table "point_rules", force: :cascade do |t|
    t.string "applies_to"
    t.datetime "created_at", null: false
    t.datetime "ends_at"
    t.string "name"
    t.string "rule_type"
    t.datetime "starts_at"
    t.bigint "store_id", null: false
    t.integer "target_id"
    t.datetime "updated_at", null: false
    t.decimal "value"
    t.index ["store_id"], name: "index_point_rules_on_store_id"
  end

  create_table "point_transactions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "customer_id", null: false
    t.text "memo"
    t.bigint "payment_id"
    t.bigint "point_rule_id"
    t.integer "points_delta", null: false
    t.bigint "store_id", null: false
    t.string "txn_type", null: false
    t.datetime "updated_at", null: false
    t.bigint "visit_id"
    t.index ["customer_id"], name: "index_point_transactions_on_customer_id"
    t.index ["payment_id"], name: "index_point_transactions_on_payment_id"
    t.index ["point_rule_id"], name: "index_point_transactions_on_point_rule_id"
    t.index ["store_id", "customer_id", "created_at"], name: "idx_point_txn_customer_time"
    t.index ["store_id", "txn_type"], name: "index_point_transactions_on_store_id_and_txn_type"
    t.index ["store_id"], name: "index_point_transactions_on_store_id"
    t.index ["visit_id"], name: "index_point_transactions_on_visit_id"
  end

  create_table "prepaid_plans", force: :cascade do |t|
    t.boolean "active"
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "price_paid"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.integer "value_amount"
    t.index ["store_id"], name: "index_prepaid_plans_on_store_id"
  end

  create_table "prepaid_sales", force: :cascade do |t|
    t.integer "amount_paid", null: false
    t.datetime "created_at", null: false
    t.bigint "customer_id", null: false
    t.bigint "prepaid_plan_id", null: false
    t.bigint "seller_staff_id"
    t.datetime "sold_at", null: false
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.integer "value_amount", null: false
    t.index ["customer_id"], name: "index_prepaid_sales_on_customer_id"
    t.index ["prepaid_plan_id"], name: "index_prepaid_sales_on_prepaid_plan_id"
    t.index ["seller_staff_id"], name: "index_prepaid_sales_on_seller_staff_id"
    t.index ["store_id", "customer_id"], name: "index_prepaid_sales_on_store_id_and_customer_id"
    t.index ["store_id"], name: "index_prepaid_sales_on_store_id"
  end

  create_table "prepaid_usages", force: :cascade do |t|
    t.integer "amount_used", null: false
    t.bigint "applied_sale_line_item_id"
    t.datetime "created_at", null: false
    t.bigint "customer_id", null: false
    t.bigint "prepaid_sale_id", null: false
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.datetime "used_at", null: false
    t.bigint "visit_id"
    t.index ["applied_sale_line_item_id"], name: "index_prepaid_usages_on_applied_sale_line_item_id"
    t.index ["customer_id"], name: "index_prepaid_usages_on_customer_id"
    t.index ["prepaid_sale_id"], name: "index_prepaid_usages_on_prepaid_sale_id"
    t.index ["store_id", "customer_id"], name: "index_prepaid_usages_on_store_id_and_customer_id"
    t.index ["store_id"], name: "index_prepaid_usages_on_store_id"
    t.index ["visit_id"], name: "index_prepaid_usages_on_visit_id"
  end

  create_table "pricing_rules", force: :cascade do |t|
    t.string "applies_to"
    t.datetime "created_at", null: false
    t.datetime "ends_at"
    t.string "name"
    t.string "rule_type"
    t.datetime "starts_at"
    t.bigint "store_id", null: false
    t.integer "target_id"
    t.datetime "updated_at", null: false
    t.decimal "value"
    t.index ["store_id"], name: "index_pricing_rules_on_store_id"
  end

  create_table "products", force: :cascade do |t|
    t.boolean "active"
    t.datetime "created_at", null: false
    t.integer "default_purchase_unit_price"
    t.integer "default_retail_unit_price"
    t.string "kind"
    t.string "name"
    t.string "size_unit"
    t.decimal "size_value"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "vendor_id", null: false
    t.index ["store_id"], name: "index_products_on_store_id"
    t.index ["vendor_id"], name: "index_products_on_vendor_id"
  end

  create_table "sale_line_items", force: :cascade do |t|
    t.bigint "applied_pricing_rule_id"
    t.datetime "created_at", null: false
    t.integer "discount_amount", default: 0
    t.decimal "discount_rate", precision: 5, scale: 2, default: "0.0"
    t.string "item_type", null: false
    t.integer "list_unit_price", null: false
    t.integer "net_total", null: false
    t.integer "net_unit_price", null: false
    t.integer "points_earned", default: 0
    t.integer "prepaid_used", default: 0
    t.bigint "product_id"
    t.integer "qty", default: 1, null: false
    t.bigint "service_id"
    t.bigint "staff_id"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "visit_id", null: false
    t.index ["applied_pricing_rule_id"], name: "index_sale_line_items_on_applied_pricing_rule_id"
    t.index ["product_id"], name: "index_sale_line_items_on_product_id"
    t.index ["service_id"], name: "index_sale_line_items_on_service_id"
    t.index ["staff_id"], name: "index_sale_line_items_on_staff_id"
    t.index ["store_id"], name: "index_sale_line_items_on_store_id"
    t.index ["visit_id", "item_type"], name: "index_sale_line_items_on_visit_id_and_item_type"
    t.index ["visit_id"], name: "index_sale_line_items_on_visit_id"
  end

  create_table "service_categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.index ["store_id"], name: "index_service_categories_on_store_id"
  end

  create_table "services", force: :cascade do |t|
    t.boolean "active"
    t.datetime "created_at", null: false
    t.integer "list_price"
    t.string "name"
    t.bigint "service_category_id", null: false
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.index ["service_category_id"], name: "index_services_on_service_category_id"
    t.index ["store_id"], name: "index_services_on_store_id"
  end

  create_table "staff_members", force: :cascade do |t|
    t.boolean "active"
    t.datetime "created_at", null: false
    t.decimal "default_commission_rate"
    t.string "name"
    t.string "phone"
    t.string "role_title"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.index ["store_id"], name: "index_staff_members_on_store_id"
  end

  create_table "stores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role", default: "STYLIST", null: false
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["store_id", "email"], name: "index_users_on_store_id_and_email", unique: true
    t.index ["store_id"], name: "index_users_on_store_id"
  end

  create_table "vendors", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.string "phone"
    t.bigint "store_id", null: false
    t.datetime "updated_at", null: false
    t.index ["store_id"], name: "index_vendors_on_store_id"
  end

  create_table "visits", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "customer_id", null: false
    t.string "status"
    t.bigint "store_id", null: false
    t.integer "subtotal_amount"
    t.integer "total_amount"
    t.datetime "updated_at", null: false
    t.datetime "visited_at"
    t.datetime "voided_at"
    t.index ["customer_id"], name: "index_visits_on_customer_id"
    t.index ["store_id"], name: "index_visits_on_store_id"
  end

  add_foreign_key "customers", "stores"
  add_foreign_key "inventory_events", "products"
  add_foreign_key "inventory_events", "sale_line_items"
  add_foreign_key "inventory_events", "stores"
  add_foreign_key "inventory_events", "visits"
  add_foreign_key "inventory_purchase_items", "inventory_purchases"
  add_foreign_key "inventory_purchase_items", "products"
  add_foreign_key "inventory_purchases", "stores"
  add_foreign_key "inventory_purchases", "vendors"
  add_foreign_key "payments", "stores"
  add_foreign_key "payments", "visits"
  add_foreign_key "point_rules", "stores"
  add_foreign_key "point_transactions", "customers"
  add_foreign_key "point_transactions", "payments"
  add_foreign_key "point_transactions", "point_rules"
  add_foreign_key "point_transactions", "stores"
  add_foreign_key "point_transactions", "visits"
  add_foreign_key "prepaid_plans", "stores"
  add_foreign_key "prepaid_sales", "customers"
  add_foreign_key "prepaid_sales", "prepaid_plans"
  add_foreign_key "prepaid_sales", "staff_members", column: "seller_staff_id"
  add_foreign_key "prepaid_sales", "stores"
  add_foreign_key "prepaid_usages", "customers"
  add_foreign_key "prepaid_usages", "prepaid_sales"
  add_foreign_key "prepaid_usages", "sale_line_items", column: "applied_sale_line_item_id"
  add_foreign_key "prepaid_usages", "stores"
  add_foreign_key "prepaid_usages", "visits"
  add_foreign_key "pricing_rules", "stores"
  add_foreign_key "products", "stores"
  add_foreign_key "products", "vendors"
  add_foreign_key "sale_line_items", "pricing_rules", column: "applied_pricing_rule_id"
  add_foreign_key "sale_line_items", "products"
  add_foreign_key "sale_line_items", "services"
  add_foreign_key "sale_line_items", "staff_members", column: "staff_id"
  add_foreign_key "sale_line_items", "stores"
  add_foreign_key "sale_line_items", "visits"
  add_foreign_key "service_categories", "stores"
  add_foreign_key "services", "service_categories"
  add_foreign_key "services", "stores"
  add_foreign_key "staff_members", "stores"
  add_foreign_key "users", "stores"
  add_foreign_key "vendors", "stores"
  add_foreign_key "visits", "customers"
  add_foreign_key "visits", "stores"
end
