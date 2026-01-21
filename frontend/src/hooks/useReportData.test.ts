import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SaleRecord } from "../components/sale/types";
import { useReportData } from "./useReportData";

describe("useReportData", () => {
	const mockSales: SaleRecord[] = [
		{
			id: "1",
			saleDate: new Date().toISOString().split("T")[0] ?? "",
			customer: {
				id: "c1",
				name: "김민지",
				phone: "010-1234-5678",
				type: "new",
			},
			staff: { id: "s1", name: "김정희", color: "#00c875" },
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
			payments: [{ method: "카드", amount: 30000 }],
			status: "completed",
			createdAt: new Date().toISOString(),
		},
		{
			id: "2",
			saleDate: new Date().toISOString().split("T")[0] ?? "",
			customer: {
				id: "c2",
				name: "이서연",
				phone: "010-2345-6789",
				type: "returning",
			},
			staff: { id: "s2", name: "박수민", color: "#fdab3d" },
			items: [
				{
					name: "일반펌",
					quantity: 1,
					unitPrice: 100000,
					lineTotal: 100000,
					type: "service",
				},
				{
					name: "샴푸",
					quantity: 2,
					unitPrice: 10000,
					lineTotal: 20000,
					type: "product",
				},
			],
			subtotal: 120000,
			discountAmount: 0,
			total: 120000,
			payments: [
				{ method: "카드", amount: 100000 },
				{ method: "현금", amount: 20000 },
			],
			status: "completed",
			createdAt: new Date().toISOString(),
		},
		{
			id: "3",
			saleDate: new Date().toISOString().split("T")[0] ?? "",
			customer: {
				id: "c1",
				name: "김민지",
				phone: "010-1234-5678",
				type: "returning",
			},
			staff: { id: "s1", name: "김정희", color: "#00c875" },
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
			createdAt: new Date().toISOString(),
		},
	];

	describe("기간 필터", () => {
		it("기본값은 month이다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			expect(result.current.periodFilter).toBe("month");
		});

		it("기간 필터를 변경할 수 있다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			act(() => {
				result.current.setPeriodFilter("today");
			});

			expect(result.current.periodFilter).toBe("today");
		});

		it("오늘 필터 설정 시 dateRange가 오늘 날짜로 설정된다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			act(() => {
				result.current.setPeriodFilter("today");
			});

			expect(result.current.dateRange.startDate).toBe(result.current.dateRange.endDate);
		});
	});

	describe("매출 요약", () => {
		it("총 매출을 올바르게 계산한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			// 30000 + 120000 + 30000 = 180000
			expect(result.current.summary.totalAmount).toBe(180000);
		});

		it("거래 건수를 올바르게 계산한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			expect(result.current.summary.transactionCount).toBe(3);
		});

		it("평균 객단가를 올바르게 계산한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			// 180000 / 3 = 60000
			expect(result.current.summary.avgPerTransaction).toBe(60000);
		});

		it("데이터가 없으면 평균 객단가가 0이다", () => {
			const { result } = renderHook(() => useReportData([]));

			expect(result.current.summary.avgPerTransaction).toBe(0);
		});
	});

	describe("담당자별 매출", () => {
		it("담당자별 매출을 올바르게 집계한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			expect(result.current.staffSales).toHaveLength(2);
		});

		it("매출 순으로 정렬된다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			// 박수민: 120000, 김정희: 60000
			expect(result.current.staffSales[0].name).toBe("박수민");
			expect(result.current.staffSales[0].amount).toBe(120000);
		});

		it("담당자별 거래 건수를 포함한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			const kimStaff = result.current.staffSales.find((s) => s.name === "김정희");
			expect(kimStaff?.count).toBe(2);
		});
	});

	describe("결제수단별 매출", () => {
		it("결제수단별 매출을 올바르게 집계한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			expect(result.current.paymentMethodSales).toHaveLength(2);
		});

		it("매출 순으로 정렬된다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			// 카드: 130000, 현금: 50000
			expect(result.current.paymentMethodSales[0].method).toBe("카드");
			expect(result.current.paymentMethodSales[0].amount).toBe(130000);
		});
	});

	describe("인기 시술", () => {
		it("시술만 집계한다 (상품 제외)", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			const hasProduct = result.current.topServices.some((s) => s.name === "샴푸");
			expect(hasProduct).toBe(false);
		});

		it("건수 순으로 정렬된다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			// 여자커트: 2건, 일반펌: 1건
			expect(result.current.topServices[0].name).toBe("여자커트");
			expect(result.current.topServices[0].count).toBe(2);
		});

		it("TOP 5만 반환한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			expect(result.current.topServices.length).toBeLessThanOrEqual(5);
		});
	});

	describe("고객 유형", () => {
		it("신규/재방문 고객 수를 집계한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			expect(result.current.customerTypes.newCount).toBe(1);
			expect(result.current.customerTypes.returningCount).toBe(2);
		});

		it("신규/재방문 비율을 계산한다", () => {
			const { result } = renderHook(() => useReportData(mockSales));

			// 신규 1/3 ≈ 33%, 재방문 2/3 ≈ 67%
			expect(result.current.customerTypes.newPercent).toBe(33);
			expect(result.current.customerTypes.returningPercent).toBe(67);
		});

		it("데이터가 없으면 비율이 0이다", () => {
			const { result } = renderHook(() => useReportData([]));

			expect(result.current.customerTypes.newPercent).toBe(0);
			expect(result.current.customerTypes.returningPercent).toBe(0);
		});
	});
});
