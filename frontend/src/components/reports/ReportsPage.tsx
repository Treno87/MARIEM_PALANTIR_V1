import type { ReactElement } from "react";
import { useSales } from "../../contexts/SaleContext";
import { useDailyReport, useMethodReport, useReportData, useStaffReport } from "../../hooks";
import { USE_API } from "../../lib/config";
import { getTodayDate } from "../../utils/date";
import { formatCurrency } from "../../utils/format";

type PeriodFilter = "today" | "week" | "month";

export default function ReportsPage(): ReactElement {
	const { sales } = useSales();

	// 리포트 데이터 훅
	const {
		periodFilter,
		setPeriodFilter,
		summary,
		staffSales,
		paymentMethodSales,
		topServices,
		customerTypes,
	} = useReportData(sales);

	// API 훅 사용 (오늘 날짜 기준)
	const todayDate = getTodayDate();
	const { data: apiDailyReport, isLoading: dailyLoading } = useDailyReport(todayDate);
	const { data: apiStaffReport } = useStaffReport(todayDate);
	const { data: apiMethodReport } = useMethodReport(todayDate);

	// API 로딩 상태
	const isApiLoading = USE_API && dailyLoading;

	// API 데이터 사용 (오늘 필터 + API 모드일 때만)
	const displaySummary =
		USE_API && periodFilter === "today" && apiDailyReport !== undefined
			? {
					totalAmount: apiDailyReport.total_sales,
					transactionCount: apiDailyReport.visit_count,
					avgPerTransaction:
						apiDailyReport.visit_count > 0
							? Math.round(apiDailyReport.total_sales / apiDailyReport.visit_count)
							: 0,
				}
			: summary;

	const displayStaffSales =
		USE_API && periodFilter === "today" && apiStaffReport !== undefined
			? apiStaffReport.staff_sales.map((staff) => ({
					name: staff.staff_name,
					color: "#6b7280",
					amount: staff.total_sales,
					count: staff.item_count,
				}))
			: staffSales;

	const displayPaymentMethodSales =
		USE_API && periodFilter === "today" && apiMethodReport !== undefined
			? apiMethodReport.method_sales.map((method) => ({
					method: method.method_label,
					amount: method.total_amount,
				}))
			: paymentMethodSales;

	const periodButtons: { key: PeriodFilter; label: string }[] = [
		{ key: "today", label: "오늘" },
		{ key: "week", label: "이번 주" },
		{ key: "month", label: "이번 달" },
	];

	return (
		<div className="flex h-full flex-col overflow-y-auto bg-neutral-50 p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold text-neutral-800">리포트</h1>
					{isApiLoading && (
						<span className="material-symbols-outlined animate-spin text-neutral-400">sync</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{periodButtons.map((btn) => (
						<button
							key={btn.key}
							onClick={() => {
								setPeriodFilter(btn.key);
							}}
							className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
								periodFilter === btn.key
									? "bg-neutral-800 text-white"
									: "bg-white text-neutral-600 hover:bg-neutral-100"
							}`}
						>
							{btn.label}
						</button>
					))}
				</div>
			</div>

			{/* Summary Cards */}
			<div className="mb-6 grid grid-cols-3 gap-4">
				<div className="rounded-xl border border-neutral-200 bg-white p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
							<span className="material-symbols-outlined text-green-600">payments</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">총 매출</p>
							<p className="text-2xl font-bold text-neutral-800">
								{formatCurrency(displaySummary.totalAmount)}
							</p>
						</div>
					</div>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
							<span className="material-symbols-outlined text-blue-600">receipt_long</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">거래 건수</p>
							<p className="text-2xl font-bold text-neutral-800">
								{displaySummary.transactionCount}건
							</p>
						</div>
					</div>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
							<span className="material-symbols-outlined text-purple-600">trending_up</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">평균 객단가</p>
							<p className="text-2xl font-bold text-neutral-800">
								{formatCurrency(displaySummary.avgPerTransaction)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Charts Row */}
			<div className="mb-6 grid grid-cols-2 gap-4">
				{/* 담당자별 매출 */}
				<div className="rounded-xl border border-neutral-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-bold text-neutral-800">담당자별 매출</h2>
					<div className="space-y-3">
						{displayStaffSales.length > 0 ? (
							displayStaffSales.map((staff) => (
								<div key={staff.name} className="flex items-center gap-3">
									<div
										className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
										style={{ backgroundColor: staff.color }}
									>
										{staff.name.charAt(0)}
									</div>
									<div className="flex-1">
										<div className="flex justify-between">
											<span className="font-medium text-neutral-800">{staff.name}</span>
											<span className="font-bold text-neutral-800">
												{formatCurrency(staff.amount)}
											</span>
										</div>
										<div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
											<div
												className="h-full rounded-full"
												style={{
													backgroundColor: staff.color,
													width: `${String((staff.amount / (displayStaffSales[0]?.amount ?? 1)) * 100)}%`,
												}}
											/>
										</div>
									</div>
								</div>
							))
						) : (
							<p className="text-center text-neutral-400">데이터가 없습니다</p>
						)}
					</div>
				</div>

				{/* 결제수단별 매출 */}
				<div className="rounded-xl border border-neutral-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-bold text-neutral-800">결제수단별 매출</h2>
					<div className="space-y-3">
						{displayPaymentMethodSales.length > 0 ? (
							displayPaymentMethodSales.map((payment) => (
								<div key={payment.method} className="flex items-center justify-between">
									<span className="text-neutral-600">{payment.method}</span>
									<span className="font-bold text-neutral-800">
										{formatCurrency(payment.amount)}
									</span>
								</div>
							))
						) : (
							<p className="text-center text-neutral-400">데이터가 없습니다</p>
						)}
					</div>
				</div>
			</div>

			{/* Bottom Row */}
			<div className="grid grid-cols-2 gap-4">
				{/* 인기 시술 TOP 5 */}
				<div className="rounded-xl border border-neutral-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-bold text-neutral-800">인기 시술 TOP 5</h2>
					<div className="space-y-3">
						{topServices.length > 0 ? (
							topServices.map((service, idx) => (
								<div key={service.name} className="flex items-center gap-3">
									<span
										className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
											idx === 0
												? "bg-yellow-100 text-yellow-700"
												: idx === 1
													? "bg-neutral-200 text-neutral-600"
													: idx === 2
														? "bg-orange-100 text-orange-700"
														: "bg-neutral-100 text-neutral-500"
										}`}
									>
										{idx + 1}
									</span>
									<div className="flex-1">
										<span className="font-medium text-neutral-800">{service.name}</span>
									</div>
									<span className="text-neutral-500">{service.count}건</span>
									<span className="font-bold text-neutral-800">
										{formatCurrency(service.amount)}
									</span>
								</div>
							))
						) : (
							<p className="text-center text-neutral-400">데이터가 없습니다</p>
						)}
					</div>
				</div>

				{/* 고객 유형 */}
				<div className="rounded-xl border border-neutral-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-bold text-neutral-800">고객 유형</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="h-3 w-3 rounded-full bg-green-500" />
								<span className="text-neutral-600">신규 고객</span>
							</div>
							<span className="font-bold text-neutral-800">
								{customerTypes.newCount}명 ({customerTypes.newPercent}%)
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="h-3 w-3 rounded-full bg-pink-500" />
								<span className="text-neutral-600">재방문 고객</span>
							</div>
							<span className="font-bold text-neutral-800">
								{customerTypes.returningCount}명 ({customerTypes.returningPercent}%)
							</span>
						</div>
						{/* Simple Bar */}
						<div className="mt-4 h-4 overflow-hidden rounded-full bg-neutral-100">
							<div className="flex h-full">
								<div
									className="bg-green-500"
									style={{ width: `${String(customerTypes.newPercent)}%` }}
								/>
								<div
									className="bg-pink-500"
									style={{
										width: `${String(customerTypes.returningPercent)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
