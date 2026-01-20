/**
 * 판매 데이터 소스 추상화 훅
 * API와 Context 데이터 소스를 통합하여 컴포넌트에서 분기 로직 제거
 */
import { useMemo } from "react";
import { useSales } from "../contexts/SaleContext";
import { useSalesList, useVoidSale } from "./useSalesApi";

// API 사용 여부 (환경 변수로 제어)
const USE_API = import.meta.env["VITE_USE_API"] === "true";

interface UseSalesDataResult {
	/** 필터링된 판매 목록 */
	filteredSales: ReturnType<typeof useSales>["sales"];
	/** 전체 판매 목록 */
	allSales: ReturnType<typeof useSales>["sales"];
	/** 로딩 상태 */
	isLoading: boolean;
	/** 거래 취소 함수 */
	voidSale: (id: string) => void;
}

export function useSalesData(startDate: string, endDate: string): UseSalesDataResult {
	const { sales: contextSales, voidSale: contextVoidSale, getSalesByDateRange } = useSales();

	const { data: apiSales, isLoading: apiLoading } = useSalesList(startDate, endDate);
	const voidMutation = useVoidSale();

	const filteredSales = useMemo(() => {
		if (USE_API) {
			return apiSales ?? [];
		}
		return getSalesByDateRange(startDate, endDate);
	}, [apiSales, getSalesByDateRange, startDate, endDate]);

	const allSales = useMemo(() => {
		return USE_API ? (apiSales ?? []) : contextSales;
	}, [apiSales, contextSales]);

	const voidSale = (id: string): void => {
		if (USE_API) {
			voidMutation.mutate(parseInt(id, 10));
		} else {
			contextVoidSale(id);
		}
	};

	return {
		filteredSales,
		allSales,
		isLoading: USE_API && apiLoading,
		voidSale,
	};
}
