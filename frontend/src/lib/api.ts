/**
 * API 클라이언트 설정
 */

const envUrl = import.meta.env["VITE_API_URL"] as string | undefined;
const API_BASE_URL = envUrl !== undefined && envUrl !== "" ? envUrl : "http://localhost:3000";

interface RequestOptions extends RequestInit {
	params?: Record<string, string>;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		const { params, ...fetchOptions } = options;

		let url = `${this.baseUrl}${endpoint}`;
		if (params) {
			const searchParams = new URLSearchParams(params);
			url += `?${searchParams.toString()}`;
		}

		const headers: HeadersInit = {
			"Content-Type": "application/json",
			...(fetchOptions.headers as Record<string, string> | undefined),
		};

		const response = await fetch(url, {
			...fetchOptions,
			headers,
		});

		if (!response.ok) {
			throw new Error(`API Error: ${String(response.status)} ${response.statusText}`);
		}

		return response.json() as Promise<T>;
	}

	get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "GET" });
	}

	post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "DELETE" });
	}
}

export const api = new ApiClient(API_BASE_URL);
export default api;
