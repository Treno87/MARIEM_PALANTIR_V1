import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { SaleRecord, SaleStatus } from "../components/sale/types";
import { sampleSales } from "../data/sampleSales";
import { useCustomers } from "./CustomerContext";

// 고객별 통계
export interface CustomerStats {
	totalSpent: number;
	visitCount: number;
	avgSpentPerVisit: number;
	lastVisitDate: string | null;
	firstVisitDate: string | null;
	preferredPaymentMethod: string | null;
	topServices: { name: string; count: number }[];
}

interface SaleContextType {
	sales: SaleRecord[];
	addSale: (sale: Omit<SaleRecord, "id" | "createdAt">) => void;
	updateSaleStatus: (saleId: string, status: SaleStatus) => void;
	getSalesByCustomerId: (customerId: string) => SaleRecord[];
	getSalesByDate: (date: string) => SaleRecord[];
	getSalesByDateRange: (startDate: string, endDate: string) => SaleRecord[];
	voidSale: (saleId: string) => void;
	getCustomerStats: (customerId: string) => CustomerStats;
}

const SaleContext = createContext<SaleContextType | null>(null);

// 공통 정렬 함수
const sortByDateDesc = (a: SaleRecord, b: SaleRecord): number =>
	new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime() ||
	new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function SaleProvider({ children }: { children: ReactNode }) {
	const [sales, setSales] = useState<SaleRecord[]>(sampleSales);
	const { updateCustomer } = useCustomers();

	const addSale = useCallback(
		(saleData: Omit<SaleRecord, "id" | "createdAt">): void => {
			const newSale: SaleRecord = {
				...saleData,
				id: `sale-${String(Date.now())}`,
				createdAt: new Date().toISOString(),
			};
			setSales((prev) => [newSale, ...prev]);

			// 고객 정보 자동 업데이트 (완료된 거래만)
			if (saleData.status === "completed" && saleData.customer.id) {
				updateCustomer(saleData.customer.id, {
					lastVisitDate: saleData.saleDate,
				});
			}
		},
		[updateCustomer],
	);

	const updateSaleStatus = useCallback((saleId: string, status: SaleStatus): void => {
		setSales((prev) => prev.map((sale) => (sale.id === saleId ? { ...sale, status } : sale)));
	}, []);

	const getSalesByCustomerId = useCallback(
		(customerId: string): SaleRecord[] => {
			return sales.filter((sale) => sale.customer.id === customerId).sort(sortByDateDesc);
		},
		[sales],
	);

	const getSalesByDate = useCallback(
		(date: string): SaleRecord[] => {
			return sales.filter((sale) => sale.saleDate === date).sort(sortByDateDesc);
		},
		[sales],
	);

	const getSalesByDateRange = useCallback(
		(startDate: string, endDate: string): SaleRecord[] => {
			return sales
				.filter((sale) => sale.saleDate >= startDate && sale.saleDate <= endDate)
				.sort(sortByDateDesc);
		},
		[sales],
	);

	const voidSale = useCallback((saleId: string): void => {
		setSales((prev) =>
			prev.map((sale) => (sale.id === saleId ? { ...sale, status: "voided" as const } : sale)),
		);
	}, []);

	const getCustomerStats = useCallback(
		(customerId: string): CustomerStats => {
			const customerSales = sales.filter(
				(sale) => sale.customer.id === customerId && sale.status === "completed",
			);

			if (customerSales.length === 0) {
				return {
					totalSpent: 0,
					visitCount: 0,
					avgSpentPerVisit: 0,
					lastVisitDate: null,
					firstVisitDate: null,
					preferredPaymentMethod: null,
					topServices: [],
				};
			}

			// 총 결제 금액
			const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);

			// 방문 횟수
			const visitCount = customerSales.length;

			// 평균 객단가
			const avgSpentPerVisit = Math.round(totalSpent / visitCount);

			// 마지막/첫 방문일
			const sortedByDate = [...customerSales].sort(sortByDateDesc);
			const lastVisitDate = sortedByDate[0]?.saleDate ?? null;
			const firstVisitDate = sortedByDate[sortedByDate.length - 1]?.saleDate ?? null;

			// 선호 결제 수단
			const paymentCounts: Record<string, number> = {};
			for (const sale of customerSales) {
				for (const payment of sale.payments) {
					paymentCounts[payment.method] = (paymentCounts[payment.method] ?? 0) + 1;
				}
			}
			const preferredPaymentMethod =
				Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

			// 주요 이용 서비스 (상위 5개)
			const serviceCounts: Record<string, number> = {};
			for (const sale of customerSales) {
				for (const item of sale.items) {
					if (item.type === "service") {
						serviceCounts[item.name] = (serviceCounts[item.name] ?? 0) + item.quantity;
					}
				}
			}
			const topServices = Object.entries(serviceCounts)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([name, count]) => ({ name, count }));

			return {
				totalSpent,
				visitCount,
				avgSpentPerVisit,
				lastVisitDate,
				firstVisitDate,
				preferredPaymentMethod,
				topServices,
			};
		},
		[sales],
	);

	const value = useMemo(
		() => ({
			sales,
			addSale,
			updateSaleStatus,
			getSalesByCustomerId,
			getSalesByDate,
			getSalesByDateRange,
			voidSale,
			getCustomerStats,
		}),
		[
			sales,
			addSale,
			updateSaleStatus,
			getSalesByCustomerId,
			getSalesByDate,
			getSalesByDateRange,
			voidSale,
			getCustomerStats,
		],
	);

	return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}

export function useSales() {
	const context = useContext(SaleContext);
	if (!context) {
		throw new Error("useSales must be used within a SaleProvider");
	}
	return context;
}
