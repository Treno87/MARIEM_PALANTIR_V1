import { type ReactElement, useMemo, useState } from "react";
import { useSales } from "../../contexts/SaleContext";
import { formatCurrency } from "../../utils/format";

type PeriodFilter = "today" | "week" | "month";

export default function ReportsPage(): ReactElement {
	const { sales } = useSales();
	const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");

	// 기간에 따른 날짜 범위 계산
	const dateRange = useMemo(() => {
		const today = new Date();
		const endDate = today.toISOString().split("T")[0];
		let startDate: string;

		switch (periodFilter) {
			case "today":
				startDate = endDate;
				break;
			case "week": {
				const weekAgo = new Date(today);
				weekAgo.setDate(today.getDate() - 7);
				startDate = weekAgo.toISOString().split("T")[0];
				break;
			}
			case "month":
			default: {
				const monthAgo = new Date(today);
				monthAgo.setMonth(today.getMonth() - 1);
				startDate = monthAgo.toISOString().split("T")[0];
				break;
			}
		}

		return { startDate, endDate };
	}, [periodFilter]);

	// 기간 내 거래 필터링
	const filteredSales = useMemo(() => {
		return sales.filter(
			(sale) =>
				sale.saleDate >= dateRange.startDate &&
				sale.saleDate <= dateRange.endDate &&
				sale.status === "completed",
		);
	}, [sales, dateRange]);

	// 매출 요약 계산
	const summary = useMemo(() => {
		const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
		const transactionCount = filteredSales.length;
		const avgPerTransaction = transactionCount > 0 ? Math.round(totalAmount / transactionCount) : 0;

		return {
			totalAmount,
			transactionCount,
			avgPerTransaction,
		};
	}, [filteredSales]);

	// 담당자별 매출
	const staffSales = useMemo(() => {
		const staffMap = new Map<
			string,
			{ name: string; color: string; amount: number; count: number }
		>();

		for (const sale of filteredSales) {
			const existing = staffMap.get(sale.staff.id);
			if (existing) {
				existing.amount += sale.total;
				existing.count += 1;
			} else {
				staffMap.set(sale.staff.id, {
					name: sale.staff.name,
					color: sale.staff.color,
					amount: sale.total,
					count: 1,
				});
			}
		}

		return Array.from(staffMap.values()).sort((a, b) => b.amount - a.amount);
	}, [filteredSales]);

	// 결제수단별 매출
	const paymentMethodSales = useMemo(() => {
		const paymentMap = new Map<string, number>();

		for (const sale of filteredSales) {
			for (const payment of sale.payments) {
				const existing = paymentMap.get(payment.method) ?? 0;
				paymentMap.set(payment.method, existing + payment.amount);
			}
		}

		return Array.from(paymentMap.entries())
			.map(([method, amount]) => ({ method, amount }))
			.sort((a, b) => b.amount - a.amount);
	}, [filteredSales]);

	// 인기 시술 TOP 5
	const topServices = useMemo(() => {
		const serviceMap = new Map<string, { count: number; amount: number }>();

		for (const sale of filteredSales) {
			for (const item of sale.items) {
				if (item.type === "service") {
					const existing = serviceMap.get(item.name);
					if (existing) {
						existing.count += item.quantity;
						existing.amount += item.lineTotal;
					} else {
						serviceMap.set(item.name, {
							count: item.quantity,
							amount: item.lineTotal,
						});
					}
				}
			}
		}

		return Array.from(serviceMap.entries())
			.map(([name, data]) => ({ name, ...data }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	}, [filteredSales]);

	// 고객 유형 분석 (신규/재방문)
	const customerTypes = useMemo(() => {
		let newCount = 0;
		let returningCount = 0;

		for (const sale of filteredSales) {
			if (sale.customer.type === "new") {
				newCount += 1;
			} else {
				returningCount += 1;
			}
		}

		const total = newCount + returningCount;

		return {
			newCount,
			returningCount,
			newPercent: total > 0 ? Math.round((newCount / total) * 100) : 0,
			returningPercent: total > 0 ? Math.round((returningCount / total) * 100) : 0,
		};
	}, [filteredSales]);

	const periodButtons: { key: PeriodFilter; label: string }[] = [
		{ key: "today", label: "오늘" },
		{ key: "week", label: "이번 주" },
		{ key: "month", label: "이번 달" },
	];

	return (
		<div className="flex h-full flex-col overflow-y-auto bg-neutral-50 p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-neutral-800">리포트</h1>
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
								{formatCurrency(summary.totalAmount)}
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
							<p className="text-2xl font-bold text-neutral-800">{summary.transactionCount}건</p>
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
								{formatCurrency(summary.avgPerTransaction)}
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
						{staffSales.length > 0 ? (
							staffSales.map((staff) => (
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
													width: `${String((staff.amount / (staffSales[0]?.amount ?? 1)) * 100)}%`,
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
						{paymentMethodSales.length > 0 ? (
							paymentMethodSales.map((payment) => (
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
