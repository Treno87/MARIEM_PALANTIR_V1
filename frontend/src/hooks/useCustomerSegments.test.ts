import { describe, expect, it } from "vitest";
import type { Customer } from "../types";
import { DEFAULT_SEGMENT_CONFIG } from "../types/marketing";
import {
	calculateAvgVisitCycle,
	daysSinceDate,
	determineSegments,
	isBirthdayUpcoming,
	isChurnRisk,
	isLowBalance,
	isNewUnsettled,
} from "./useCustomerSegments";

// 테스트용 날짜 헬퍼
const today = new Date("2026-01-22");
const daysAgo = (days: number) => {
	const date = new Date(today);
	date.setDate(date.getDate() - days);
	return date.toISOString().split("T")[0];
};

describe("calculateAvgVisitCycle", () => {
	it("방문 기록이 2개 미만이면 기본값 90일을 반환한다", () => {
		expect(calculateAvgVisitCycle([])).toBe(90);
		expect(calculateAvgVisitCycle(["2026-01-01"])).toBe(90);
	});

	it("방문 기록이 2개일 때 정확한 간격을 계산한다", () => {
		const visits = ["2026-01-01", "2026-01-31"]; // 30일 간격
		expect(calculateAvgVisitCycle(visits)).toBe(30);
	});

	it("방문 기록이 여러 개일 때 평균 간격을 계산한다", () => {
		const visits = ["2026-01-01", "2026-01-15", "2026-01-22"]; // 14일, 7일 간격 → 평균 10.5일
		const result = calculateAvgVisitCycle(visits);
		expect(result).toBeCloseTo(10.5, 1);
	});

	it("정렬되지 않은 날짜도 올바르게 처리한다", () => {
		const visits = ["2026-01-22", "2026-01-01", "2026-01-15"];
		const result = calculateAvgVisitCycle(visits);
		expect(result).toBeCloseTo(10.5, 1);
	});
});

describe("daysSinceDate", () => {
	it("오늘 날짜면 0을 반환한다", () => {
		expect(daysSinceDate("2026-01-22", today)).toBe(0);
	});

	it("과거 날짜면 양수를 반환한다", () => {
		expect(daysSinceDate("2026-01-12", today)).toBe(10);
	});

	it("미래 날짜면 음수를 반환한다", () => {
		expect(daysSinceDate("2026-01-25", today)).toBe(-3);
	});
});

describe("isChurnRisk", () => {
	const config = DEFAULT_SEGMENT_CONFIG.churnRisk;

	it("마지막 방문이 평균주기 x 1.5 초과면 휴면 위험", () => {
		// 평균 100일 주기, 마지막 방문 160일 전 → 150일 기준 초과 (minDays 90보다 큼)
		expect(isChurnRisk(160, 100, config)).toBe(true);
	});

	it("마지막 방문이 평균주기 x 1.5 이하면 휴면 위험 아님", () => {
		// 평균 30일 주기, 마지막 방문 40일 전 → 45일 기준 이하
		expect(isChurnRisk(40, 30, config)).toBe(false);
	});

	it("평균주기가 짧아도 최소 기준일(90일) 적용", () => {
		// 평균 20일 주기 (x1.5 = 30일), 하지만 최소 90일 적용
		// 마지막 방문 80일 전 → 90일 미만이므로 안전
		expect(isChurnRisk(80, 20, config)).toBe(false);
		// 마지막 방문 100일 전 → 90일 초과이므로 위험
		expect(isChurnRisk(100, 20, config)).toBe(true);
	});
});

describe("isBirthdayUpcoming", () => {
	const config = DEFAULT_SEGMENT_CONFIG.birthdayUpcoming;

	it("생일이 14일 이내면 생일 임박", () => {
		// 오늘: 2026-01-22, 생일: 2월 1일 → 10일 후
		expect(isBirthdayUpcoming("1990-02-01", today, config)).toBe(true);
	});

	it("생일이 14일 초과면 생일 임박 아님", () => {
		// 오늘: 2026-01-22, 생일: 2월 20일 → 29일 후
		expect(isBirthdayUpcoming("1990-02-20", today, config)).toBe(false);
	});

	it("생일이 지났으면 내년 생일까지 계산", () => {
		// 오늘: 2026-01-22, 생일: 1월 20일 → 이미 지남, 내년까지 363일
		expect(isBirthdayUpcoming("1990-01-20", today, config)).toBe(false);
	});

	it("오늘이 생일이면 생일 임박", () => {
		expect(isBirthdayUpcoming("1990-01-22", today, config)).toBe(true);
	});

	it("생일 정보가 없으면 false", () => {
		expect(isBirthdayUpcoming(undefined, today, config)).toBe(false);
		expect(isBirthdayUpcoming("", today, config)).toBe(false);
	});
});

