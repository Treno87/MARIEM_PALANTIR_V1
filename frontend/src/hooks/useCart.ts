import { useCallback, useMemo, useState } from "react";
import type { CartItem, DiscountEvent, ItemPaymentMethod } from "../components/sale/types";

interface UseCartReturn {
	cart: CartItem[];
	payableItems: CartItem[];
	subtotal: number;
	totalDiscount: number;
	total: number;
	topupTotal: number;
	addToCart: (item: CartItem) => void;
	updateQuantity: (id: string, delta: number) => void;
	removeFromCart: (id: string) => void;
	updatePaymentMethod: (id: string, method: ItemPaymentMethod) => void;
	updateEvent: (id: string, eventId: string | undefined) => void;
	clearCart: () => void;
	setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

function calculateDiscountAmount(event: DiscountEvent | undefined, item: CartItem): number {
	if (!event) return 0;

	if (event.discountType === "percent") {
		return Math.round(item.price * item.quantity * (event.discountValue / 100));
	}

	return event.discountValue;
}

export function useCart(
	initialCart: CartItem[] = [],
	discountEvents: DiscountEvent[] = [],
): UseCartReturn {
	const [cart, setCart] = useState<CartItem[]>(initialCart);

	const addToCart = useCallback((item: CartItem): void => {
		setCart((prevCart) => {
			const existingItem = prevCart.find((c) => c.id === item.id);
			if (existingItem) {
				return prevCart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
			}

			const newItem: CartItem = {
				...item,
				paymentMethod: item.paymentMethod,
				eventId: undefined,
				discountAmount: 0,
				finalPrice: item.price,
			};
			return [...prevCart, newItem];
		});
	}, []);

	const updateQuantity = useCallback((id: string, delta: number): void => {
		setCart((prevCart) =>
			prevCart
				.map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
				.filter((item) => item.quantity > 0),
		);
	}, []);

	const removeFromCart = useCallback((id: string): void => {
		setCart((prevCart) => prevCart.filter((item) => item.id !== id));
	}, []);

	const updatePaymentMethod = useCallback((id: string, method: ItemPaymentMethod): void => {
		setCart((prevCart) =>
			prevCart.map((item) => (item.id === id ? { ...item, paymentMethod: method } : item)),
		);
	}, []);

	const updateEvent = useCallback(
		(id: string, eventId: string | undefined): void => {
			setCart((prevCart) =>
				prevCart.map((item) => {
					if (item.id !== id) return item;

					const event =
						eventId !== undefined && eventId !== ""
							? discountEvents.find((e) => e.id === eventId)
							: undefined;

					const discountAmount = calculateDiscountAmount(event, item);
					const finalPrice = item.price * item.quantity - discountAmount;

					return { ...item, eventId, discountAmount, finalPrice };
				}),
			);
		},
		[discountEvents],
	);

	const clearCart = useCallback((): void => {
		setCart([]);
	}, []);

	const payableItems = useMemo(() => cart.filter((item) => item.type !== "topup"), [cart]);

	const subtotal = useMemo(
		() => payableItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
		[payableItems],
	);

	const totalDiscount = useMemo(
		() => payableItems.reduce((sum, item) => sum + item.discountAmount, 0),
		[payableItems],
	);

	const total = useMemo(
		() =>
			payableItems
				.filter((item) => item.paymentMethod !== "membership")
				.reduce((sum, item) => sum + item.finalPrice, 0),
		[payableItems],
	);

	const topupTotal = useMemo(
		() =>
			cart
				.filter((item) => item.type === "topup")
				.reduce((sum, item) => sum + item.price * item.quantity, 0),
		[cart],
	);

	return {
		cart,
		payableItems,
		subtotal,
		totalDiscount,
		total,
		topupTotal,
		addToCart,
		updateQuantity,
		removeFromCart,
		updatePaymentMethod,
		updateEvent,
		clearCart,
		setCart,
	};
}
