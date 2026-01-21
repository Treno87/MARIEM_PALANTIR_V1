import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { Gender } from "../components/sale/types";

export type CustomerTier = "vip" | "gold" | "silver" | "bronze";

export interface Customer {
	id: string;
	name: string;
	phone: string;
	initials: string;
	gender?: Gender;
	birthDate?: string;
	memo?: string;
	storedValue?: number;
	storedValueInitial?: number; // 정액권 최초 충전 금액
	totalSpent: number; // 누적 결제 금액 (LTV)
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

// LTV 기반 고객 등급 계산 (누적 결제 금액 기준)
export const getCustomerTier = (totalSpent: number): CustomerTier => {
	if (totalSpent >= 1000000) return "vip"; // 100만원 이상
	if (totalSpent >= 500000) return "gold"; // 50만원 이상
	if (totalSpent >= 200000) return "silver"; // 20만원 이상
	return "bronze"; // 20만원 미만
};

export const tierConfig: Record<CustomerTier, { label: string; color: string; bgColor: string }> = {
	vip: { label: "VIP", color: "text-amber-700", bgColor: "bg-amber-100" },
	gold: { label: "Gold", color: "text-yellow-700", bgColor: "bg-yellow-100" },
	silver: { label: "Silver", color: "text-gray-600", bgColor: "bg-gray-200" },
	bronze: {
		label: "Bronze",
		color: "text-orange-700",
		bgColor: "bg-orange-100",
	},
};

// 활성/비활성 자동 판단 (90일 기준)
export const getAutoStatus = (lastVisitDate?: string): "active" | "inactive" => {
	if (!lastVisitDate) return "inactive";
	const lastVisit = new Date(lastVisitDate);
	const today = new Date();
	const diffDays = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
	return diffDays <= 90 ? "active" : "inactive";
};

// 마지막 방문 후 경과 일수
export const getDaysSinceLastVisit = (lastVisitDate?: string): number | null => {
	if (!lastVisitDate) return null;
	const lastVisit = new Date(lastVisitDate);
	const today = new Date();
	return Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
};

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

// 오늘 날짜: 2026-01-22 기준 세그먼트별 고객 분포
// - 휴면위험: lastVisitDate 90일+ 전 (2025-10-24 이전)
// - 생일임박: birthDate 7-14일 후 (1/29 ~ 2/5)
// - 정액권부족: storedValue <= storedValueInitial * 0.2
// - 신규미정착: firstVisitDate 30일 내 + visitCount = 1
const initialCustomers: Customer[] = [
	// ===== 정상 고객 (세그먼트 없음) =====
	{
		id: "1",
		name: "김민지",
		phone: "010-1234-5678",
		initials: "민지",
		gender: "female",
		birthDate: "1992-05-15",
		storedValue: 150000,
		storedValueInitial: 300000,
		totalSpent: 720000,
		membership: { name: "펌 정기권", used: 2, total: 10 },
		firstVisitDate: "2025-03-15",
		lastVisitDate: "2026-01-10",
		visitCount: 12,
		status: "active",
		createdAt: "2025-03-15",
	},
	{
		id: "2",
		name: "이서연",
		phone: "010-2345-6789",
		initials: "서연",
		gender: "female",
		birthDate: "1988-11-22",
		storedValue: 80000,
		storedValueInitial: 200000,
		totalSpent: 320000,
		firstVisitDate: "2025-06-20",
		lastVisitDate: "2026-01-15",
		visitCount: 8,
		status: "active",
		createdAt: "2025-06-20",
	},
	{
		id: "3",
		name: "한소희",
		phone: "010-6789-0123",
		initials: "소희",
		gender: "female",
		birthDate: "1994-06-18",
		storedValue: 300000,
		storedValueInitial: 500000,
		totalSpent: 1200000,
		membership: { name: "염색 정기권", used: 1, total: 5 },
		firstVisitDate: "2025-02-14",
		lastVisitDate: "2026-01-12",
		visitCount: 15,
		status: "active",
		createdAt: "2025-02-14",
	},
	{
		id: "4",
		name: "송지효",
		phone: "010-9012-3456",
		initials: "지효",
		gender: "female",
		birthDate: "1981-03-15",
		totalSpent: 2100000,
		membership: { name: "프리미엄 회원권", used: 8, total: 20 },
		memo: "VIP 고객 - 특별 관리",
		firstVisitDate: "2024-06-10",
		lastVisitDate: "2026-01-14",
		visitCount: 28,
		status: "active",
		createdAt: "2024-06-10",
	},
	{
		id: "5",
		name: "유재석",
		phone: "010-0123-4567",
		initials: "재석",
		gender: "male",
		birthDate: "1972-08-14",
		storedValue: 500000,
		storedValueInitial: 1000000,
		totalSpent: 2800000,
		firstVisitDate: "2024-01-05",
		lastVisitDate: "2026-01-16",
		visitCount: 35,
		status: "active",
		createdAt: "2024-01-05",
	},

	// ===== 휴면 위험 (churn_risk) - 90일+ 미방문 =====
	{
		id: "6",
		name: "최수현",
		phone: "010-4567-8901",
		initials: "수현",
		gender: "female",
		birthDate: "1990-07-30",
		totalSpent: 120000,
		memo: "염색 알러지 있음 - 패치테스트 필수",
		firstVisitDate: "2025-01-10",
		lastVisitDate: "2025-08-15", // 160일+ 전
		visitCount: 3,
		status: "inactive",
		createdAt: "2025-01-10",
	},
	{
		id: "7",
		name: "박보검",
		phone: "010-5555-6666",
		initials: "보검",
		gender: "male",
		birthDate: "1993-06-16",
		totalSpent: 140000,
		firstVisitDate: "2025-07-10",
		lastVisitDate: "2025-10-05", // 109일 전
		visitCount: 4,
		status: "inactive",
		createdAt: "2025-07-10",
	},
	{
		id: "8",
		name: "김연아",
		phone: "010-2222-3333",
		initials: "연아",
		gender: "female",
		birthDate: "1990-09-05",
		storedValue: 250000,
		storedValueInitial: 500000,
		totalSpent: 480000,
		memo: "긴 머리 - 시술 시간 여유있게",
		firstVisitDate: "2025-04-01",
		lastVisitDate: "2025-09-20", // 124일 전
		visitCount: 6,
		status: "active",
		createdAt: "2025-04-01",
	},

	// ===== 생일 임박 (birthday_upcoming) - 7~14일 후 생일 =====
	{
		id: "9",
		name: "정다은",
		phone: "010-5678-9012",
		initials: "다은",
		gender: "female",
		birthDate: "1997-01-30", // 8일 후 생일
		storedValue: 200000,
		storedValueInitial: 400000,
		totalSpent: 240000,
		firstVisitDate: "2025-11-01",
		lastVisitDate: "2026-01-15",
		visitCount: 4,
		status: "active",
		createdAt: "2025-11-01",
	},
	{
		id: "10",
		name: "장원영",
		phone: "010-7890-1234",
		initials: "원영",
		gender: "female",
		birthDate: "2004-02-01", // 10일 후 생일
		totalSpent: 90000,
		memo: "학생 할인 적용",
		firstVisitDate: "2025-10-05",
		lastVisitDate: "2026-01-08",
		visitCount: 3,
		status: "active",
		createdAt: "2025-10-05",
	},
	{
		id: "11",
		name: "아이유",
		phone: "010-4444-5555",
		initials: "IU",
		gender: "female",
		birthDate: "1993-02-04", // 13일 후 생일
		storedValue: 180000,
		storedValueInitial: 300000,
		totalSpent: 980000,
		membership: { name: "스타일링 정기권", used: 4, total: 8 },
		firstVisitDate: "2025-01-20",
		lastVisitDate: "2026-01-13",
		visitCount: 14,
		status: "active",
		createdAt: "2025-01-20",
	},

	// ===== 정액권 부족 (low_balance) - 잔액 20% 이하 =====
	{
		id: "12",
		name: "박지우",
		phone: "010-3456-7890",
		initials: "지우",
		gender: "male",
		birthDate: "1995-03-08",
		storedValue: 30000, // 10% 남음 (초기 300,000)
		storedValueInitial: 300000,
		totalSpent: 150000,
		membership: { name: "커트 회원권", used: 5, total: 12 },
		firstVisitDate: "2025-09-01",
		lastVisitDate: "2026-01-05",
		visitCount: 5,
		status: "active",
		createdAt: "2025-09-01",
	},
	{
		id: "13",
		name: "김태형",
		phone: "010-8901-2345",
		initials: "태형",
		gender: "male",
		birthDate: "1991-12-30",
		storedValue: 20000, // 10% 남음 (초기 200,000)
		storedValueInitial: 200000,
		totalSpent: 280000,
		firstVisitDate: "2025-05-20",
		lastVisitDate: "2026-01-18",
		visitCount: 7,
		status: "active",
		createdAt: "2025-05-20",
	},
	{
		id: "14",
		name: "수지",
		phone: "010-8888-9999",
		initials: "수지",
		gender: "female",
		birthDate: "1994-10-10",
		storedValue: 15000, // 15% 남음 (초기 100,000)
		storedValueInitial: 100000,
		totalSpent: 210000,
		firstVisitDate: "2025-09-20",
		lastVisitDate: "2026-01-07",
		visitCount: 5,
		status: "active",
		createdAt: "2025-09-20",
	},

	// ===== 신규 미정착 (new_unsettled) - 30일 내 첫 방문, 재방문 없음 =====
	{
		id: "15",
		name: "손흥민",
		phone: "010-3333-4444",
		initials: "흥민",
		gender: "male",
		birthDate: "1992-07-08",
		totalSpent: 60000,
		firstVisitDate: "2026-01-05", // 17일 전 첫 방문
		lastVisitDate: "2026-01-05",
		visitCount: 1,
		status: "active",
		createdAt: "2026-01-05",
	},
	{
		id: "16",
		name: "김고은",
		phone: "010-1010-2020",
		initials: "고은",
		gender: "female",
		birthDate: "1991-07-02",
		totalSpent: 80000,
		firstVisitDate: "2026-01-10", // 12일 전 첫 방문
		lastVisitDate: "2026-01-10",
		visitCount: 1,
		status: "active",
		createdAt: "2026-01-10",
	},
	{
		id: "17",
		name: "이도현",
		phone: "010-1212-3434",
		initials: "도현",
		gender: "male",
		birthDate: "1997-04-11",
		totalSpent: 45000,
		firstVisitDate: "2025-12-28", // 25일 전 첫 방문
		lastVisitDate: "2025-12-28",
		visitCount: 1,
		status: "active",
		createdAt: "2025-12-28",
	},

	// ===== 복합 세그먼트 (여러 조건 충족) =====
	{
		id: "18",
		name: "전지현",
		phone: "010-6666-7777",
		initials: "지현",
		gender: "female",
		birthDate: "1981-01-29", // 7일 후 생일 + 정액권 부족
		storedValue: 50000, // 12.5% 남음 (초기 400,000)
		storedValueInitial: 400000,
		totalSpent: 1800000,
		memo: "프리미엄 케어 선호",
		firstVisitDate: "2024-09-15",
		lastVisitDate: "2026-01-11",
		visitCount: 20,
		status: "active",
		createdAt: "2024-09-15",
	},
	{
		id: "19",
		name: "이종석",
		phone: "010-7777-8888",
		initials: "종석",
		gender: "male",
		birthDate: "1989-02-03", // 12일 후 생일 + 휴면 위험
		totalSpent: 320000,
		membership: { name: "남성 커트 정기권", used: 6, total: 12 },
		firstVisitDate: "2025-03-01",
		lastVisitDate: "2025-10-01", // 113일 전
		visitCount: 8,
		status: "active",
		createdAt: "2025-03-01",
	},
	{
		id: "20",
		name: "공유",
		phone: "010-9999-0000",
		initials: "공유",
		gender: "male",
		birthDate: "1979-07-10",
		storedValue: 40000, // 11% 남음 + 휴면 위험
		storedValueInitial: 350000,
		totalSpent: 1500000,
		membership: { name: "프리미엄 회원권", used: 3, total: 10 },
		memo: "조용한 시간대 선호",
		firstVisitDate: "2024-11-01",
		lastVisitDate: "2025-09-25", // 119일 전
		visitCount: 18,
		status: "active",
		createdAt: "2024-11-01",
	},
];

interface CustomerContextType {
	customers: Customer[];
	activeCustomers: Customer[];
	addCustomer: (
		customer: Omit<
			Customer,
			"id" | "initials" | "visitCount" | "status" | "createdAt" | "totalSpent"
		>,
	) => string; // 새로 생성된 고객 ID 반환
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
		(
			customer: Omit<
				Customer,
				"id" | "initials" | "visitCount" | "status" | "createdAt" | "totalSpent"
			>,
		): string => {
			const newId = `cust-${String(Date.now())}`;
			const newCustomer: Customer = {
				...customer,
				id: newId,
				initials: getInitials(customer.name),
				visitCount: 0,
				totalSpent: 0, // 신규 고객은 누적 결제 0원
				status: "active",
				createdAt: getToday(),
			};
			setCustomers((prev) => [...prev, newCustomer]);
			return newId;
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
