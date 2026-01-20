# frozen_string_literal: true

class ReportService
  def initialize(store)
    @store = store
  end

  def daily(date)
    visits = finalized_visits_for_date(date)
    line_items = visits.flat_map(&:sale_line_items)

    {
      date: date.to_s,
      total_sales: line_items.sum(&:net_total).to_i,
      visit_count: visits.count,
      total_payments: visits.flat_map(&:payments).sum(&:amount).to_i
    }
  end

  def monthly(year, month)
    start_date = Date.new(year, month, 1)
    end_date = start_date.end_of_month
    visits = finalized_visits_for_range(start_date, end_date)
    line_items = visits.flat_map(&:sale_line_items)

    {
      year: year,
      month: month,
      total_sales: line_items.sum(&:net_total).to_i,
      visit_count: visits.count,
      total_payments: visits.flat_map(&:payments).sum(&:amount).to_i
    }
  end

  def by_staff(date)
    visits = finalized_visits_for_date(date)
    line_items = visits.flat_map(&:sale_line_items)

    staff_sales = line_items.group_by(&:staff_id).map do |staff_id, items|
      staff = items.first.staff
      {
        staff_id: staff_id,
        staff_name: staff&.name || "미지정",
        total_sales: items.sum(&:net_total).to_i,
        item_count: items.count
      }
    end

    {
      date: date.to_s,
      staff_sales: staff_sales.sort_by { |s| -s[:total_sales] }
    }
  end

  def by_method(date)
    visits = finalized_visits_for_date(date)
    payments = visits.flat_map(&:payments)

    method_sales = payments.group_by(&:method).map do |method, pays|
      {
        method: method,
        method_label: Payment::METHOD_LABELS[method] || method,
        total_amount: pays.sum(&:amount).to_i,
        payment_count: pays.count
      }
    end

    {
      date: date.to_s,
      method_sales: method_sales.sort_by { |m| -m[:total_amount] }
    }
  end

  private

  def finalized_visits_for_date(date)
    @store.visits
          .for_report
          .where("DATE(visited_at) = ?", date)
          .includes(:sale_line_items, :payments)
  end

  def finalized_visits_for_range(start_date, end_date)
    @store.visits
          .for_report
          .where(visited_at: start_date.beginning_of_day..end_date.end_of_day)
          .includes(:sale_line_items, :payments)
  end
end
