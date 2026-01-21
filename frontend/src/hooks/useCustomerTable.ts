import { useMemo, useState } from "react";
import { type Customer, getAutoStatus, getCustomerTier } from "../contexts/CustomerContext";

type CustomerSortKey =
	| "name"
	| "phone"
	| "visitCount"
	| "tier"
	| "totalSpent"
	| "storedValue"
	| "status";

type SortDirection = "asc" | "desc";

interface CustomerStats {
	totalCount: number;
	vipCount: number;
	activeCount: number;
	inactiveCount: number;
	totalLtv: number;
}

interface UseCustomerTableReturn {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	showInactive: boolean;
	setShowInactive: (show: boolean) => void;
	sortKey: CustomerSortKey;
	sortDirection: SortDirection;
	filteredCustomers: Customer[];
	sortedCustomers: Customer[];
	stats: CustomerStats;
	handleSort: (key: CustomerSortKey) => void;
	getSortIcon: (key: CustomerSortKey) => string;
}

export function useCustomerTable(customers: Customer[]): UseCustomerTableReturn {
	const [searchQuery, setSearchQuery] = useState("");
	const [showInactive, setShowInactive] = useState(false);
	const [sortKey, setSortKey] = useState<CustomerSortKey>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const filteredCustomers = useMemo(() => {
		return customers.filter((c) => {
			if (!showInactive && c.status === "inactive") return false;

			if (searchQuery.trim() !== "") {
				const query = searchQuery.toLowerCase();
				return c.name.toLowerCase().includes(query) || c.phone.includes(searchQuery);
			}
			return true;
		});
	}, [customers, searchQuery, showInactive]);

	const sortedCustomers = useMemo(() => {
		const tierOrder = { vip: 3, gold: 2, silver: 1, bronze: 0 };
		return [...filteredCustomers].sort((a, b) => {
			let comparison = 0;
			switch (sortKey) {
				case "name":
					comparison = a.name.localeCompare(b.name, "ko");
					break;
				case "phone":
					comparison = a.phone.localeCompare(b.phone);
					break;
				case "visitCount":
					comparison = a.visitCount - b.visitCount;
					break;
				case "tier":
					comparison =
						tierOrder[getCustomerTier(a.totalSpent)] - tierOrder[getCustomerTier(b.totalSpent)];
					break;
				case "totalSpent":
					comparison = a.totalSpent - b.totalSpent;
					break;
				case "storedValue":
					comparison = (a.storedValue ?? 0) - (b.storedValue ?? 0);
					break;
				case "status":
					comparison = a.status.localeCompare(b.status);
					break;
			}
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filteredCustomers, sortKey, sortDirection]);

	const stats = useMemo((): CustomerStats => {
		return {
			totalCount: customers.length,
			vipCount: customers.filter((c) => getCustomerTier(c.totalSpent) === "vip").length,
			activeCount: customers.filter((c) => getAutoStatus(c.lastVisitDate) === "active").length,
			inactiveCount: customers.filter((c) => getAutoStatus(c.lastVisitDate) === "inactive").length,
			totalLtv: customers.reduce((sum, c) => sum + c.totalSpent, 0),
		};
	}, [customers]);

	const handleSort = (key: CustomerSortKey): void => {
		if (sortKey === key) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDirection("asc");
		}
	};

	const getSortIcon = (key: CustomerSortKey): string => {
		if (sortKey !== key) return "unfold_more";
		return sortDirection === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
	};

	return {
		searchQuery,
		setSearchQuery,
		showInactive,
		setShowInactive,
		sortKey,
		sortDirection,
		filteredCustomers,
		sortedCustomers,
		stats,
		handleSort,
		getSortIcon,
	};
}
