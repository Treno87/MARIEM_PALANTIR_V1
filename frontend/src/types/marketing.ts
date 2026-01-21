/**
 * 마케팅 관리 관련 타입 정의
 */

import type { Customer } from "./index";

// 세그먼트 종류
export type SegmentType =
	| "all"
	| "churn_risk" // 휴면 위험
	| "birthday_upcoming" // 생일 임박
	| "low_balance" // 정액권 부족
	| "new_unsettled" // 신규 미정착
	| "vip_declining"; // VIP 하락 위험

// 마케팅 상태
export type MarketingStatus = "pending" | "contacted" | "ignored";

// 세그먼트 정보
export interface SegmentInfo {
	type: SegmentType;
	label: string;
	icon: string;
	description: string;
	priority: "P0" | "P1" | "P2";
}

// 세그먼트별 고객 정보
export interface CustomerWithSegments extends Customer {
	segments: SegmentType[];
	lastVisitAt?: string;
	daysSinceLastVisit?: number;
	avgVisitCycle?: number;
	birthdayDaysLeft?: number;
	storedValueBalance?: number;
	storedValuePercentage?: number;
	recentSalesTotal?: number;
	previousSalesTotal?: number;
	marketingStatus: MarketingStatus;
	marketingNote?: string;
}

// 세그먼트 카운트
export interface SegmentCounts {
	all: number;
	churn_risk: number;
	birthday_upcoming: number;
	low_balance: number;
	new_unsettled: number;
	vip_declining: number;
	action_needed: number; // 전체 액션 필요 (중복 제거)
}

// 메시지 템플릿
export interface MessageTemplate {
	id: string;
	name: string;
	segment: SegmentType;
	content: string;
	variables: string[]; // {고객명}, {경과일} 등
}

// 캠페인
export interface Campaign {
	id: number;
	name: string;
	targetSegment: SegmentType;
	targetCount: number;
	messageTemplate: MessageTemplate;
	status: "draft" | "scheduled" | "sent" | "cancelled";
	scheduledAt?: string;
	sentAt?: string;
	createdAt: string;
}

// 세그먼트 판정에 필요한 고객 방문 정보
export interface CustomerVisitInfo {
	customerId: number;
	visitDates: string[];
}

// 정액권 정보
export interface CustomerStoredValue {
	customerId: number;
	balance: number;
	initialBalance: number;
}

// 세그먼트 설정 (판정 기준값)
export interface SegmentConfig {
	churnRisk: {
		multiplier: number; // 평균 방문 주기 배수 (기본 1.5)
		minDays: number; // 최소 휴면 기준일 (기본 90일)
	};
	birthdayUpcoming: {
		daysAhead: number; // 생일 며칠 전부터 (기본 14일)
	};
	lowBalance: {
		percentageThreshold: number; // 잔액 비율 기준 (기본 20%)
	};
	newUnsettled: {
		maxDaysSinceFirst: number; // 첫 방문 후 기준일 (기본 30일)
	};
	vipDeclining: {
		declinePercentage: number; // 매출 감소율 (기본 50%)
		periodMonths: number; // 비교 기간 (기본 3개월)
	};
}

// 기본 세그먼트 설정값
export const DEFAULT_SEGMENT_CONFIG: SegmentConfig = {
	churnRisk: {
		multiplier: 1.5,
		minDays: 90,
	},
	birthdayUpcoming: {
		daysAhead: 14,
	},
	lowBalance: {
		percentageThreshold: 20,
	},
	newUnsettled: {
		maxDaysSinceFirst: 30,
	},
	vipDeclining: {
		declinePercentage: 50,
		periodMonths: 3,
	},
};

// AI 메시지 생성 관련 타입
export type MessageTone = "formal" | "friendly" | "casual";
export type MessageLength = "short" | "medium" | "long";

export interface AIMessageRequest {
	customer: {
		name: string;
		daysSinceLastVisit?: number;
		lastService?: string;
		preferredServices?: string[];
		storedValueBalance?: number;
		birthdayDaysLeft?: number;
		visitCount?: number;
	};
	segment: SegmentType;
	tone: MessageTone;
	length: MessageLength;
	includePromotion: boolean;
	customPrompt?: string;
}

export interface AIMessageResponse {
	message: string;
	generatedAt: string;
	tokensUsed?: number;
}

export interface AIMessageGeneratorState {
	isGenerating: boolean;
	generatedMessage: string;
	error: string | null;
	tone: MessageTone;
	length: MessageLength;
	includePromotion: boolean;
}

// 세그먼트 정보 상수
export const SEGMENT_INFO: Record<SegmentType, SegmentInfo> = {
	all: {
		type: "all",
		label: "전체",
		icon: "group",
		description: "모든 고객",
		priority: "P2",
	},
	churn_risk: {
		type: "churn_risk",
		label: "휴면 위험",
		icon: "warning",
		description: "평균 방문 주기 x 1.5 초과 미방문",
		priority: "P0",
	},
	birthday_upcoming: {
		type: "birthday_upcoming",
		label: "생일 임박",
		icon: "cake",
		description: "7-14일 내 생일",
		priority: "P1",
	},
	low_balance: {
		type: "low_balance",
		label: "정액권 부족",
		icon: "account_balance_wallet",
		description: "잔액 20% 이하",
		priority: "P0",
	},
	new_unsettled: {
		type: "new_unsettled",
		label: "신규 미정착",
		icon: "person_add",
		description: "첫 방문 후 30일 내 재방문 없음",
		priority: "P1",
	},
	vip_declining: {
		type: "vip_declining",
		label: "VIP 하락",
		icon: "trending_down",
		description: "최근 3개월 매출 50% 이상 감소",
		priority: "P2",
	},
};
