import { useMemo, useState } from "react";
import type { SaleRecord } from "../components/sale/types";

type PeriodFilter = "today" | "week" | "month";

interface DateRange {
	startDate: string;
	endDate: string;
}

interface Summary {
	totalAmount: number;
	transactionCount: number;
	avgPerTransaction: number;
}

interface StaffSale {
	name: string;
	color: string;
	amount: number;
	count: number;
}

interface PaymentMethodSale {
	method: string;
	amount: number;
}

interface TopService {
	name: string;
	count: number;
	amount: number;
}

interface CustomerTypes {
	newCount: number;
	returningCount: number;
	newPercent: number;
	returningPercent: number;
}

interface UseReportDataReturn {
	periodFilter: PeriodFilter;
	setPeriodFilter: (filter: PeriodFilter) => void;
	dateRange: DateRange;
	filteredSales: SaleRecord[];
	summary: Summary;
	staffSales: StaffSale[];
	paymentMethodSales: PaymentMethodSale[];
	topServices: TopService[];
	customerTypes: CustomerTypes;
}

export function useReportData(sales: SaleRecord[]): UseReportDataReturn {
	const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");

	const dateRange = useMemo((): DateRange => {
		const today = new Date();
		const endDateStr = today.toISOString().split("T")[0];
		const endDate = endDateStr ?? "";
		let startDate: string;

		switch (periodFilter) {
			case "today":
				startDate = endDate;
				break;
			case "week": {
				const weekAgo = new Date(today);
				weekAgo.setDate(today.getDate() - 7);
				const weekAgoStr = weekAgo.toISOString().split("T")[0];
				startDate = weekAgoStr ?? "";
				break;
			}
			case "month":
			default: {
				const monthAgo = new Date(today);
				monthAgo.setMonth(today.getMonth() - 1);
				const monthAgoStr = monthAgo.toISOString().split("T")[0];
				startDate = monthAgoStr ?? "";
				break;
			}
		}

		return { startDate, endDate };
	}, [periodFilter]);

	const filteredSales = useMemo(() => {
		return sales.filter(
			(sale) =>
				sale.saleDate >= dateRange.startDate &&
				sale.saleDate <= dateRange.endDate &&
				sale.status === "completed",
		);
	}, [sales, dateRange]);

	const summary = useMemo((): Summary => {
		const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
		const transactionCount = filteredSales.length;
		const avgPerTransaction = transactionCount > 0 ? Math.round(totalAmount / transactionCount) : 0;

		return {
			totalAmount,
			transactionCount,
			avgPerTransaction,
		};
	}, [filteredSales]);

	const staffSales = useMemo((): StaffSale[] => {
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

	const paymentMethodSales = useMemo((): PaymentMethodSale[] => {
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

	const topServices = useMemo((): TopService[] => {
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

	const customerTypes = useMemo((): CustomerTypes => {
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

	return {
		periodFilter,
		setPeriodFilter,
		dateRange,
		filteredSales,
		summary,
		staffSales,
		paymentMethodSales,
		topServices,
		customerTypes,
	};
}
