/**
 * 공통 타입 정의
 */

// 고객
export interface Customer {
	id: number;
	name: string;
	phone: string;
	status: "active" | "inactive";
	first_visit_at?: string;
	created_at: string;
	updated_at: string;
}

// 직원/디자이너
export interface User {
	id: number;
	email: string;
	name: string;
	role: "owner" | "manager" | "staff" | "viewer";
	created_at: string;
}

// 카탈로그 카테고리
export interface CatalogCategory {
	id: number;
	name: string;
}

// 카탈로그 아이템 (시술/상품)
export interface CatalogItem {
	id: number;
	category_id: number;
	kind: "service" | "product";
	name: string;
	base_price: number;
	is_active: boolean;
}

// 거래 라인 아이템
export interface SaleItem {
	id?: number;
	catalog_item_id?: number;
	kind: "service" | "product";
	name: string;
	quantity: number;
	unit_price: number;
	line_total: number;
}

// 할인
export interface SaleDiscount {
	id?: number;
	discount_type: "percent" | "amount";
	value: number;
	reason?: string;
}

// 결제
export interface Payment {
	id?: number;
	method: "cash" | "card" | "transfer" | "stored_value" | "giftcard" | "other";
	amount: number;
	paid_at?: string;
}

// 거래
export interface Sale {
	id: number;
	customer_id?: number;
	customer?: Customer;
	staff_id: number;
	staff?: User;
	sale_date: string;
	status: "completed" | "voided" | "refunded";
	items: SaleItem[];
	discounts: SaleDiscount[];
	payments: Payment[];
	note?: string;
	created_at: string;
}

// 정액권 계좌
export interface StoredValueAccount {
	id: number;
	customer_id: number;
	balance: number;
}

// 리포트 데이터
export interface DailyReport {
	date: string;
	total_sales: number;
	total_transactions: number;
	by_staff: { staff_id: number; name: string; amount: number }[];
	by_method: { method: string; amount: number }[];
	by_category: { category_id: number; name: string; amount: number }[];
}

// API 응답 래퍼
export interface ApiResponse<T> {
	data: T;
	meta?: {
		total: number;
		page: number;
		per_page: number;
	};
}

// 에러 응답
export interface ApiError {
	error: string;
	message: string;
	details?: Record<string, string[]>;
}
