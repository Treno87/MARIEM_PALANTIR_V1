import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { productsApi } from "../api/endpoints";
import type { Product } from "../api/types";
import { createQueryWrapper } from "../test/test-utils";
import { productKeys, useCreateProduct, useProductsList, useUpdateProduct } from "./useProductsApi";

// Mock API endpoints
vi.mock("../api/endpoints", () => ({
	productsApi: {
		list: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
	},
}));

const mockProduct1: Product = {
	id: 1,
	name: "샴푸",
	kind: "retail",
	vendor_id: 1,
	vendor_name: "로레알",
	default_retail_unit_price: 15000,
	active: true,
	created_at: "2024-01-01T00:00:00Z",
	updated_at: "2024-01-01T00:00:00Z",
};

const mockProduct2: Product = {
	id: 2,
	name: "트리트먼트",
	kind: "both",
	vendor_id: 1,
	vendor_name: "로레알",
	default_retail_unit_price: 25000,
	active: true,
	created_at: "2024-01-02T00:00:00Z",
	updated_at: "2024-01-02T00:00:00Z",
};

const mockProducts: Product[] = [mockProduct1, mockProduct2];

describe("useProductsApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("productKeys", () => {
		it("generates correct query keys", () => {
			expect(productKeys.all).toEqual(["products"]);
			expect(productKeys.list()).toEqual(["products", "list", undefined]);
			expect(productKeys.list({ active: true })).toEqual(["products", "list", { active: true }]);
			expect(productKeys.list({ kind: "retail" })).toEqual([
				"products",
				"list",
				{ kind: "retail" },
			]);
			expect(productKeys.list({ for_sale: true })).toEqual([
				"products",
				"list",
				{ for_sale: true },
			]);
		});
	});

	describe("useProductsList", () => {
		it("fetches products list successfully", async () => {
			vi.mocked(productsApi.list).mockResolvedValue(mockProducts);

			const { result } = renderHook(() => useProductsList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockProducts);
			expect(productsApi.list).toHaveBeenCalledWith(undefined);
		});

		it("fetches products with active filter", async () => {
			vi.mocked(productsApi.list).mockResolvedValue([mockProduct1]);

			const { result } = renderHook(() => useProductsList({ active: true }), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(productsApi.list).toHaveBeenCalledWith({ active: true });
		});

		it("fetches products with kind filter", async () => {
			vi.mocked(productsApi.list).mockResolvedValue([mockProduct1]);

			const { result } = renderHook(() => useProductsList({ kind: "retail" }), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(productsApi.list).toHaveBeenCalledWith({ kind: "retail" });
		});

		it("fetches products with for_sale filter", async () => {
			vi.mocked(productsApi.list).mockResolvedValue(mockProducts);

			const { result } = renderHook(() => useProductsList({ for_sale: true }), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(productsApi.list).toHaveBeenCalledWith({ for_sale: true });
		});

		it("handles error state", async () => {
			const error = new Error("API Error");
			vi.mocked(productsApi.list).mockRejectedValue(error);

			const { result } = renderHook(() => useProductsList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useCreateProduct", () => {
		it("creates product successfully", async () => {
			const newProduct: Product = {
				id: 3,
				name: "헤어 에센스",
				kind: "retail",
				vendor_id: 2,
				vendor_name: "케라스타즈",
				default_retail_unit_price: 35000,
				active: true,
				created_at: "2024-01-03T00:00:00Z",
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(productsApi.create).mockResolvedValue(newProduct);

			const { result } = renderHook(() => useCreateProduct(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({
				name: "헤어 에센스",
				kind: "retail",
				vendor_id: 2,
				default_retail_unit_price: 35000,
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(newProduct);
			expect(vi.mocked(productsApi.create).mock.calls[0]?.[0]).toEqual({
				name: "헤어 에센스",
				kind: "retail",
				vendor_id: 2,
				default_retail_unit_price: 35000,
			});
		});

		it("handles mutation error", async () => {
			const error = new Error("Create failed");
			vi.mocked(productsApi.create).mockRejectedValue(error);

			const { result } = renderHook(() => useCreateProduct(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({
				name: "테스트",
				kind: "retail",
				vendor_id: 1,
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useUpdateProduct", () => {
		it("updates product successfully", async () => {
			const updatedProduct: Product = {
				...mockProduct1,
				name: "샴푸(수정)",
				default_retail_unit_price: 18000,
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(productsApi.update).mockResolvedValue(updatedProduct);

			const { result } = renderHook(() => useUpdateProduct(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({
				id: 1,
				data: { name: "샴푸(수정)", default_retail_unit_price: 18000 },
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(updatedProduct);
			expect(productsApi.update).toHaveBeenCalledWith(1, {
				name: "샴푸(수정)",
				default_retail_unit_price: 18000,
			});
		});

		it("handles update error", async () => {
			const error = new Error("Update failed");
			vi.mocked(productsApi.update).mockRejectedValue(error);

			const { result } = renderHook(() => useUpdateProduct(), {
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
