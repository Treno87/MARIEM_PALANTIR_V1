import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CartItem } from "../components/sale/types";
import { useCart } from "./useCart";

describe("useCart", () => {
	const mockCartItem: CartItem = {
		id: "s1",
		name: "남자커트",
		price: 25000,
		quantity: 1,
		type: "service",
		paymentMethod: "card",
		discountAmount: 0,
		finalPrice: 25000,
	};

	const mockTopupItem: CartItem = {
		id: "sv1",
		name: "정액권 10만원",
		price: 100000,
		quantity: 1,
		type: "topup",
		topupType: "stored_value",
		topupValue: 100000,
		paymentMethod: "card",
		discountAmount: 0,
		finalPrice: 100000,
	};

	describe("초기화", () => {
		it("빈 카트로 시작한다", () => {
			const { result } = renderHook(() => useCart());
			expect(result.current.cart).toEqual([]);
		});

		it("초기 카트 항목을 제공할 수 있다", () => {
			const { result } = renderHook(() => useCart([mockCartItem]));
			expect(result.current.cart).toHaveLength(1);
			expect(result.current.cart[0]).toEqual(mockCartItem);
		});
	});

	describe("addToCart", () => {
		it("새 항목을 카트에 추가한다", () => {
			const { result } = renderHook(() => useCart());

			act(() => {
				result.current.addToCart(mockCartItem);
			});

			expect(result.current.cart).toHaveLength(1);
			expect(result.current.cart[0]).toEqual(mockCartItem);
		});

		it("동일한 항목을 추가하면 수량이 증가한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem]));

			act(() => {
				result.current.addToCart(mockCartItem);
			});

			expect(result.current.cart).toHaveLength(1);
			expect(result.current.cart[0].quantity).toBe(2);
		});

		it("새 항목 추가 시 기본값이 설정된다", () => {
			const { result } = renderHook(() => useCart());
			const itemWithoutDefaults = {
				...mockCartItem,
				eventId: "ev1" as string | undefined,
				discountAmount: 100,
			};

			act(() => {
				result.current.addToCart(itemWithoutDefaults);
			});

			expect(result.current.cart[0].eventId).toBeUndefined();
			expect(result.current.cart[0].discountAmount).toBe(0);
			expect(result.current.cart[0].finalPrice).toBe(mockCartItem.price);
		});
	});

	describe("updateQuantity", () => {
		it("항목 수량을 증가시킨다", () => {
			const { result } = renderHook(() => useCart([mockCartItem]));

			act(() => {
				result.current.updateQuantity("s1", 1);
			});

			expect(result.current.cart[0].quantity).toBe(2);
		});

		it("항목 수량을 감소시킨다", () => {
			const { result } = renderHook(() => useCart([{ ...mockCartItem, quantity: 3 }]));

			act(() => {
				result.current.updateQuantity("s1", -1);
			});

			expect(result.current.cart[0].quantity).toBe(2);
		});

		it("수량이 0이 되면 항목을 제거한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem]));

			act(() => {
				result.current.updateQuantity("s1", -1);
			});

			expect(result.current.cart).toHaveLength(0);
		});
	});

	describe("removeFromCart", () => {
		it("항목을 카트에서 제거한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem]));

			act(() => {
				result.current.removeFromCart("s1");
			});

			expect(result.current.cart).toHaveLength(0);
		});

		it("존재하지 않는 항목 제거 시도 시 에러 없이 처리한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem]));

			act(() => {
				result.current.removeFromCart("nonexistent");
			});

			expect(result.current.cart).toHaveLength(1);
		});
	});

	describe("updatePaymentMethod", () => {
		it("항목의 결제수단을 변경한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem]));

			act(() => {
				result.current.updatePaymentMethod("s1", "cash");
			});

			expect(result.current.cart[0].paymentMethod).toBe("cash");
		});
	});

	describe("updateEvent", () => {
		const mockDiscountEvents = [
			{
				id: "ev1",
				name: "여름특가",
				discountType: "percent" as const,
				discountValue: 10,
			},
			{
				id: "ev2",
				name: "단골할인",
				discountType: "amount" as const,
				discountValue: 5000,
			},
		];

		it("퍼센트 할인 이벤트를 적용한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem], mockDiscountEvents));

			act(() => {
				result.current.updateEvent("s1", "ev1");
			});

			expect(result.current.cart[0].eventId).toBe("ev1");
			expect(result.current.cart[0].discountAmount).toBe(2500); // 25000 * 10%
			expect(result.current.cart[0].finalPrice).toBe(22500); // 25000 - 2500
		});

		it("정액 할인 이벤트를 적용한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem], mockDiscountEvents));

			act(() => {
				result.current.updateEvent("s1", "ev2");
			});

			expect(result.current.cart[0].eventId).toBe("ev2");
			expect(result.current.cart[0].discountAmount).toBe(5000);
			expect(result.current.cart[0].finalPrice).toBe(20000); // 25000 - 5000
		});

		it("이벤트를 제거하면 할인이 초기화된다", () => {
			const { result } = renderHook(() =>
				useCart(
					[
						{
							...mockCartItem,
							eventId: "ev1",
							discountAmount: 2500,
							finalPrice: 22500,
						},
					],
					mockDiscountEvents,
				),
			);

			act(() => {
				result.current.updateEvent("s1", undefined);
			});

			expect(result.current.cart[0].eventId).toBeUndefined();
			expect(result.current.cart[0].discountAmount).toBe(0);
			expect(result.current.cart[0].finalPrice).toBe(25000);
		});

		it("수량이 여러 개일 때 할인이 올바르게 계산된다", () => {
			const { result } = renderHook(() =>
				useCart([{ ...mockCartItem, quantity: 3 }], mockDiscountEvents),
			);

			act(() => {
				result.current.updateEvent("s1", "ev1");
			});

			// 25000 * 3 * 10% = 7500
			expect(result.current.cart[0].discountAmount).toBe(7500);
			// 25000 * 3 - 7500 = 67500
			expect(result.current.cart[0].finalPrice).toBe(67500);
		});
	});

	describe("clearCart", () => {
		it("카트를 초기화한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem, mockTopupItem]));

			act(() => {
				result.current.clearCart();
			});

			expect(result.current.cart).toHaveLength(0);
		});
	});

	describe("계산된 값", () => {
		it("payableItems는 topup을 제외한 항목만 포함한다", () => {
			const { result } = renderHook(() => useCart([mockCartItem, mockTopupItem]));

			expect(result.current.payableItems).toHaveLength(1);
			expect(result.current.payableItems[0].type).toBe("service");
		});

		it("subtotal은 payableItems의 총 금액이다", () => {
			const item1 = { ...mockCartItem, quantity: 2 }; // 50000
			const item2 = { ...mockCartItem, id: "s2", price: 30000 }; // 30000
			const { result } = renderHook(() => useCart([item1, item2]));

			expect(result.current.subtotal).toBe(80000);
		});

		it("totalDiscount는 payableItems의 총 할인액이다", () => {
			const item1 = { ...mockCartItem, discountAmount: 2500 };
			const item2 = { ...mockCartItem, id: "s2", discountAmount: 5000 };
			const { result } = renderHook(() => useCart([item1, item2]));

			expect(result.current.totalDiscount).toBe(7500);
		});

		it("total은 정기권 제외 결제 금액이다", () => {
			const cashItem = { ...mockCartItem, finalPrice: 22500 };
			const membershipItem = {
				...mockCartItem,
				id: "s2",
				paymentMethod: "membership" as const,
				finalPrice: 30000,
			};
			const { result } = renderHook(() => useCart([cashItem, membershipItem]));

			expect(result.current.total).toBe(22500);
		});

		it("topupTotal은 topup 항목의 총 금액이다", () => {
			const topup1 = { ...mockTopupItem };
			const topup2 = {
				...mockTopupItem,
				id: "sv2",
				price: 300000,
				quantity: 1,
			};
			const { result } = renderHook(() => useCart([mockCartItem, topup1, topup2]));

			expect(result.current.topupTotal).toBe(400000);
		});
	});
});
