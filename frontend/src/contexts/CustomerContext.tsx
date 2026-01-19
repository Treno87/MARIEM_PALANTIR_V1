import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { Gender } from "../components/sale/types";

export interface Customer {
	id: string;
	name: string;
	phone: string;
	initials: string;
	gender?: Gender;
	birthDate?: string;
	memo?: string;
	storedValue?: number;
	membership?: {
		name: string;
		used: number;
		total: number;
	};
	firstVisitDate?: string;
	lastVisitDate?: string;
	visitCount: number;
	status: "active" | "inactive";
	createdAt: string;
}

const getInitials = (name: string): string => {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0]?.charAt(0) ?? "") + (parts[1]?.charAt(0) ?? "");
	}
	return name.substring(0, 2).toUpperCase();
};

const getToday = (): string => {
	return new Date().toISOString().split("T")[0] ?? "";
};

const initialCustomers: Customer[] = [
	{
		id: "1",
		name: "김민지",
		phone: "010-1234-5678",
		initials: "MJ",
		gender: "female",
		storedValue: 150000,
		membership: { name: "펌 정기권", used: 2, total: 10 },
		firstVisitDate: "2024-03-15",
		lastVisitDate: "2025-01-10",
		visitCount: 12,
		status: "active",
		createdAt: "2024-03-15",
	},
	{
		id: "2",
		name: "이서연",
		phone: "010-2345-6789",
		initials: "SY",
		gender: "female",
		storedValue: 50000,
		firstVisitDate: "2024-06-20",
		lastVisitDate: "2025-01-05",
		visitCount: 8,
		status: "active",
		createdAt: "2024-06-20",
	},
	{
		id: "3",
		name: "박지우",
		phone: "010-3456-7890",
		initials: "JW",
		gender: "male",
		membership: { name: "커트 회원권", used: 5, total: 12 },
		firstVisitDate: "2024-09-01",
		lastVisitDate: "2024-12-20",
		visitCount: 5,
		status: "active",
		createdAt: "2024-09-01",
	},
	{
		id: "4",
		name: "최수현",
		phone: "010-4567-8901",
		initials: "SH",
		gender: "female",
		memo: "염색 알러지 있음 - 패치테스트 필수",
		firstVisitDate: "2024-01-10",
		lastVisitDate: "2024-08-15",
		visitCount: 3,
		status: "inactive",
		createdAt: "2024-01-10",
	},
	{
		id: "5",
		name: "정다은",
		phone: "010-5678-9012",
		initials: "DE",
		gender: "female",
		storedValue: 200000,
		firstVisitDate: "2024-11-01",
		lastVisitDate: "2025-01-15",
		visitCount: 4,
		status: "active",
		createdAt: "2024-11-01",
	},
];

interface CustomerContextType {
	customers: Customer[];
	activeCustomers: Customer[];
	addCustomer: (
		customer: Omit<Customer, "id" | "initials" | "visitCount" | "status" | "createdAt">,
	) => void;
	updateCustomer: (id: string, updates: Partial<Customer>) => void;
	deleteCustomer: (id: string) => void;
	searchCustomers: (query: string) => Customer[];
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
	const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

	const activeCustomers = useMemo(
		() => customers.filter((c) => c.status === "active"),
		[customers],
	);

	const addCustomer = useCallback(
		(customer: Omit<Customer, "id" | "initials" | "visitCount" | "status" | "createdAt">): void => {
			const newCustomer: Customer = {
				...customer,
				id: `cust-${String(Date.now())}`,
				initials: getInitials(customer.name),
				visitCount: 0,
				status: "active",
				createdAt: getToday(),
			};
			setCustomers((prev) => [...prev, newCustomer]);
		},
		[],
	);

	const updateCustomer = useCallback((id: string, updates: Partial<Customer>): void => {
		setCustomers((prev) =>
			prev.map((c) => {
				if (c.id !== id) return c;
				const updated = { ...c, ...updates };
				// 이름이 변경되면 이니셜도 업데이트
				if (updates.name) {
					updated.initials = getInitials(updates.name);
				}
				return updated;
			}),
		);
	}, []);

	const deleteCustomer = useCallback((id: string): void => {
		setCustomers((prev) => prev.filter((c) => c.id !== id));
	}, []);

	const searchCustomers = useCallback(
		(query: string): Customer[] => {
			if (!query.trim()) return activeCustomers;
			const lowerQuery = query.toLowerCase();
			return activeCustomers.filter(
				(c) => c.name.toLowerCase().includes(lowerQuery) || c.phone.includes(query),
			);
		},
		[activeCustomers],
	);

	return (
		<CustomerContext.Provider
			value={{
				customers,
				activeCustomers,
				addCustomer,
				updateCustomer,
				deleteCustomer,
				searchCustomers,
			}}
		>
			{children}
		</CustomerContext.Provider>
	);
}

export function useCustomers() {
	const context = useContext(CustomerContext);
	if (!context) {
		throw new Error("useCustomers must be used within a CustomerProvider");
	}
	return context;
}
