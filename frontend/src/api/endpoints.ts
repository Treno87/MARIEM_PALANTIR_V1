import { type ApiResponse, apiClient } from "./client";
import type {
	CreateVisitRequest,
	Customer,
	DailyReport,
	MethodSales,
	MonthlyReport,
	Product,
	Service,
	ServiceCategory,
	StaffMember,
	StaffSales,
	User,
	Visit,
} from "./types";

// 인증 API
export const authApi = {
	signIn: async (email: string, password: string) => {
		const response = await apiClient.post<
			ApiResponse<{ user: User }>,
			{ data: ApiResponse<{ user: User }>; headers: { authorization?: string } }
		>("/auth/sign_in", {
			user: { email, password },
		});
		const token = response.headers.authorization?.replace("Bearer ", "");
		return { user: response.data.data.user, token };
	},

	signOut: async () => {
		await apiClient.delete("/auth/sign_out");
		localStorage.removeItem("authToken");
	},

	me: async () => {
		const response = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
		return response.data.data.user;
	},
};

// 고객 API
export const customersApi = {
	list: async (query?: string) => {
		const params = query !== undefined && query !== "" ? { q: query } : {};
		const response = await apiClient.get<ApiResponse<{ customers: Customer[] }>>("/customers", {
			params,
		});
		return response.data.data.customers;
	},

	get: async (id: number) => {
		const response = await apiClient.get<ApiResponse<{ customer: Customer }>>(
			`/customers/${String(id)}`,
		);
		return response.data.data.customer;
	},

	create: async (data: { name: string; phone: string; memo?: string }) => {
		const response = await apiClient.post<ApiResponse<{ customer: Customer }>>("/customers", {
			customer: data,
		});
		return response.data.data.customer;
	},

	update: async (id: number, data: { name?: string; phone?: string; memo?: string }) => {
		const response = await apiClient.patch<ApiResponse<{ customer: Customer }>>(
			`/customers/${String(id)}`,
			{ customer: data },
		);
		return response.data.data.customer;
	},
};

// 직원 API
export const staffMembersApi = {
	list: async () => {
		const response =
			await apiClient.get<ApiResponse<{ staff_members: StaffMember[] }>>("/staff_members");
		return response.data.data.staff_members;
	},

	get: async (id: number) => {
		const response = await apiClient.get<ApiResponse<{ staff_member: StaffMember }>>(
			`/staff_members/${String(id)}`,
		);
		return response.data.data.staff_member;
	},
};

// 서비스 카테고리 API
export const serviceCategoriesApi = {
	list: async () => {
		const response =
			await apiClient.get<ApiResponse<{ service_categories: ServiceCategory[] }>>(
				"/service_categories",
			);
		return response.data.data.service_categories;
	},

	create: async (data: { name: string }) => {
		const response = await apiClient.post<ApiResponse<{ service_category: ServiceCategory }>>(
			"/service_categories",
			{ service_category: data },
		);
		return response.data.data.service_category;
	},

	update: async (id: number, data: { name: string }) => {
		const response = await apiClient.patch<ApiResponse<{ service_category: ServiceCategory }>>(
			`/service_categories/${String(id)}`,
			{ service_category: data },
		);
		return response.data.data.service_category;
	},
};

// 서비스 API
export const servicesApi = {
	list: async (params?: { active?: boolean; category_id?: number }) => {
		const response = await apiClient.get<ApiResponse<{ services: Service[] }>>("/services", {
			params,
		});
		return response.data.data.services;
	},

	create: async (data: {
		name: string;
		service_category_id: number;
		list_price: number;
		active?: boolean;
	}) => {
		const response = await apiClient.post<ApiResponse<{ service: Service }>>("/services", {
			service: data,
		});
		return response.data.data.service;
	},

	update: async (
		id: number,
		data: {
			name?: string;
			service_category_id?: number;
			list_price?: number;
			active?: boolean;
		},
	) => {
		const response = await apiClient.patch<ApiResponse<{ service: Service }>>(
			`/services/${String(id)}`,
			{ service: data },
		);
		return response.data.data.service;
	},
};

// 제품 API
export const productsApi = {
	list: async (params?: { active?: boolean; kind?: string; for_sale?: boolean }) => {
		const response = await apiClient.get<ApiResponse<{ products: Product[] }>>("/products", {
			params,
		});
		return response.data.data.products;
	},

	create: async (data: {
		name: string;
		kind: string;
		vendor_id: number;
		default_retail_unit_price?: number;
		active?: boolean;
	}) => {
		const response = await apiClient.post<ApiResponse<{ product: Product }>>("/products", {
			product: data,
		});
		return response.data.data.product;
	},

	update: async (
		id: number,
		data: {
			name?: string;
			kind?: string;
			default_retail_unit_price?: number;
			active?: boolean;
		},
	) => {
		const response = await apiClient.patch<ApiResponse<{ product: Product }>>(
			`/products/${String(id)}`,
			{ product: data },
		);
		return response.data.data.product;
	},
};

// 거래 API
export const visitsApi = {
	list: async (params?: { date?: string; status?: string }) => {
		const response = await apiClient.get<ApiResponse<{ visits: Visit[] }>>("/visits", { params });
		return response.data.data.visits;
	},

	get: async (id: number) => {
		const response = await apiClient.get<ApiResponse<{ visit: Visit }>>(`/visits/${String(id)}`);
		return response.data.data.visit;
	},

	create: async (data: CreateVisitRequest) => {
		const response = await apiClient.post<ApiResponse<{ visit: Visit }>>("/visits", {
			visit: data,
		});
		return response.data.data.visit;
	},

	void: async (id: number) => {
		const response = await apiClient.put<ApiResponse<{ visit: Visit }>>(
			`/visits/${String(id)}/void`,
		);
		return response.data.data.visit;
	},
};

// 리포트 API
export const reportsApi = {
	daily: async (date?: string) => {
		const params = date !== undefined ? { date } : {};
		const response = await apiClient.get<ApiResponse<{ report: DailyReport }>>("/reports/daily", {
			params,
		});
		return response.data.data.report;
	},

	monthly: async (year?: number, month?: number) => {
		const params: { year?: number; month?: number } = {};
		if (year !== undefined) params.year = year;
		if (month !== undefined) params.month = month;
		const response = await apiClient.get<ApiResponse<{ report: MonthlyReport }>>(
			"/reports/monthly",
			{ params },
		);
		return response.data.data.report;
	},

	byStaff: async (date?: string) => {
		const params = date !== undefined ? { date } : {};
		const response = await apiClient.get<
			ApiResponse<{ report: { date: string; staff_sales: StaffSales[] } }>
		>("/reports/by_staff", { params });
		return response.data.data.report;
	},

	byMethod: async (date?: string) => {
		const params = date !== undefined ? { date } : {};
		const response = await apiClient.get<
			ApiResponse<{ report: { date: string; method_sales: MethodSales[] } }>
		>("/reports/by_method", { params });
		return response.data.data.report;
	},
};
