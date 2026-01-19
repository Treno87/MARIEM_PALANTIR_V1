import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { SaleRecord, SaleStatus } from "../components/sale/types";
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

// Mock 거래 데이터 (고객 ID와 연결)
const initialSales: SaleRecord[] = [
	// 김민지 (id: 1) - VIP 후보, 12회 방문
	{
		id: "sale-001",
		saleDate: "2025-01-10",
		customer: {
			id: "1",
			name: "김민지",
			phone: "010-1234-5678",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "디지털펌",
				quantity: 1,
				unitPrice: 130000,
				lineTotal: 130000,
				type: "service",
			},
		],
		subtotal: 130000,
		discountAmount: 10000,
		total: 120000,
		payments: [{ method: "카드", amount: 120000 }],
		status: "completed",
		createdAt: "2025-01-10T14:30:00",
	},
	{
		id: "sale-002",
		saleDate: "2024-12-15",
		customer: {
			id: "1",
			name: "김민지",
			phone: "010-1234-5678",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "전체염색",
				quantity: 1,
				unitPrice: 80000,
				lineTotal: 80000,
				type: "service",
			},
		],
		subtotal: 80000,
		discountAmount: 0,
		total: 80000,
		payments: [{ method: "정액권", amount: 80000 }],
		status: "completed",
		createdAt: "2024-12-15T11:00:00",
	},
	{
		id: "sale-003",
		saleDate: "2024-11-20",
		customer: {
			id: "1",
			name: "김민지",
			phone: "010-1234-5678",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "여자커트",
				quantity: 1,
				unitPrice: 30000,
				lineTotal: 30000,
				type: "service",
			},
		],
		subtotal: 30000,
		discountAmount: 0,
		total: 30000,
		payments: [{ method: "현금", amount: 30000 }],
		status: "completed",
		createdAt: "2024-11-20T16:00:00",
	},
	// 이서연 (id: 2) - Silver, 8회 방문
	{
		id: "sale-004",
		saleDate: "2025-01-05",
		customer: {
			id: "2",
			name: "이서연",
			phone: "010-2345-6789",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "여자커트",
				quantity: 1,
				unitPrice: 30000,
				lineTotal: 30000,
				type: "service",
			},
			{
				name: "클리닉",
				quantity: 1,
				unitPrice: 50000,
				lineTotal: 50000,
				type: "service",
			},
		],
		subtotal: 80000,
		discountAmount: 0,
		total: 80000,
		payments: [{ method: "카드", amount: 80000 }],
		status: "completed",
		createdAt: "2025-01-05T10:30:00",
	},
	{
		id: "sale-005",
		saleDate: "2024-11-28",
		customer: {
			id: "2",
			name: "이서연",
			phone: "010-2345-6789",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "디지털펌",
				quantity: 1,
				unitPrice: 130000,
				lineTotal: 130000,
				type: "service",
			},
		],
		subtotal: 130000,
		discountAmount: 0,
		total: 130000,
		payments: [{ method: "카드", amount: 130000 }],
		status: "completed",
		createdAt: "2024-11-28T15:00:00",
	},
	// 한소희 (id: 6) - VIP, 15회 방문
	{
		id: "sale-006",
		saleDate: "2025-01-12",
		customer: {
			id: "6",
			name: "한소희",
			phone: "010-6789-0123",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "전체염색",
				quantity: 1,
				unitPrice: 80000,
				lineTotal: 80000,
				type: "service",
			},
			{
				name: "클리닉",
				quantity: 1,
				unitPrice: 50000,
				lineTotal: 50000,
				type: "service",
			},
			{
				name: "뉴트리티브 샴푸",
				quantity: 1,
				unitPrice: 42000,
				lineTotal: 42000,
				type: "product",
			},
		],
		subtotal: 172000,
		discountAmount: 17200,
		total: 154800,
		payments: [{ method: "카드", amount: 154800 }],
		status: "completed",
		createdAt: "2025-01-12T13:00:00",
	},
	{
		id: "sale-007",
		saleDate: "2024-12-20",
		customer: {
			id: "6",
			name: "한소희",
			phone: "010-6789-0123",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "디지털펌",
				quantity: 1,
				unitPrice: 130000,
				lineTotal: 130000,
				type: "service",
			},
		],
		subtotal: 130000,
		discountAmount: 0,
		total: 130000,
		payments: [{ method: "정액권", amount: 130000 }],
		status: "completed",
		createdAt: "2024-12-20T11:30:00",
	},
	// 송지효 (id: 9) - VIP, 28회 방문
	{
		id: "sale-008",
		saleDate: "2025-01-14",
		customer: {
			id: "9",
			name: "송지효",
			phone: "010-9012-3456",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "여자커트",
				quantity: 1,
				unitPrice: 30000,
				lineTotal: 30000,
				type: "service",
			},
			{
				name: "스타일링",
				quantity: 1,
				unitPrice: 20000,
				lineTotal: 20000,
				type: "service",
			},
		],
		subtotal: 50000,
		discountAmount: 5000,
		total: 45000,
		payments: [{ method: "정기권", amount: 45000 }],
		status: "completed",
		note: "프리미엄 회원권 사용",
		createdAt: "2025-01-14T10:00:00",
	},
	{
		id: "sale-009",
		saleDate: "2024-12-28",
		customer: {
			id: "9",
			name: "송지효",
			phone: "010-9012-3456",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "매직",
				quantity: 1,
				unitPrice: 200000,
				lineTotal: 200000,
				type: "service",
			},
			{
				name: "클리닉",
				quantity: 1,
				unitPrice: 50000,
				lineTotal: 50000,
				type: "service",
			},
		],
		subtotal: 250000,
		discountAmount: 25000,
		total: 225000,
		payments: [{ method: "카드", amount: 225000 }],
		status: "completed",
		createdAt: "2024-12-28T14:00:00",
	},
	// 유재석 (id: 10) - VIP, 35회 방문
	{
		id: "sale-010",
		saleDate: "2025-01-16",
		customer: {
			id: "10",
			name: "유재석",
			phone: "010-0123-4567",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "남자커트",
				quantity: 1,
				unitPrice: 25000,
				lineTotal: 25000,
				type: "service",
			},
		],
		subtotal: 25000,
		discountAmount: 0,
		total: 25000,
		payments: [{ method: "정액권", amount: 25000 }],
		status: "completed",
		createdAt: "2025-01-16T17:00:00",
	},
	{
		id: "sale-011",
		saleDate: "2025-01-02",
		customer: {
			id: "10",
			name: "유재석",
			phone: "010-0123-4567",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "남자커트",
				quantity: 1,
				unitPrice: 25000,
				lineTotal: 25000,
				type: "service",
			},
			{
				name: "두피케어",
				quantity: 1,
				unitPrice: 40000,
				lineTotal: 40000,
				type: "service",
			},
		],
		subtotal: 65000,
		discountAmount: 0,
		total: 65000,
		payments: [{ method: "카드", amount: 65000 }],
		status: "completed",
		createdAt: "2025-01-02T11:00:00",
	},
	// 아이유 (id: 14) - Gold, 14회 방문
	{
		id: "sale-012",
		saleDate: "2025-01-13",
		customer: {
			id: "14",
			name: "아이유",
			phone: "010-4444-5555",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "전체염색",
				quantity: 1,
				unitPrice: 80000,
				lineTotal: 80000,
				type: "service",
			},
			{
				name: "여자커트",
				quantity: 1,
				unitPrice: 30000,
				lineTotal: 30000,
				type: "service",
			},
		],
		subtotal: 110000,
		discountAmount: 0,
		total: 110000,
		payments: [{ method: "정기권", amount: 110000 }],
		status: "completed",
		note: "스타일링 정기권 사용",
		createdAt: "2025-01-13T15:30:00",
	},
	// 전지현 (id: 16) - VIP, 20회 방문
	{
		id: "sale-013",
		saleDate: "2025-01-11",
		customer: {
			id: "16",
			name: "전지현",
			phone: "010-6666-7777",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "디지털펌",
				quantity: 1,
				unitPrice: 130000,
				lineTotal: 130000,
				type: "service",
			},
			{
				name: "클리닉",
				quantity: 1,
				unitPrice: 50000,
				lineTotal: 50000,
				type: "service",
			},
			{
				name: "모로칸오일",
				quantity: 2,
				unitPrice: 58000,
				lineTotal: 116000,
				type: "product",
			},
		],
		subtotal: 296000,
		discountAmount: 30000,
		total: 266000,
		payments: [{ method: "카드", amount: 266000 }],
		status: "completed",
		note: "프리미엄 케어 서비스",
		createdAt: "2025-01-11T11:00:00",
	},
	// 공유 (id: 19) - VIP, 18회 방문
	{
		id: "sale-014",
		saleDate: "2025-01-09",
		customer: {
			id: "19",
			name: "공유",
			phone: "010-9999-0000",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "남자커트",
				quantity: 1,
				unitPrice: 25000,
				lineTotal: 25000,
				type: "service",
			},
			{
				name: "두피케어",
				quantity: 1,
				unitPrice: 40000,
				lineTotal: 40000,
				type: "service",
			},
		],
		subtotal: 65000,
		discountAmount: 0,
		total: 65000,
		payments: [{ method: "정액권", amount: 65000 }],
		status: "completed",
		createdAt: "2025-01-09T09:30:00",
	},
	// 신규 고객 거래
	{
		id: "sale-015",
		saleDate: "2025-01-18",
		customer: {
			id: "new-001",
			name: "신규고객",
			phone: "010-9876-5432",
			type: "new",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "여자커트",
				quantity: 1,
				unitPrice: 30000,
				lineTotal: 30000,
				type: "service",
			},
		],
		subtotal: 30000,
		discountAmount: 3000,
		total: 27000,
		payments: [{ method: "현금", amount: 27000 }],
		status: "completed",
		note: "첫 방문 10% 할인",
		createdAt: "2025-01-18T16:00:00",
	},
	// 취소된 거래
	{
		id: "sale-016",
		saleDate: "2025-01-17",
		customer: {
			id: "3",
			name: "박지우",
			phone: "010-3456-7890",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "남자펌",
				quantity: 1,
				unitPrice: 80000,
				lineTotal: 80000,
				type: "service",
			},
		],
		subtotal: 80000,
		discountAmount: 0,
		total: 80000,
		payments: [{ method: "카드", amount: 80000 }],
		status: "voided",
		note: "고객 요청으로 취소",
		createdAt: "2025-01-17T14:00:00",
	},
	// 정액권 충전
	{
		id: "sale-017",
		saleDate: "2025-01-15",
		customer: {
			id: "5",
			name: "정다은",
			phone: "010-5678-9012",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "정액권 30만원",
				quantity: 1,
				unitPrice: 300000,
				lineTotal: 300000,
				type: "topup",
			},
		],
		subtotal: 300000,
		discountAmount: 0,
		total: 300000,
		payments: [{ method: "계좌이체", amount: 300000 }],
		status: "completed",
		createdAt: "2025-01-15T10:00:00",
	},
	// 추가 거래 데이터
	{
		id: "sale-018",
		saleDate: "2025-01-08",
		customer: {
			id: "7",
			name: "장원영",
			phone: "010-7890-1234",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "여자커트",
				quantity: 1,
				unitPrice: 30000,
				lineTotal: 30000,
				type: "service",
			},
		],
		subtotal: 30000,
		discountAmount: 3000,
		total: 27000,
		payments: [{ method: "카드", amount: 27000 }],
		status: "completed",
		note: "학생 할인",
		createdAt: "2025-01-08T17:00:00",
	},
	{
		id: "sale-019",
		saleDate: "2025-01-07",
		customer: {
			id: "18",
			name: "수지",
			phone: "010-8888-9999",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "뿌리염색",
				quantity: 1,
				unitPrice: 50000,
				lineTotal: 50000,
				type: "service",
			},
		],
		subtotal: 50000,
		discountAmount: 0,
		total: 50000,
		payments: [{ method: "카드", amount: 50000 }],
		status: "completed",
		createdAt: "2025-01-07T13:00:00",
	},
	{
		id: "sale-020",
		saleDate: "2025-01-05",
		customer: {
			id: "11",
			name: "강다니엘",
			phone: "010-1111-2222",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "남자커트",
				quantity: 1,
				unitPrice: 25000,
				lineTotal: 25000,
				type: "service",
			},
		],
		subtotal: 25000,
		discountAmount: 0,
		total: 25000,
		payments: [{ method: "정기권", amount: 25000 }],
		status: "completed",
		note: "커트 회원권 사용",
		createdAt: "2025-01-05T18:00:00",
	},
];

interface SaleContextType {
	sales: SaleRecord[];
	addSale: (sale: Omit<SaleRecord, "id" | "createdAt">) => void;
	updateSaleStatus: (saleId: string, status: SaleStatus) => void;
	getSalesByCustomerId: (customerId: string) => SaleRecord[];
	getSalesByDate: (date: string) => SaleRecord[];
	voidSale: (saleId: string) => void;
	getCustomerStats: (customerId: string) => CustomerStats;
}

const SaleContext = createContext<SaleContextType | null>(null);

export function SaleProvider({ children }: { children: ReactNode }) {
	const [sales, setSales] = useState<SaleRecord[]>(initialSales);
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
			return sales
				.filter((sale) => sale.customer.id === customerId)
				.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
		},
		[sales],
	);

	const getSalesByDate = useCallback(
		(date: string): SaleRecord[] => {
			return sales
				.filter((sale) => sale.saleDate === date)
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
			const sortedByDate = [...customerSales].sort(
				(a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
			);
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
			voidSale,
			getCustomerStats,
		}),
		[
			sales,
			addSale,
			updateSaleStatus,
			getSalesByCustomerId,
			getSalesByDate,
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
