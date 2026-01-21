import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CartItem } from "../components/sale/types";
import type { Customer } from "../contexts/CustomerContext";
import { useCustomerBalance } from "./useCustomerBalance";

describe("useCustomerBalance", () => {
	const mockCustomerWithBoth: Customer = {
		id: "1",
		name: "김민지",
		phone: "010-1234-5678",
		initials: "MJ",
		storedValue: 150000,
		membership: { name: "펌 정기권", used: 2, total: 10 },
		visitCount: 5,
		totalSpent: 500000,
		registrationDate: "2024-01-01",
	};

	const mockCustomerStoredValueOnly: Customer = {
		id: "2",
		name: "이서연",
		phone: "010-2345-6789",
		initials: "SY",
		storedValue: 50000,
		visitCount: 3,
		totalSpent: 200000,
		registrationDate: "2024-02-01",
	};

	const mockCustomerMembershipOnly: Customer = {
		id: "3",
		name: "박지우",
		phone: "010-3456-7890",
		initials: "JW",
		membership: { name: "커트 회원권", used: 5, total: 12 },
		visitCount: 10,
		totalSpent: 300000,
		registrationDate: "2024-03-01",
	};

	const mockStoredValueItem: CartItem = {
		id: "s1",
		name: "남자커트",
		price: 25000,
		quantity: 1,
		type: "service",
		paymentMethod: "stored_value",
		discountAmount: 0,
		finalPrice: 25000,
	};

	const mockMembershipItem: CartItem = {
		id: "s2",
		name: "여자커트",
		price: 30000,
		quantity: 1,
		type: "service",
		paymentMethod: "membership",
		discountAmount: 0,
		finalPrice: 30000,
	};

	const mockCardItem: CartItem = {
		id: "s3",
		name: "디자인커트",
		price: 40000,
		quantity: 1,
		type: "service",
		paymentMethod: "card",
		discountAmount: 0,
		finalPrice: 40000,
	};

	describe("고객이 없는 경우", () => {
		it("모든 값이 0으로 반환된다", () => {
			const { result } = renderHook(() => useCustomerBalance(undefined, []));

			expect(result.current.usedStoredValue).toBe(0);
			expect(result.current.usedMembershipCount).toBe(0);
			expect(result.current.displayedStoredValue).toBe(0);
			expect(result.current.displayedMembershipRemaining).toBe(0);
		});
	});

	describe("정액권 계산", () => {
		it("정액권 사용량을 올바르게 계산한다", () => {
			const { result } = renderHook(() =>
				useCustomerBalance(mockCustomerWithBoth, [mockStoredValueItem]),
			);

			expect(result.current.usedStoredValue).toBe(25000);
		});

		it("여러 정액권 항목의 사용량을 합산한다", () => {
			const items: CartItem[] = [
				mockStoredValueItem,
				{ ...mockStoredValueItem, id: "s4", finalPrice: 30000 },
			];
			const { result } = renderHook(() => useCustomerBalance(mockCustomerWithBoth, items));

			expect(result.current.usedStoredValue).toBe(55000);
		});

		it("정액권 잔액을 올바르게 표시한다", () => {
			const { result } = renderHook(() =>
				useCustomerBalance(mockCustomerWithBoth, [mockStoredValueItem]),
			);

			// 150000 - 25000 = 125000
			expect(result.current.displayedStoredValue).toBe(125000);
		});

		it("정액권이 없는 고객은 잔액이 0이다", () => {
			const { result } = renderHook(() =>
				useCustomerBalance(mockCustomerMembershipOnly, [mockStoredValueItem]),
			);

			expect(result.current.displayedStoredValue).toBe(0);
		});

		it("카드 결제는 정액권 사용량에 포함되지 않는다", () => {
			const { result } = renderHook(() => useCustomerBalance(mockCustomerWithBoth, [mockCardItem]));

			expect(result.current.usedStoredValue).toBe(0);
			expect(result.current.displayedStoredValue).toBe(150000);
		});
	});

	describe("정기권 계산", () => {
		it("정기권 사용 횟수를 올바르게 계산한다", () => {
			const { result } = renderHook(() =>
				useCustomerBalance(mockCustomerWithBoth, [mockMembershipItem]),
			);

			expect(result.current.usedMembershipCount).toBe(1);
		});

		it("여러 정기권 항목의 사용 횟수를 합산한다", () => {
			const items: CartItem[] = [
				mockMembershipItem,
				{ ...mockMembershipItem, id: "s5" },
				{ ...mockMembershipItem, id: "s6" },
			];
			const { result } = renderHook(() => useCustomerBalance(mockCustomerWithBoth, items));

			expect(result.current.usedMembershipCount).toBe(3);
		});

		it("정기권 남은 횟수를 올바르게 표시한다", () => {
			const { result } = renderHook(() =>
				useCustomerBalance(mockCustomerWithBoth, [mockMembershipItem]),
			);

			// total(10) - used(2) - usedMembershipCount(1) = 7
			expect(result.current.displayedMembershipRemaining).toBe(7);
		});

		it("정기권이 없는 고객은 남은 횟수가 0이다", () => {
			const { result } = renderHook(() =>
				useCustomerBalance(mockCustomerStoredValueOnly, [mockMembershipItem]),
			);

			expect(result.current.displayedMembershipRemaining).toBe(0);
		});

		it("카드 결제는 정기권 사용 횟수에 포함되지 않는다", () => {
			const { result } = renderHook(() => useCustomerBalance(mockCustomerWithBoth, [mockCardItem]));

			expect(result.current.usedMembershipCount).toBe(0);
			// total(10) - used(2) = 8
			expect(result.current.displayedMembershipRemaining).toBe(8);
		});
	});

	describe("복합 시나리오", () => {
		it("정액권과 정기권을 동시에 사용할 수 있다", () => {
			const items: CartItem[] = [mockStoredValueItem, mockMembershipItem];
			const { result } = renderHook(() => useCustomerBalance(mockCustomerWithBoth, items));

			expect(result.current.usedStoredValue).toBe(25000);
			expect(result.current.usedMembershipCount).toBe(1);
			expect(result.current.displayedStoredValue).toBe(125000);
			expect(result.current.displayedMembershipRemaining).toBe(7);
		});

		it("혼합 결제 시 각 결제수단별로 올바르게 계산한다", () => {
			const items: CartItem[] = [mockStoredValueItem, mockMembershipItem, mockCardItem];
			const { result } = renderHook(() => useCustomerBalance(mockCustomerWithBoth, items));

			expect(result.current.usedStoredValue).toBe(25000);
			expect(result.current.usedMembershipCount).toBe(1);
		});
	});
});
