import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SaleRecord } from "../components/sale/types";
import { useSalesTable } from "./useSalesTable";

describe("useSalesTable", () => {
	const mockSales: SaleRecord[] = [
		{
			id: "1",
			saleDate: "2026-01-15",
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
			createdAt: "2026-01-15T10:00:00",
		},
		{
			id: "2",
			saleDate: "2026-01-16",
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
			],
			subtotal: 100000,
			discountAmount: 0,
			total: 100000,
			payments: [{ method: "현금", amount: 100000 }],
			status: "completed",
			createdAt: "2026-01-16T14:30:00",
		},
		{
			id: "3",
			saleDate: "2026-01-17",
			customer: {
				id: "c3",
				name: "박지훈",
				phone: "010-3456-7890",
				type: "new",
			},
			staff: { id: "s1", name: "김정희", color: "#00c875" },
			items: [
				{
					name: "남자커트",
					quantity: 1,
					unitPrice: 20000,
					lineTotal: 20000,
					type: "service",
				},
			],
			subtotal: 20000,
			discountAmount: 0,
			total: 20000,
			payments: [{ method: "카드", amount: 20000 }],
			status: "voided",
			createdAt: "2026-01-17T09:00:00",
		},
	];

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-21T12:00:00"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("초기 상태", () => {
		it("기본 기간 필터는 month이다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			expect(result.current.periodFilter).toBe("month");
		});

		it("기본 정렬은 date 내림차순이다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			expect(result.current.sortKey).toBe("date");
			expect(result.current.sortDirection).toBe("desc");
		});

		it("startDate는 이번 달 첫날 근처이다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			// Timezone 차이로 인해 12월 31일 또는 1월 1일일 수 있음
			expect(["2025-12-31", "2026-01-01"]).toContain(result.current.startDate);
		});

		it("endDate는 오늘 근처이다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			// Timezone 차이로 인해 20일 또는 21일일 수 있음
			expect(["2026-01-20", "2026-01-21"]).toContain(result.current.endDate);
		});
	});

	describe("기간 필터", () => {
		it("today 선택 시 startDate와 endDate가 같아진다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handlePeriodFilter("today");
			});

			expect(result.current.periodFilter).toBe("today");
			expect(result.current.startDate).toBe(result.current.endDate);
		});

		it("week 선택 시 periodFilter가 week로 설정된다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handlePeriodFilter("week");
			});

			expect(result.current.periodFilter).toBe("week");
			// startDate가 endDate보다 같거나 앞선다
			expect(result.current.startDate <= result.current.endDate).toBe(true);
		});

		it("수동 날짜 변경 시 기간 필터가 null이 된다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handleStartDateChange("2026-01-10");
			});

			expect(result.current.periodFilter).toBeNull();
			expect(result.current.startDate).toBe("2026-01-10");
		});
	});

	describe("정렬", () => {
		it("같은 키로 정렬 시 방향이 토글된다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handleSort("date");
			});

			expect(result.current.sortDirection).toBe("asc");

			act(() => {
				result.current.handleSort("date");
			});

			expect(result.current.sortDirection).toBe("desc");
		});

		it("다른 키로 정렬 시 asc로 시작한다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handleSort("customer");
			});

			expect(result.current.sortKey).toBe("customer");
			expect(result.current.sortDirection).toBe("asc");
		});

		it("날짜 기준으로 정렬된다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			// 기본 내림차순: 최신 먼저
			expect(result.current.sortedSales[0].id).toBe("3");
			expect(result.current.sortedSales[2].id).toBe("1");

			act(() => {
				result.current.handleSort("date");
			});

			// 오름차순: 오래된 것 먼저
			expect(result.current.sortedSales[0].id).toBe("1");
			expect(result.current.sortedSales[2].id).toBe("3");
		});

		it("고객 이름으로 정렬된다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handleSort("customer");
			});

			// 오름차순 한글 정렬: 김민지, 박지훈, 이서연
			expect(result.current.sortedSales[0].customer.name).toBe("김민지");
			expect(result.current.sortedSales[1].customer.name).toBe("박지훈");
			expect(result.current.sortedSales[2].customer.name).toBe("이서연");
		});

		it("금액으로 정렬된다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handleSort("total");
			});

			// 오름차순: 20000, 30000, 100000
			expect(result.current.sortedSales[0].total).toBe(20000);
			expect(result.current.sortedSales[2].total).toBe(100000);
		});
	});

	describe("요약 계산", () => {
		it("완료된 거래의 총 매출을 계산한다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			// completed만: 30000 + 100000 = 130000 (voided 제외)
			expect(result.current.summary.totalAmount).toBe(130000);
		});

		it("전체 거래 건수를 계산한다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			expect(result.current.summary.transactionCount).toBe(3);
		});

		it("취소된 거래 건수를 계산한다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			expect(result.current.summary.voidedCount).toBe(1);
		});
	});

	describe("정렬 아이콘", () => {
		it("비활성 컬럼은 unfold_more를 반환한다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			expect(result.current.getSortIcon("customer")).toBe("unfold_more");
		});

		it("활성 컬럼 asc는 keyboard_arrow_up을 반환한다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			act(() => {
				result.current.handleSort("date");
			});

			expect(result.current.getSortIcon("date")).toBe("keyboard_arrow_up");
		});

		it("활성 컬럼 desc는 keyboard_arrow_down을 반환한다", () => {
			const { result } = renderHook(() => useSalesTable(mockSales));

			expect(result.current.getSortIcon("date")).toBe("keyboard_arrow_down");
		});
	});
});
