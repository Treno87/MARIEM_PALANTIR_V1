/**
 * 고객 세그먼트 판정 로직
 * 마케팅 관리를 위한 고객 분류 훅
 */

import type { Customer } from "../types";
import type { SegmentConfig, SegmentType } from "../types/marketing";

/**
 * 평균 방문 주기 계산
 * @param visitDates 방문 날짜 배열 (ISO 형식)
 * @returns 평균 방문 주기 (일)
 */
export function calculateAvgVisitCycle(visitDates: string[]): number {
	if (visitDates.length < 2) {
		return 90; // 기본값
	}

	// 날짜 정렬
	const sortedDates = [...visitDates].map((d) => new Date(d).getTime()).sort((a, b) => a - b);

	// 간격 계산
	let totalDays = 0;
	for (let i = 1; i < sortedDates.length; i++) {
		const diffMs = sortedDates[i] - sortedDates[i - 1];
		totalDays += diffMs / (1000 * 60 * 60 * 24);
	}

	return totalDays / (sortedDates.length - 1);
}

/**
 * 특정 날짜로부터 경과일 계산
 * @param dateStr 기준 날짜 (ISO 형식)
 * @param today 오늘 날짜
 * @returns 경과일 (양수: 과거, 음수: 미래)
 */
export function daysSinceDate(dateStr: string, today: Date): number {
	const targetDate = new Date(dateStr);
	const diffMs = today.getTime() - targetDate.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 휴면 위험 여부 판정
 */
export function isChurnRisk(
	daysSinceLastVisit: number,
	avgVisitCycle: number,
	config: SegmentConfig["churnRisk"],
): boolean {
	const threshold = Math.max(avgVisitCycle * config.multiplier, config.minDays);
	return daysSinceLastVisit > threshold;
}

/**
 * 올해 또는 내년 생일까지 남은 일수 계산
 */
function daysUntilBirthday(birthDate: string, today: Date): number {
	const birth = new Date(birthDate);
	const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

	// 올해 생일까지 남은 일수
	let diffMs = thisYearBirthday.getTime() - today.getTime();
	let diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	// 이미 지났으면 내년 생일까지 계산
	if (diffDays < 0) {
		const nextYearBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
		diffMs = nextYearBirthday.getTime() - today.getTime();
		diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
	}

	return diffDays;
}

/**
 * 생일 임박 여부 판정
 */
export function isBirthdayUpcoming(
	birthDate: string | undefined,
	today: Date,
	config: SegmentConfig["birthdayUpcoming"],
): boolean {
	if (!birthDate) {
		return false;
	}

	const daysLeft = daysUntilBirthday(birthDate, today);
	return daysLeft >= 0 && daysLeft <= config.daysAhead;
}

/**
 * 정액권 잔액 부족 여부 판정
 */
export function isLowBalance(
	balance: number | undefined,
	initialBalance: number | undefined,
	config: SegmentConfig["lowBalance"],
): boolean {
	if (!balance || !initialBalance || initialBalance === 0) {
		return false;
	}

	const percentage = (balance / initialBalance) * 100;
	return percentage <= config.percentageThreshold;
}

/**
 * 신규 미정착 고객 여부 판정
 */
export function isNewUnsettled(
	firstVisitAt: string | undefined,
	visitCount: number,
	today: Date,
	config: SegmentConfig["newUnsettled"],
): boolean {
	if (!firstVisitAt) {
		return false;
	}

	const daysSinceFirst = daysSinceDate(firstVisitAt, today);

	// 첫 방문 후 기준일 이내이고, 재방문이 없으면 미정착
	return daysSinceFirst <= config.maxDaysSinceFirst && visitCount <= 1;
}

interface StoredValueInfo {
	balance: number;
	initialBalance: number;
}

interface SalesInfo {
	recentTotal: number;
	previousTotal: number;
}

/**
 * 고객의 세그먼트 결정
 */
export function determineSegments(
	customer: Customer & { birth_date?: string },
	visitDates: string[],
	storedValue: StoredValueInfo | undefined,
	_salesInfo: SalesInfo | undefined,
	today: Date,
	config: SegmentConfig,
): SegmentType[] {
	const segments: SegmentType[] = [];

	// 평균 방문 주기 계산
	const avgCycle = calculateAvgVisitCycle(visitDates);

	// 마지막 방문일 계산
	const lastVisitDate = visitDates.length > 0 ? visitDates.sort().reverse()[0] : undefined;
	const daysSinceLastVisit = lastVisitDate ? daysSinceDate(lastVisitDate, today) : Infinity;

	// 휴면 위험
	if (visitDates.length > 0 && isChurnRisk(daysSinceLastVisit, avgCycle, config.churnRisk)) {
		segments.push("churn_risk");
	}

	// 생일 임박
	if (isBirthdayUpcoming(customer.birth_date, today, config.birthdayUpcoming)) {
		segments.push("birthday_upcoming");
	}

	// 정액권 부족
	if (
		storedValue &&
		isLowBalance(storedValue.balance, storedValue.initialBalance, config.lowBalance)
	) {
		segments.push("low_balance");
	}

	// 신규 미정착
	if (isNewUnsettled(customer.first_visit_at, visitDates.length, today, config.newUnsettled)) {
		segments.push("new_unsettled");
	}

	// TODO: VIP 하락 위험 (Phase 3에서 구현)

	return segments;
}
