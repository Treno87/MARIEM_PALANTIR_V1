/**
 * 고객 데이터 내보내기 유틸리티
 */

import type { CustomerWithSegments } from "../types/marketing";
import { SEGMENT_INFO } from "../types/marketing";

/**
 * 전화번호만 클립보드에 복사
 */
export async function copyPhoneNumbers(customers: CustomerWithSegments[]): Promise<void> {
	const phones = customers.map((c) => c.phone).join("\n");
	await navigator.clipboard.writeText(phones);
}

/**
 * CSV 형식으로 변환
 */
export function convertToCSV(customers: CustomerWithSegments[]): string {
	const headers = ["이름", "전화번호", "세그먼트", "마지막방문", "상태", "메모"];
	const rows = customers.map((customer) => {
		const segments = customer.segments.map((s) => SEGMENT_INFO[s].label).join(", ");
		const lastVisit =
			customer.daysSinceLastVisit !== undefined
				? `${String(customer.daysSinceLastVisit)}일 전`
				: "-";
		const status =
			customer.marketingStatus === "contacted"
				? "연락완료"
				: customer.marketingStatus === "ignored"
					? "무시"
					: "미연락";
		const note = customer.marketingNote ?? "";

		return [customer.name, customer.phone, segments, lastVisit, status, note].map(escapeCSV);
	});

	return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * CSV 셀 값 이스케이프 처리
 */
function escapeCSV(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

/**
 * CSV 파일 다운로드
 */
export function downloadCSV(
	customers: CustomerWithSegments[],
	filename = "marketing_customers.csv",
): void {
	const csv = convertToCSV(customers);
	const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
	const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
