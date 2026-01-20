import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/endpoints";

const DOMAIN = "reports" as const;

export const reportKeys = {
	all: [DOMAIN] as const,
	daily: (date?: string) => [DOMAIN, "daily", date] as const,
	monthly: (year?: number, month?: number) => [DOMAIN, "monthly", year, month] as const,
	byStaff: (date?: string) => [DOMAIN, "byStaff", date] as const,
	byMethod: (date?: string) => [DOMAIN, "byMethod", date] as const,
};

export function useDailyReport(date?: string) {
	return useQuery({
		queryKey: reportKeys.daily(date),
		queryFn: () => reportsApi.daily(date),
	});
}

export function useMonthlyReport(year?: number, month?: number) {
	return useQuery({
		queryKey: reportKeys.monthly(year, month),
		queryFn: () => reportsApi.monthly(year, month),
	});
}

export function useStaffReport(date?: string) {
	return useQuery({
		queryKey: reportKeys.byStaff(date),
		queryFn: () => reportsApi.byStaff(date),
	});
}

export function useMethodReport(date?: string) {
	return useQuery({
		queryKey: reportKeys.byMethod(date),
		queryFn: () => reportsApi.byMethod(date),
	});
}
