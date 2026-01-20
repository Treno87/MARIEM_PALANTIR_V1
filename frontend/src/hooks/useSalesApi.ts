import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitsApi } from "../api/endpoints";
import type { SaleRecord } from "../components/sale/types";
import { createQueryKeys } from "../lib/queryKeys";
import { mapVisitToSaleRecord } from "../utils/apiMappers";

export const salesKeys = createQueryKeys("sales");

export function useSalesList(startDate?: string, endDate?: string) {
	return useQuery({
		queryKey: salesKeys.list({ startDate, endDate }),
		queryFn: async () => {
			// API는 date 파라미터로 단일 날짜 조회만 지원
			// 날짜 범위 조회를 위해 클라이언트 사이드 필터링 필요
			const visits = await visitsApi.list({ status: "finalized" });
			const records = visits.map(mapVisitToSaleRecord);

			// 날짜 범위 필터링
			if (startDate !== undefined && endDate !== undefined) {
				return records.filter(
					(record) => record.saleDate >= startDate && record.saleDate <= endDate,
				);
			}
			return records;
		},
	});
}

export function useSale(id: number) {
	return useQuery({
		queryKey: salesKeys.detail(id),
		queryFn: async (): Promise<SaleRecord> => {
			const visit = await visitsApi.get(id);
			return mapVisitToSaleRecord(visit);
		},
		enabled: id > 0,
	});
}

export function useVoidSale() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => visitsApi.void(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: salesKeys.all });
		},
	});
}
