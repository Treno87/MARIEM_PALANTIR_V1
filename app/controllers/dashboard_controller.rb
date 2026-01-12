# frozen_string_literal: true

class DashboardController < ApplicationController
  def index
    @recent_visits = current_store.visits.includes(:customer).order(visited_at: :desc).limit(10)
    @today_visits_count = current_store.visits.where(visited_at: Date.current.all_day).count
    @today_revenue = current_store.visits.finalized.where(visited_at: Date.current.all_day).sum(:total_amount)
  end
end
