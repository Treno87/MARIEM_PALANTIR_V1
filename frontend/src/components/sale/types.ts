export interface Customer {
	id: string;
	name: string;
	phone: string;
	initials: string;
	memo?: string;
	storedValue?: number;
	membership?: {
		name: string;
		used: number;
		total: number;
	};
}

// 항목별 결제수단 타입
export type ItemPaymentMethod =
	| "card"
	| "cash"
	| "transfer"
	| "npay"
	| "stored_value"
	| "membership"
	| "other";

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	type: "service" | "product" | "topup";
	category?: string;
	topupType?: "stored_value" | "membership";
	topupValue?: number;

	// 항목별 결제/할인 설정
	paymentMethod: ItemPaymentMethod;
	eventId?: string | undefined;
	discountAmount: number;
	finalPrice: number;
	membershipEligible?: boolean | undefined; // 정기권 사용 가능 여부
}

export interface Payment {
	method: string;
	amount: number;
}

// 기존 Designer (하위 호환)
export interface Designer {
	id: string;
	name: string;
	color: string;
}

// 직원 관련 타입
export type StaffRole = "owner" | "manager" | "designer" | "intern" | "staff";
export type EmploymentStatus = "active" | "resigned";
export type Gender = "male" | "female" | "other" | "unspecified";

export interface StaffPermissions {
	sales: boolean;
	customers: boolean;
	reports: boolean;
	settings: boolean;
}

export interface Staff {
	id: string;
	name: string;
	role: StaffRole;
	phone?: string | undefined;
	color: string;
	joinDate?: string | undefined;
	resignationDate?: string | undefined;
	employmentStatus: EmploymentStatus;
	showInSales: boolean;
	displayOrder: number;
	gender?: Gender | undefined;
	birthDate?: string | undefined;
	address?: string | undefined;
	memo?: string | undefined;
	permissions?: StaffPermissions | undefined;
}

export interface ServiceItem {
	id: string;
	name: string;
	price: number;
	membershipEligible?: boolean; // 정기권 사용 가능 여부
}

// 할인 이벤트
export interface DiscountEvent {
	id: string;
	name: string;
	discountType: "percent" | "amount";
	discountValue: number;
	applicableTo?: string[]; // 적용 가능한 시술/상품 ID (없으면 전체)
}

export interface ServiceCategory {
	id: string;
	name: string;
	color: string;
	items: ServiceItem[];
}

export interface ProductItem {
	id: string;
	name: string;
	price: number;
}

export interface ProductBrand {
	id: string;
	name: string;
	items: ProductItem[];
}

export interface ProductCategory {
	id: string;
	name: string;
	color: string;
	brands: ProductBrand[];
}

export interface PaymentMethod {
	id: string;
	label: string;
	color: string;
}

export interface StoredValueOption {
	id: string;
	name: string;
	price: number;
	value: number;
}

export interface MembershipOption {
	id: string;
	name: string;
	price: number;
	count: number;
}

export type DiscountType = "percent" | "amount";
export type ActiveTab = "service" | "product" | "membership";

// 거래 내역 관련 타입
export type SaleStatus = "completed" | "voided" | "refunded";

export type CustomerType = "new" | "returning" | "substitute";

export interface SaleRecord {
	id: string;
	saleDate: string; // YYYY-MM-DD
	customer: {
		id: string;
		name: string;
		phone: string;
		type: CustomerType; // 신규/재방문
	};
	staff: {
		id: string;
		name: string;
		color: string;
	};
	items: {
		name: string;
		quantity: number;
		unitPrice: number;
		lineTotal: number;
		type: "service" | "product" | "topup";
	}[];
	subtotal: number;
	discountAmount: number;
	total: number;
	payments: {
		method: string;
		amount: number;
	}[];
	status: SaleStatus;
	note?: string;
	createdAt: string;
}
