import axios, { type AxiosError } from "axios";

const API_BASE_URL: string = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "/api";

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// 요청 인터셉터: JWT 토큰 추가
apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem("authToken");
	if (token !== null && token !== "") {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("authToken");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

// API 응답 타입
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}
