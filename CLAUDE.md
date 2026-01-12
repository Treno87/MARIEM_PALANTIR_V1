# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mariem Palantir - 미용실 거래 입력 MVP (Hair Salon Transaction Input MVP)

Ruby on Rails + PostgreSQL application for recording salon transactions with a consistent ledger structure.

## Tech Stack

- Ruby on Rails 7.x
- PostgreSQL
- Devise (authentication)
- Tailwind CSS (styling)
- Pagy (pagination)

## Key Principles

- List prices stored in master data (services, products)
- Discounts managed via pricing rules
- Transaction snapshots: list_price, discount, net_price frozen at transaction time
- Prepaid vouchers and points use separate ledger patterns
- Inventory uses master items + event ledger (not running totals)

## Build Commands

```bash
# Setup
bundle install
rails db:create db:migrate db:seed

# Development server
rails server

# Console
rails console

# Run all tests
bundle exec rspec

# Run single test file
bundle exec rspec spec/models/visit_spec.rb

# Run specific test
bundle exec rspec spec/models/visit_spec.rb:42
```

## Architecture

### Database Schema (18 tables)

**Foundation**: stores, users (Devise)

**Master Data**:
- staff_members, service_categories, services, vendors, products, prepaid_plans

**Transactions**:
- customers, visits (draft → finalized), sale_line_items, payments

**Ledgers**:
- prepaid_sales, prepaid_usages (voucher ledger)
- point_transactions (point ledger)
- inventory_events (inventory ledger)

**Rules**: pricing_rules, point_rules

### Service Objects (app/models/services/)

| Service | Purpose |
|---------|---------|
| `PricingCalculator` | Apply pricing rules, calculate discounts, snapshot prices |
| `PrepaidLedger` | Sell/use prepaid vouchers, FIFO consumption |
| `PointLedger` | Earn on finalize, redeem on payment |
| `InventoryLedger` | Record purchase/sale/consume/waste events |

### Multi-tenancy

All tables include `store_id`. Use `StoreScoped` concern for automatic scoping.

```ruby
class Service < ApplicationRecord
  include StoreScoped  # adds belongs_to :store, scope :for_store
end
```

### Transaction Flow

1. Create Visit (status: draft)
2. Add SaleLineItems (auto-applies PricingCalculator)
3. Add Payments (handles prepaid/points via ledgers)
4. Finalize Visit → triggers point earning

## Scope Boundaries

**In Scope (MVP)**:
- Master data CRUD (services, products, staff, prepaid plans)
- Visit-based transaction input
- Sale lines (services + products unified)
- Multi-payment support (card, cash, prepaid, points)
- Prepaid voucher ledger
- Point ledger
- Inventory event ledger

**Out of Scope**:
- Net profit calculation
- Payroll/commission calculation
- Inventory cost valuation (FIFO/average)
- KPI dashboards
- Auto marketing/messaging
