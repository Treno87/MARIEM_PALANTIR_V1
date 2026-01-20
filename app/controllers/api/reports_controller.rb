# frozen_string_literal: true

module Api
  class ReportsController < BaseController
    def daily
      date = params[:date].present? ? Date.parse(params[:date]) : Date.current
      report = ReportService.new(current_store).daily(date)

      render_success({ report: report })
    end

    def monthly
      year = params[:year]&.to_i || Date.current.year
      month = params[:month]&.to_i || Date.current.month
      report = ReportService.new(current_store).monthly(year, month)

      render_success({ report: report })
    end

    def by_staff
      date = params[:date].present? ? Date.parse(params[:date]) : Date.current
      report = ReportService.new(current_store).by_staff(date)

      render_success({ report: report })
    end

    def by_method
      date = params[:date].present? ? Date.parse(params[:date]) : Date.current
      report = ReportService.new(current_store).by_method(date)

      render_success({ report: report })
    end
  end
end
