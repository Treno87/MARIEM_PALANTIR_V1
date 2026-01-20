import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { serviceCategoriesApi, servicesApi } from "../api/endpoints";
import type { Service, ServiceCategory } from "../api/types";
import { createQueryWrapper } from "../test/test-utils";
import {
	serviceCategoryKeys,
	serviceKeys,
	useCreateService,
	useCreateServiceCategory,
	useServiceCategoriesList,
	useServicesList,
	useUpdateService,
	useUpdateServiceCategory,
} from "./useServicesApi";

// Mock API endpoints
vi.mock("../api/endpoints", () => ({
	serviceCategoriesApi: {
		list: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
	},
	servicesApi: {
		list: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
	},
}));

const mockServiceCategory1: ServiceCategory = {
	id: 1,
	name: "커트",
	services_count: 3,
	created_at: "2024-01-01T00:00:00Z",
	updated_at: "2024-01-01T00:00:00Z",
};

const mockServiceCategory2: ServiceCategory = {
	id: 2,
	name: "펌",
	services_count: 2,
	created_at: "2024-01-02T00:00:00Z",
	updated_at: "2024-01-02T00:00:00Z",
};

const mockServiceCategories: ServiceCategory[] = [mockServiceCategory1, mockServiceCategory2];

const mockService1: Service = {
	id: 1,
	name: "여성 커트",
	service_category_id: 1,
	service_category_name: "커트",
	list_price: 30000,
	active: true,
	created_at: "2024-01-01T00:00:00Z",
	updated_at: "2024-01-01T00:00:00Z",
};

const mockService2: Service = {
	id: 2,
	name: "남성 커트",
	service_category_id: 1,
	service_category_name: "커트",
	list_price: 20000,
	active: true,
	created_at: "2024-01-02T00:00:00Z",
	updated_at: "2024-01-02T00:00:00Z",
};

const mockServices: Service[] = [mockService1, mockService2];

describe("useServicesApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("serviceCategoryKeys", () => {
		it("generates correct query keys", () => {
			expect(serviceCategoryKeys.all).toEqual(["serviceCategories"]);
			expect(serviceCategoryKeys.list()).toEqual(["serviceCategories", "list"]);
		});
	});

	describe("serviceKeys", () => {
		it("generates correct query keys", () => {
			expect(serviceKeys.all).toEqual(["services"]);
			expect(serviceKeys.list()).toEqual(["services", "list", undefined]);
			expect(serviceKeys.list({ active: true })).toEqual(["services", "list", { active: true }]);
			expect(serviceKeys.list({ category_id: 1 })).toEqual([
				"services",
				"list",
				{ category_id: 1 },
			]);
		});
	});

	describe("useServiceCategoriesList", () => {
		it("fetches service categories successfully", async () => {
			vi.mocked(serviceCategoriesApi.list).mockResolvedValue(mockServiceCategories);

			const { result } = renderHook(() => useServiceCategoriesList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockServiceCategories);
			expect(serviceCategoriesApi.list).toHaveBeenCalled();
		});

		it("handles error state", async () => {
			const error = new Error("API Error");
			vi.mocked(serviceCategoriesApi.list).mockRejectedValue(error);

			const { result } = renderHook(() => useServiceCategoriesList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useCreateServiceCategory", () => {
		it("creates service category successfully", async () => {
			const newCategory: ServiceCategory = {
				id: 3,
				name: "염색",
				services_count: 0,
				created_at: "2024-01-03T00:00:00Z",
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(serviceCategoriesApi.create).mockResolvedValue(newCategory);

			const { result } = renderHook(() => useCreateServiceCategory(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({ name: "염색" });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(newCategory);
			expect(vi.mocked(serviceCategoriesApi.create).mock.calls[0]?.[0]).toEqual({
				name: "염색",
			});
		});
	});

	describe("useUpdateServiceCategory", () => {
		it("updates service category successfully", async () => {
			const updatedCategory: ServiceCategory = {
				...mockServiceCategory1,
				name: "커트(수정)",
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(serviceCategoriesApi.update).mockResolvedValue(updatedCategory);

			const { result } = renderHook(() => useUpdateServiceCategory(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({ id: 1, data: { name: "커트(수정)" } });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(updatedCategory);
			expect(serviceCategoriesApi.update).toHaveBeenCalledWith(1, {
				name: "커트(수정)",
			});
		});
	});

	describe("useServicesList", () => {
		it("fetches services list successfully", async () => {
			vi.mocked(servicesApi.list).mockResolvedValue(mockServices);

			const { result } = renderHook(() => useServicesList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockServices);
			expect(servicesApi.list).toHaveBeenCalledWith(undefined);
		});

		it("fetches services with params", async () => {
			vi.mocked(servicesApi.list).mockResolvedValue([mockService1]);

			const { result } = renderHook(() => useServicesList({ active: true, category_id: 1 }), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(servicesApi.list).toHaveBeenCalledWith({
				active: true,
				category_id: 1,
			});
		});

		it("handles error state", async () => {
			const error = new Error("API Error");
			vi.mocked(servicesApi.list).mockRejectedValue(error);

			const { result } = renderHook(() => useServicesList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useCreateService", () => {
		it("creates service successfully", async () => {
			const newService: Service = {
				id: 3,
				name: "디자이너 커트",
				service_category_id: 1,
				service_category_name: "커트",
				list_price: 50000,
				active: true,
				created_at: "2024-01-03T00:00:00Z",
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(servicesApi.create).mockResolvedValue(newService);

			const { result } = renderHook(() => useCreateService(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({
				name: "디자이너 커트",
				service_category_id: 1,
				list_price: 50000,
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(newService);
			expect(vi.mocked(servicesApi.create).mock.calls[0]?.[0]).toEqual({
				name: "디자이너 커트",
				service_category_id: 1,
				list_price: 50000,
			});
		});

		it("handles mutation error", async () => {
			const error = new Error("Create failed");
			vi.mocked(servicesApi.create).mockRejectedValue(error);

			const { result } = renderHook(() => useCreateService(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({
				name: "테스트",
				service_category_id: 1,
				list_price: 10000,
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useUpdateService", () => {
		it("updates service successfully", async () => {
			const updatedService: Service = {
				...mockService1,
				name: "여성 커트(수정)",
				list_price: 35000,
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(servicesApi.update).mockResolvedValue(updatedService);

			const { result } = renderHook(() => useUpdateService(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({
				id: 1,
				data: { name: "여성 커트(수정)", list_price: 35000 },
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(updatedService);
			expect(servicesApi.update).toHaveBeenCalledWith(1, {
				name: "여성 커트(수정)",
				list_price: 35000,
			});
		});

		it("handles update error", async () => {
			const error = new Error("Update failed");
			vi.mocked(servicesApi.update).mockRejectedValue(error);

			const { result } = renderHook(() => useUpdateService(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({ id: 1, data: { name: "실패" } });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});
});
