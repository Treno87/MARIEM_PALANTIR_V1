# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users

  # API 네임스페이스
  namespace :api do
    # 인증 API
    post "auth/sign_in", to: "auth#sign_in"
    delete "auth/sign_out", to: "auth#sign_out"
    get "auth/me", to: "auth#me"

    # 기초 데이터 API
    resources :customers, only: [ :index, :show, :create, :update ]
    resources :staff_members, only: [ :index, :show ]
    resources :service_categories, only: [ :index, :create, :update ]
    resources :services, only: [ :index, :create, :update ]
    resources :products, only: [ :index, :create, :update ]

    # 거래 API
    resources :visits, only: [ :index, :show, :create ] do
      member do
        put :void
      end
    end

    # 리포트 API
    namespace :reports do
      get :daily
      get :monthly
      get :by_staff
      get :by_method
    end
  end

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
    resources :staff_members, except: [ :show ]
    resources :service_categories, except: [ :show ]
    resources :services, except: [ :show ]
    resources :vendors, except: [ :show ]
    resources :products, except: [ :show ]
    resources :prepaid_plans, except: [ :show ]
  end

  # Transactions
  namespace :transactions do
    resources :visits do
      member do
        post :finalize
      end
      resources :sale_line_items, only: [ :create, :destroy ]
      resources :payments, only: [ :create, :destroy ]
    end
  end

  # Prepaid
  namespace :prepaid do
    resources :sales, only: [ :index, :new, :create, :show ]
  end

  # Points
  namespace :points do
    resources :transactions, only: [ :index, :create ]
  end

  # Inventory
  namespace :inventory do
    resources :purchases do
      resources :items, controller: "purchase_items", only: [ :create, :destroy ]
    end
    resources :events, only: [ :index, :create ]
    get "stock", to: "stock#index"
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
