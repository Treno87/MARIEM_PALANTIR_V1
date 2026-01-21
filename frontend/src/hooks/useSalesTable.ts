import { useMemo, useState } from "react";
import type { SaleRecord } from "../components/sale/types";
import { getMonthStartDate, getTodayDate } from "../utils/date";

export type SalesSortKey = "date" | "customer" | "staff" | "total" | "status";
export type SortDirection = "asc" | "desc";
export type PeriodFilter = "today" | "week" | "month" | null;

interface Summary {
	totalAmount: number;
	transactionCount: number;
	voidedCount: number;
}

interface UseSalesTableReturn {
	startDate: string;
	endDate: string;
	periodFilter: PeriodFilter;
	sortKey: SalesSortKey;
	sortDirection: SortDirection;
	sortedSales: SaleRecord[];
	summary: Summary;
	handleSort: (key: SalesSortKey) => void;
	handlePeriodFilter: (period: PeriodFilter) => void;
	handleStartDateChange: (value: string) => void;
	handleEndDateChange: (value: string) => void;
	getSortIcon: (key: SalesSortKey) => string;
}

export function useSalesTable(sales: SaleRecord[]): UseSalesTableReturn {
	const [startDate, setStartDate] = useState<string>(getMonthStartDate());
	const [endDate, setEndDate] = useState<string>(getTodayDate());
	const [sortKey, setSortKey] = useState<SalesSortKey>("date");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");

	const filteredSales = useMemo(() => {
		return sales.filter((sale) => sale.saleDate >= startDate && sale.saleDate <= endDate);
	}, [sales, startDate, endDate]);

	const sortedSales = useMemo(() => {
		return [...filteredSales].sort((a, b) => {
			let comparison = 0;
			switch (sortKey) {
				case "date":
					comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
				case "customer":
					comparison = a.customer.name.localeCompare(b.customer.name, "ko");
					break;
				case "staff":
					comparison = a.staff.name.localeCompare(b.staff.name, "ko");
					break;
				case "total":
					comparison = a.total - b.total;
					break;
				case "status":
					comparison = a.status.localeCompare(b.status);
					break;
			}
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filteredSales, sortKey, sortDirection]);

	const summary = useMemo((): Summary => {
		const completedSales = filteredSales.filter((s) => s.status === "completed");
		const voidedSales = filteredSales.filter((s) => s.status === "voided");

		return {
			totalAmount: completedSales.reduce((sum, s) => sum + s.total, 0),
			transactionCount: filteredSales.length,
			voidedCount: voidedSales.length,
		};
	}, [filteredSales]);

	const handleSort = (key: SalesSortKey): void => {
		if (sortKey === key) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDirection("asc");
		}
	};

	const handlePeriodFilter = (period: PeriodFilter): void => {
		if (period === null) return;
		setPeriodFilter(period);
		const today = new Date();
		const todayStr = today.toISOString().split("T")[0] ?? "";

		switch (period) {
			case "today":
				setStartDate(todayStr);
				setEndDate(todayStr);
				break;
			case "week": {
				const weekStart = new Date(today);
				weekStart.setDate(today.getDate() - today.getDay());
				const weekStartStr = weekStart.toISOString().split("T")[0] ?? "";
				setStartDate(weekStartStr);
				setEndDate(todayStr);
				break;
			}
			case "month": {
				const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
				const monthStartStr = monthStart.toISOString().split("T")[0] ?? "";
				setStartDate(monthStartStr);
				setEndDate(todayStr);
				break;
			}
		}
	};

	const handleStartDateChange = (value: string): void => {
		setStartDate(value);
		setPeriodFilter(null);
	};

	const handleEndDateChange = (value: string): void => {
		setEndDate(value);
		setPeriodFilter(null);
	};

	const getSortIcon = (key: SalesSortKey): string => {
		if (sortKey !== key) return "unfold_more";
		return sortDirection === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
	};

	return {
		startDate,
		endDate,
		periodFilter,
		sortKey,
		sortDirection,
		sortedSales,
		summary,
		handleSort,
		handlePeriodFilter,
		handleStartDateChange,
		handleEndDateChange,
		getSortIcon,
	};
}
