import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitsApi } from "../api/endpoints";
import type { CreateVisitRequest } from "../api/types";

export const visitKeys = {
	all: ["visits"] as const,
	list: (params?: { date?: string; status?: string }) =>
		[...visitKeys.all, "list", params] as const,
	detail: (id: number) => [...visitKeys.all, "detail", id] as const,
};

export function useVisitsList(params?: { date?: string; status?: string }) {
	return useQuery({
		queryKey: visitKeys.list(params),
		queryFn: () => visitsApi.list(params),
	});
}

export function useVisit(id: number) {
	return useQuery({
		queryKey: visitKeys.detail(id),
		queryFn: () => visitsApi.get(id),
		enabled: id > 0,
	});
}

export function useCreateVisit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateVisitRequest) => visitsApi.create(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: visitKeys.all });
		},
	});
}

export function useVoidVisit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => visitsApi.void(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: visitKeys.all });
		},
	});
}
