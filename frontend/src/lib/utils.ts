/**
 * 유틸리티 함수
 */

/**
 * 금액 포맷팅 (원화)
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("ko-KR", {
		style: "currency",
		currency: "KRW",
	}).format(amount);
}

/**
 * 날짜 포맷팅
 */
export function formatDate(date: Date | string, format: "short" | "long" = "short"): string {
	const d = typeof date === "string" ? new Date(date) : date;

	if (format === "long") {
		return new Intl.DateTimeFormat("ko-KR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long",
		}).format(d);
	}

	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(d);
}

/**
 * 전화번호 포맷팅
 */
export function formatPhone(phone: string): string {
	const cleaned = phone.replace(/\D/g, "");

	if (cleaned.length === 11) {
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
	}
	if (cleaned.length === 10) {
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
	}

	return phone;
}

/**
 * 클래스명 병합 (tailwind-merge 없이 간단한 버전)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(" ");
}
