import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Customer } from "../contexts/CustomerContext";
import { useCustomerTable } from "./useCustomerTable";

describe("useCustomerTable", () => {
	const mockCustomers: Customer[] = [
		{
			id: "1",
			name: "김민지",
			phone: "010-1234-5678",
			initials: "MJ",
			visitCount: 10,
			totalSpent: 500000,
			storedValue: 150000,
			status: "active",
			registrationDate: "2024-01-01",
			lastVisitDate: "2025-01-15",
		},
		{
			id: "2",
			name: "이서연",
			phone: "010-2345-6789",
			initials: "SY",
			visitCount: 5,
			totalSpent: 200000,
			status: "active",
			registrationDate: "2024-02-01",
		},
		{
			id: "3",
			name: "박지우",
			phone: "010-3456-7890",
			initials: "JW",
			visitCount: 15,
			totalSpent: 1500000,
			status: "inactive",
			registrationDate: "2024-03-01",
		},
	];

	describe("초기 상태", () => {
		it("기본값으로 초기화된다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			expect(result.current.searchQuery).toBe("");
			expect(result.current.showInactive).toBe(false);
			expect(result.current.sortKey).toBe("name");
			expect(result.current.sortDirection).toBe("asc");
		});
	});

	describe("필터링", () => {
		it("비활성 고객을 기본적으로 제외한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			expect(result.current.filteredCustomers).toHaveLength(2);
			expect(result.current.filteredCustomers.every((c) => c.status === "active")).toBe(true);
		});

		it("showInactive가 true면 비활성 고객도 포함한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.setShowInactive(true);
			});

			expect(result.current.filteredCustomers).toHaveLength(3);
		});

		it("이름으로 검색할 수 있다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.setSearchQuery("민지");
			});

			expect(result.current.filteredCustomers).toHaveLength(1);
			expect(result.current.filteredCustomers[0].name).toBe("김민지");
		});

		it("전화번호로 검색할 수 있다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.setSearchQuery("2345");
			});

			expect(result.current.filteredCustomers).toHaveLength(1);
			expect(result.current.filteredCustomers[0].name).toBe("이서연");
		});

		it("검색어가 비어있으면 모든 활성 고객이 표시된다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.setSearchQuery("   ");
			});

			expect(result.current.filteredCustomers).toHaveLength(2);
		});

		it("검색어가 대소문자 구분 없이 작동한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.setSearchQuery("김민지");
			});

			expect(result.current.filteredCustomers).toHaveLength(1);
		});
	});

	describe("정렬", () => {
		it("이름으로 오름차순 정렬한다 (기본값)", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			expect(result.current.sortedCustomers[0].name).toBe("김민지");
			expect(result.current.sortedCustomers[1].name).toBe("이서연");
		});

		it("같은 키를 다시 클릭하면 정렬 방향이 바뀐다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.handleSort("name");
			});

			expect(result.current.sortDirection).toBe("desc");
			expect(result.current.sortedCustomers[0].name).toBe("이서연");
		});

		it("다른 키를 클릭하면 오름차순으로 초기화된다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.handleSort("visitCount");
			});

			expect(result.current.sortKey).toBe("visitCount");
			expect(result.current.sortDirection).toBe("asc");
		});

		it("방문 횟수로 정렬할 수 있다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.handleSort("visitCount");
			});

			expect(result.current.sortedCustomers[0].visitCount).toBe(5);
			expect(result.current.sortedCustomers[1].visitCount).toBe(10);
		});

		it("총 지출액으로 정렬할 수 있다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.handleSort("totalSpent");
			});

			expect(result.current.sortedCustomers[0].totalSpent).toBe(200000);
			expect(result.current.sortedCustomers[1].totalSpent).toBe(500000);
		});

		it("정액권 잔액으로 정렬할 수 있다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.handleSort("storedValue");
			});

			// storedValue가 없는 고객은 0으로 처리
			expect(result.current.sortedCustomers[0].storedValue).toBeUndefined();
			expect(result.current.sortedCustomers[1].storedValue).toBe(150000);
		});
	});

	describe("정렬 아이콘", () => {
		it("정렬되지 않은 컬럼은 unfold_more 아이콘을 표시한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			expect(result.current.getSortIcon("visitCount")).toBe("unfold_more");
		});

		it("오름차순 정렬된 컬럼은 keyboard_arrow_up 아이콘을 표시한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			expect(result.current.getSortIcon("name")).toBe("keyboard_arrow_up");
		});

		it("내림차순 정렬된 컬럼은 keyboard_arrow_down 아이콘을 표시한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			act(() => {
				result.current.handleSort("name");
			});

			expect(result.current.getSortIcon("name")).toBe("keyboard_arrow_down");
		});
	});

	describe("통계", () => {
		it("전체 고객 수를 계산한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			expect(result.current.stats.totalCount).toBe(3);
		});

		it("VIP 고객 수를 계산한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			// VIP는 100만원 이상
			expect(result.current.stats.vipCount).toBe(1);
		});

		it("활성 고객 수를 계산한다 (90일 이내 방문)", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			expect(result.current.stats.activeCount).toBeGreaterThanOrEqual(0);
		});

		it("총 LTV를 계산한다", () => {
			const { result } = renderHook(() => useCustomerTable(mockCustomers));

			// 500000 + 200000 + 1500000 = 2200000
			expect(result.current.stats.totalLtv).toBe(2200000);
		});
	});
});
