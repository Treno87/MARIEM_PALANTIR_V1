/**
 * 날짜 유틸리티 함수
 */

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환
 */
export function toDateString(date: Date): string {
	const isoString = date.toISOString().split("T")[0];
	return isoString ?? "";
}

/**
 * 이번 달 시작일 (YYYY-MM-DD)
 */
export function getMonthStartDate(): string {
	const today = new Date();
	return toDateString(new Date(today.getFullYear(), today.getMonth(), 1));
}

/**
 * 오늘 날짜 (YYYY-MM-DD)
 */
export function getTodayDate(): string {
	return toDateString(new Date());
}
