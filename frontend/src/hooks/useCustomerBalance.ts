import { useMemo } from "react";
import type { CartItem } from "../components/sale/types";
import type { Customer } from "../contexts/CustomerContext";

interface UseCustomerBalanceReturn {
	usedStoredValue: number;
	usedMembershipCount: number;
	displayedStoredValue: number;
	displayedMembershipRemaining: number;
}

export function useCustomerBalance(
	customer: Customer | undefined,
	cart: CartItem[],
): UseCustomerBalanceReturn {
	const usedStoredValue = useMemo(
		() =>
			cart
				.filter((item) => item.paymentMethod === "stored_value")
				.reduce((sum, item) => sum + item.finalPrice, 0),
		[cart],
	);

	const usedMembershipCount = useMemo(
		() => cart.filter((item) => item.paymentMethod === "membership").length,
		[cart],
	);

	const displayedStoredValue = useMemo(() => {
		if (customer?.storedValue !== undefined && customer.storedValue > 0) {
			return customer.storedValue - usedStoredValue;
		}
		return 0;
	}, [customer, usedStoredValue]);

	const displayedMembershipRemaining = useMemo(() => {
		if (customer?.membership) {
			return customer.membership.total - customer.membership.used - usedMembershipCount;
		}
		return 0;
	}, [customer, usedMembershipCount]);

	return {
		usedStoredValue,
		usedMembershipCount,
		displayedStoredValue,
		displayedMembershipRemaining,
	};
}