describe("isLowBalance", () => {
	const config = DEFAULT_SEGMENT_CONFIG.lowBalance;

	it("잔액이 20% 이하면 정액권 부족", () => {
		expect(isLowBalance(15000, 100000, config)).toBe(true);
		expect(isLowBalance(20000, 100000, config)).toBe(true);
	});

	it("잔액이 20% 초과면 정액권 부족 아님", () => {
		expect(isLowBalance(25000, 100000, config)).toBe(false);
	});

	it("정액권이 없으면 false", () => {
		expect(isLowBalance(0, 0, config)).toBe(false);
		expect(isLowBalance(undefined, undefined, config)).toBe(false);
	});
});

describe("isNewUnsettled", () => {
	const config = DEFAULT_SEGMENT_CONFIG.newUnsettled;

	it("첫 방문 후 30일 이내 재방문 없으면 신규 미정착", () => {
		// 첫 방문: 20일 전, 방문 1회
		const firstVisitAt = daysAgo(20);
		expect(isNewUnsettled(firstVisitAt, 1, today, config)).toBe(true);
	});

	it("첫 방문 후 30일 이내 재방문 있으면 정착", () => {
		// 첫 방문: 20일 전, 방문 2회 이상
		const firstVisitAt = daysAgo(20);
		expect(isNewUnsettled(firstVisitAt, 2, today, config)).toBe(false);
	});

	it("첫 방문 후 30일 초과면 신규가 아님", () => {
		// 첫 방문: 40일 전
		const firstVisitAt = daysAgo(40);
		expect(isNewUnsettled(firstVisitAt, 1, today, config)).toBe(false);
	});

	it("첫 방문 정보가 없으면 false", () => {
		expect(isNewUnsettled(undefined, 0, today, config)).toBe(false);
	});
});

describe("determineSegments", () => {
	const baseCustomer: Customer = {
		id: 1,
		name: "테스트 고객",
		phone: "010-1234-5678",
		status: "active",
		created_at: "2025-01-01",
		updated_at: "2025-01-01",
	};

	it("조건에 맞는 세그먼트를 모두 반환한다", () => {
		const customer = {
			...baseCustomer,
			first_visit_at: daysAgo(200),
		};
		// 방문 2회: 200일 전, 100일 전 → 평균 주기 100일, threshold = 150일
		// 마지막 방문 100일 전 → 아직 위험 아님. 160일로 변경
		const visitDates = [daysAgo(260), daysAgo(160)]; // 평균 100일 주기, 마지막 160일 전
		const storedValue = { balance: 10000, initialBalance: 100000 }; // 10% 잔액

		const segments = determineSegments(
			customer,
			visitDates,
			storedValue,
			undefined,
			today,
			DEFAULT_SEGMENT_CONFIG,
		);

		expect(segments).toContain("churn_risk");
		expect(segments).toContain("low_balance");
	});

	it("생일 임박 세그먼트를 정확히 판정한다", () => {
		const customer = {
			...baseCustomer,
			first_visit_at: daysAgo(10),
			birth_date: "1990-02-01", // 10일 후 생일
		};
		const visitDates = [daysAgo(10), daysAgo(5)]; // 재방문 있음

		const segments = determineSegments(
			customer,
			visitDates,
			undefined,
			undefined,
			today,
			DEFAULT_SEGMENT_CONFIG,
		);

		expect(segments).toContain("birthday_upcoming");
		expect(segments).not.toContain("new_unsettled");
	});

	it("세그먼트가 없으면 빈 배열 반환", () => {
		const customer = {
			...baseCustomer,
			first_visit_at: daysAgo(10),
		};
		const visitDates = [daysAgo(10), daysAgo(5)]; // 최근 방문, 재방문 있음

		const segments = determineSegments(
			customer,
			visitDates,
			undefined,
			undefined,
			today,
			DEFAULT_SEGMENT_CONFIG,
		);

		expect(segments).toEqual([]);
	});
});
