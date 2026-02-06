import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitsApi } from "../api/endpoints";
import type { CreateVisitRequest, Visit } from "../api/types";

export interface VisitsListParams {
	date?: string;
	date_from?: string;
	date_to?: string;
	status?: string;
}

export const visitKeys = {
	all: ["visits"] as const,
	list: (params?: VisitsListParams) => [...visitKeys.all, "list", params] as const,
	detail: (id: number) => [...visitKeys.all, "detail", id] as const,
};

export function useVisitsList(params?: VisitsListParams, options?: { enabled?: boolean }) {
	return useQuery<Visit[]>({
		queryKey: visitKeys.list(params),
		queryFn: () => visitsApi.list(params),
		enabled: options?.enabled ?? true,
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
