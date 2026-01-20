import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../api/endpoints";

export const productKeys = {
	all: ["products"] as const,
	list: (params?: { active?: boolean; kind?: string; for_sale?: boolean }) =>
		[...productKeys.all, "list", params] as const,
};

export function useProductsList(params?: { active?: boolean; kind?: string; for_sale?: boolean }) {
	return useQuery({
		queryKey: productKeys.list(params),
		queryFn: () => productsApi.list(params),
	});
}

export function useCreateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: productsApi.create,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: productKeys.all });
		},
	});
}

export function useUpdateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Parameters<typeof productsApi.update>[1] }) =>
			productsApi.update(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: productKeys.all });
		},
	});
}
