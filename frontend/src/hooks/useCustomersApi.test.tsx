import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { customersApi } from "../api/endpoints";
import type { Customer } from "../api/types";
import { createQueryWrapper } from "../test/test-utils";
import {
	customerKeys,
	useCreateCustomer,
	useCustomer,
	useCustomersList,
	useUpdateCustomer,
} from "./useCustomersApi";

// Mock API endpoints
vi.mock("../api/endpoints", () => ({
	customersApi: {
		list: vi.fn(),
		get: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
	},
}));

const mockCustomer1: Customer = {
	id: 1,
	name: "김철수",
	phone: "010-1234-5678",
	memo: "",
	created_at: "2024-01-01T00:00:00Z",
	updated_at: "2024-01-01T00:00:00Z",
};

const mockCustomer2: Customer = {
	id: 2,
	name: "이영희",
	phone: "010-8765-4321",
	memo: "VIP",
	created_at: "2024-01-02T00:00:00Z",
	updated_at: "2024-01-02T00:00:00Z",
};

const mockCustomers: Customer[] = [mockCustomer1, mockCustomer2];

describe("useCustomersApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("customerKeys", () => {
		it("generates correct query keys", () => {
			expect(customerKeys.all).toEqual(["customers"]);
			expect(customerKeys.list()).toEqual(["customers", "list", undefined]);
			expect(customerKeys.list("김")).toEqual(["customers", "list", "김"]);
			expect(customerKeys.detail(1)).toEqual(["customers", "detail", 1]);
		});
	});

	describe("useCustomersList", () => {
		it("fetches customers list successfully", async () => {
			vi.mocked(customersApi.list).mockResolvedValue(mockCustomers);

			const { result } = renderHook(() => useCustomersList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockCustomers);
			expect(customersApi.list).toHaveBeenCalledWith(undefined);
		});

		it("fetches customers with search query", async () => {
			const searchResult: Customer[] = [mockCustomer1];
			vi.mocked(customersApi.list).mockResolvedValue(searchResult);

			const { result } = renderHook(() => useCustomersList("김"), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(searchResult);
			expect(customersApi.list).toHaveBeenCalledWith("김");
		});

		it("handles error state", async () => {
			const error = new Error("API Error");
			vi.mocked(customersApi.list).mockRejectedValue(error);

			const { result } = renderHook(() => useCustomersList(), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useCustomer", () => {
		it("fetches single customer by id", async () => {
			vi.mocked(customersApi.get).mockResolvedValue(mockCustomer1);

			const { result } = renderHook(() => useCustomer(1), {
				wrapper: createQueryWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockCustomer1);
			expect(customersApi.get).toHaveBeenCalledWith(1);
		});

		it("does not fetch when id is 0", () => {
			const { result } = renderHook(() => useCustomer(0), {
				wrapper: createQueryWrapper(),
			});

			// Query should not be enabled
			expect(result.current.fetchStatus).toBe("idle");
			expect(customersApi.get).not.toHaveBeenCalled();
		});

		it("does not fetch when id is negative", () => {
			const { result } = renderHook(() => useCustomer(-1), {
				wrapper: createQueryWrapper(),
			});

			expect(result.current.fetchStatus).toBe("idle");
			expect(customersApi.get).not.toHaveBeenCalled();
		});
	});

	describe("useCreateCustomer", () => {
		it("creates customer successfully", async () => {
			const newCustomer: Customer = {
				id: 3,
				name: "박지민",
				phone: "010-1111-2222",
				memo: "",
				created_at: "2024-01-03T00:00:00Z",
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(customersApi.create).mockResolvedValue(newCustomer);

			const { result } = renderHook(() => useCreateCustomer(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({ name: "박지민", phone: "010-1111-2222" });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(newCustomer);
			expect(vi.mocked(customersApi.create).mock.calls[0]?.[0]).toEqual({
				name: "박지민",
				phone: "010-1111-2222",
			});
		});

		it("handles mutation error", async () => {
			const error = new Error("Create failed");
			vi.mocked(customersApi.create).mockRejectedValue(error);

			const { result } = renderHook(() => useCreateCustomer(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({ name: "테스트", phone: "010-0000-0000" });

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});

			expect(result.current.error).toBe(error);
		});
	});

	describe("useUpdateCustomer", () => {
		it("updates customer successfully", async () => {
			const updatedCustomer: Customer = {
				id: 1,
				name: "김철수(수정)",
				phone: "010-1234-5678",
				memo: "",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-03T00:00:00Z",
			};
			vi.mocked(customersApi.update).mockResolvedValue(updatedCustomer);

			const { result } = renderHook(() => useUpdateCustomer(), {
				wrapper: createQueryWrapper(),
			});

			result.current.mutate({ id: 1, data: { name: "김철수(수정)" } });

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(updatedCustomer);
			expect(customersApi.update).toHaveBeenCalledWith(1, {
				name: "김철수(수정)",
			});
		});

		it("handles update error", async () => {
			const error = new Error("Update failed");
			vi.mocked(customersApi.update).mockRejectedValue(error);

			const { result } = renderHook(() => useUpdateCustomer(), {
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
