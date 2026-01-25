// 공통 타입
export interface Customer {
	id: number;
	name: string;
	phone: string;
	memo: string | null;
	created_at: string;
	updated_at: string;
}

export interface StaffMember {
	id: number;
	name: string;
	phone: string | null;
	active: boolean;
}

export interface ServiceCategory {
	id: number;
	name: string;
	services_count: number;
	created_at: string;
	updated_at: string;
}

export interface Service {
	id: number;
	name: string;
	service_category_id: number;
	service_category_name: string;
	list_price: number;
	active: boolean;
	created_at: string;
	updated_at: string;
}

export interface Product {
	id: number;
	name: string;
	kind: "retail" | "consumable" | "both";
	vendor_id: number;
	vendor_name: string | null;
	default_retail_unit_price: number;
	active: boolean;
	created_at: string;
	updated_at: string;
}

export interface LineItem {
	id: number;
	item_type: "service" | "product";
	service_id: number | null;
	product_id: number | null;
	staff_id: number | null;
	item_name: string;
	qty: number;
	list_unit_price: number;
	net_unit_price: number;
	discount_rate: number;
	discount_amount: number;
	net_total: number;
}

export interface Payment {
	id: number;
	method: string;
	method_label: string;
	amount: number;
}

export type VisitType = "new" | "returning" | "substitute";

export interface Visit {
	id: number;
	visited_at: string;
	status: "draft" | "finalized";
	visit_type: VisitType | null;
	voided: boolean;
	voided_at: string | null;
	subtotal_amount: number;
	total_amount: number;
	paid_amount?: number;
	remaining_amount?: number;
	customer: {
		id: number;
		name: string;
		phone: string;
	};
	line_items?: LineItem[];
	payments?: Payment[];
	line_items_count?: number;
	payments_count?: number;
	created_at: string;
	updated_at: string;
}

// 리포트 타입
export interface DailyReport {
	date: string;
	total_sales: number;
	visit_count: number;
	total_payments: number;
}

export interface MonthlyReport {
	year: number;
	month: number;
	total_sales: number;
	visit_count: number;
	total_payments: number;
}

export interface StaffSales {
	staff_id: number | null;
	staff_name: string;
	total_sales: number;
	item_count: number;
}

export interface MethodSales {
	method: string;
	method_label: string;
	total_amount: number;
	payment_count: number;
}

// 인증 타입
export interface User {
	id: number;
	email: string;
	name: string;
	store_id: number;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	user: User;
	token: string;
}

// 요청 타입
export interface CreateVisitRequest {
	customer_id: number;
	visited_at: string;
	status?: "draft" | "finalized";
	line_items: {
		item_type: "service" | "product";
		service_id?: number;
		product_id?: number;
		staff_id?: number;
		qty: number;
		discount_rate?: number;
		discount_amount?: number;
	}[];
	payments: {
		method: string;
		amount: number;
	}[];
}
