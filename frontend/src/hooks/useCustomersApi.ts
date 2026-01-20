import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../api/endpoints";

export const customerKeys = {
	all: ["customers"] as const,
	list: (query?: string) => [...customerKeys.all, "list", query] as const,
	detail: (id: number) => [...customerKeys.all, "detail", id] as const,
};

export function useCustomersList(query?: string) {
	return useQuery({
		queryKey: customerKeys.list(query),
		queryFn: () => customersApi.list(query),
	});
}

export function useCustomer(id: number) {
	return useQuery({
		queryKey: customerKeys.detail(id),
		queryFn: () => customersApi.get(id),
		enabled: id > 0,
	});
}

export function useCreateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: customersApi.create,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: customerKeys.all });
		},
	});
}

export function useUpdateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Parameters<typeof customersApi.update>[1] }) =>
			customersApi.update(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: customerKeys.all });
		},
	});
}
