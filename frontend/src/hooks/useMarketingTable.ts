/**
 * 마케팅 테이블 상태 관리 훅
 */

import { useCallback, useMemo, useState } from "react";
import type { Customer } from "../types";
import {
	type CustomerWithSegments,
	DEFAULT_SEGMENT_CONFIG,
	type MarketingStatus,
	type SegmentCounts,
	type SegmentType,
} from "../types/marketing";
import { daysSinceDate, determineSegments } from "./useCustomerSegments";

interface CustomerExtended extends Customer {
	visitDates?: string[];
	storedValueBalance?: number;
	storedValueInitial?: number;
	birth_date?: string;
}

interface UseMarketingTableResult {
	// 상태
	selectedSegment: SegmentType;
	selectedIds: Set<number>;
	marketingStatuses: Map<number, MarketingStatus>;
	marketingNotes: Map<number, string>;

	// 계산된 값
	filteredCustomers: CustomerWithSegments[];
	counts: SegmentCounts;

	// 액션
	setSelectedSegment: (segment: SegmentType) => void;
	toggleSelect: (id: number) => void;
	toggleSelectAll: () => void;
	markContacted: (id: number) => void;
	addNote: (id: number, note: string) => void;
	clearSelection: () => void;
}

export function useMarketingTable(customers: CustomerExtended[]): UseMarketingTableResult {
	const [selectedSegment, setSelectedSegment] = useState<SegmentType>("all");
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [marketingStatuses, setMarketingStatuses] = useState<Map<number, MarketingStatus>>(
		new Map(),
	);
	const [marketingNotes, setMarketingNotes] = useState<Map<number, string>>(new Map());

	const today = useMemo(() => new Date(), []);

	// 고객별 세그먼트 계산
	const customersWithSegments: CustomerWithSegments[] = useMemo(() => {
		return customers.map((customer) => {
			const visitDates = customer.visitDates ?? [];
			const storedValue =
				customer.storedValueBalance !== undefined && customer.storedValueInitial !== undefined
					? {
							balance: customer.storedValueBalance,
							initialBalance: customer.storedValueInitial,
						}
					: undefined;

			const segments = determineSegments(
				{ ...customer, birth_date: customer.birth_date },
				visitDates,
				storedValue,
				undefined,
				today,
				DEFAULT_SEGMENT_CONFIG,
			);

			const lastVisitDate = visitDates.length > 0 ? visitDates.sort().reverse()[0] : undefined;
			const daysSinceLastVisit = lastVisitDate ? daysSinceDate(lastVisitDate, today) : undefined;

			return {
				...customer,
				segments,
				lastVisitAt: lastVisitDate,
				daysSinceLastVisit,
				storedValueBalance: customer.storedValueBalance,
				marketingStatus: marketingStatuses.get(customer.id) ?? "pending",
				marketingNote: marketingNotes.get(customer.id),
			};
		});
	}, [customers, today, marketingStatuses, marketingNotes]);

	// 세그먼트별 카운트 계산
	const counts: SegmentCounts = useMemo(() => {
		const result: SegmentCounts = {
			all: customersWithSegments.length,
			churn_risk: 0,
			birthday_upcoming: 0,
			low_balance: 0,
			new_unsettled: 0,
			vip_declining: 0,
			action_needed: 0,
		};

		const actionNeededSet = new Set<number>();

		for (const customer of customersWithSegments) {
			for (const segment of customer.segments) {
				if (segment !== "all") {
					result[segment]++;
					actionNeededSet.add(customer.id);
				}
			}
		}

		result.action_needed = actionNeededSet.size;
		return result;
	}, [customersWithSegments]);

	// 필터링된 고객 목록
	const filteredCustomers = useMemo(() => {
		if (selectedSegment === "all") {
			return customersWithSegments;
		}
		return customersWithSegments.filter((customer) => customer.segments.includes(selectedSegment));
	}, [customersWithSegments, selectedSegment]);

	// 선택 토글
	const toggleSelect = useCallback((id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	// 전체 선택/해제
	const toggleSelectAll = useCallback(() => {
		setSelectedIds((prev) => {
			if (prev.size === filteredCustomers.length) {
				return new Set();
			}
			return new Set(filteredCustomers.map((c) => c.id));
		});
	}, [filteredCustomers]);

	// 연락 완료 처리
	const markContacted = useCallback((id: number) => {
		setMarketingStatuses((prev) => {
			const next = new Map(prev);
			const current = next.get(id) ?? "pending";
			next.set(id, current === "contacted" ? "pending" : "contacted");
			return next;
		});
	}, []);

	// 메모 추가
	const addNote = useCallback((id: number, note: string) => {
		setMarketingNotes((prev) => {
			const next = new Map(prev);
			next.set(id, note);
			return next;
		});
	}, []);

	// 선택 초기화
	const clearSelection = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	return {
		selectedSegment,
		selectedIds,
		marketingStatuses,
		marketingNotes,
		filteredCustomers,
		counts,
		setSelectedSegment,
		toggleSelect,
		toggleSelectAll,
		markContacted,
		addNote,
		clearSelection,
	};
}
