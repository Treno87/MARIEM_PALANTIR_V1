# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users

  # Dashboard
  root "dashboard#index"

  # Customers
  resources :customers do
    member do
      post :start_transaction
    end
  end

  # Master data
  namespace :masters do
    resources :staff_members, except: [:show]
    resources :service_categories, except: [:show]
    resources :services, except: [:show]
    resources :vendors, except: [:show]
    resources :products, except: [:show]
    resources :prepaid_plans, except: [:show]
  end

  # Transactions
  namespace :transactions do
    resources :visits do
      member do
        post :finalize
      end
      resources :sale_line_items, only: [:create, :destroy]
      resources :payments, only: [:create, :destroy]
    end
  end

  # Prepaid
  namespace :prepaid do
    resources :sales, only: [:index, :new, :create, :show]
  end

  # Points
  namespace :points do
    resources :transactions, only: [:index, :create]
  end

  # Inventory
  namespace :inventory do
    resources :purchases do
      resources :items, controller: "purchase_items", only: [:create, :destroy]
    end
    resources :events, only: [:index, :create]
    get "stock", to: "stock#index"
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
