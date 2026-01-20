import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceCategoriesApi, servicesApi } from "../api/endpoints";

export const serviceCategoryKeys = {
	all: ["serviceCategories"] as const,
	list: () => [...serviceCategoryKeys.all, "list"] as const,
};

export const serviceKeys = {
	all: ["services"] as const,
	list: (params?: { active?: boolean; category_id?: number }) =>
		[...serviceKeys.all, "list", params] as const,
};

export function useServiceCategoriesList() {
	return useQuery({
		queryKey: serviceCategoryKeys.list(),
		queryFn: serviceCategoriesApi.list,
	});
}

export function useCreateServiceCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: serviceCategoriesApi.create,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.all });
		},
	});
}

export function useUpdateServiceCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
			serviceCategoriesApi.update(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.all });
		},
	});
}

export function useServicesList(params?: { active?: boolean; category_id?: number }) {
	return useQuery({
		queryKey: serviceKeys.list(params),
		queryFn: () => servicesApi.list(params),
	});
}

export function useCreateService() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: servicesApi.create,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
	});
}

export function useUpdateService() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Parameters<typeof servicesApi.update>[1] }) =>
			servicesApi.update(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
	});
}
