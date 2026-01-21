import type { Reservation, TimeSlot } from "./types";

// 10:00 ~ 20:00, 30분 단위 (20개 슬롯)
export const TIME_SLOTS: TimeSlot[] = Array.from({ length: 21 }, (_, i) => {
	const hour = Math.floor(i / 2) + 10;
	const minute = (i % 2) * 30;
	const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
	return { time, label: time };
});

export const STATUS_CONFIG = {
	reserved: {
		bg: "bg-blue-100",
		text: "text-blue-700",
		label: "예약",
	},
	completed: {
		bg: "bg-green-100",
		text: "text-green-700",
		label: "완료",
	},
	cancelled: {
		bg: "bg-red-100",
		text: "text-red-700",
		label: "취소",
	},
} as const;

export const DURATION_OPTIONS = [
	{ value: 30, label: "30분" },
	{ value: 60, label: "1시간" },
	{ value: 90, label: "1시간 30분" },
	{ value: 120, label: "2시간" },
];

// Mock 예약 데이터 (customerId와 customerName은 CustomerContext와 일치)
export const MOCK_RESERVATIONS: Reservation[] = [
	{
		id: "res-1",
		customerId: "1",
		customerName: "김민지",
		isNewCustomer: false,
		staffId: "1",
		staffName: "김정희",
		serviceName: "여자커트",
		date: "2026-01-21",
		startTime: "10:00",
		duration: 60,
		status: "reserved",
	},
	{
		id: "res-2",
		customerId: "2",
		customerName: "이서연",
		isNewCustomer: false,
		staffId: "1",
		staffName: "김정희",
		serviceName: "디지털펌",
		date: "2026-01-21",
		startTime: "14:00",
		duration: 120,
		status: "reserved",
	},
	{
		id: "res-3",
		customerId: "3",
		customerName: "박지우",
		isNewCustomer: false,
		staffId: "2",
		staffName: "박수민",
		serviceName: "전체염색",
		date: "2026-01-21",
		startTime: "11:00",
		duration: 90,
		status: "completed",
	},
	{
		id: "res-4",
		customerId: "4",
		customerName: "최수현",
		isNewCustomer: false,
		staffId: "2",
		staffName: "박수민",
		serviceName: "두피클리닉",
		date: "2026-01-21",
		startTime: "16:00",
		duration: 60,
		status: "reserved",
	},
	{
		id: "res-5",
		customerId: "6",
		customerName: "한소희",
		isNewCustomer: false,
		staffId: "3",
		staffName: "이하늘",
		serviceName: "남자커트",
		date: "2026-01-21",
		startTime: "10:30",
		duration: 30,
		status: "cancelled",
	},
	{
		id: "res-6",
		customerId: "5",
		customerName: "정다은",
		isNewCustomer: false,
		staffId: "3",
		staffName: "이하늘",
		serviceName: "매직셋팅",
		date: "2026-01-21",
		startTime: "13:00",
		duration: 120,
		status: "reserved",
	},
];

// 시간 문자열 파싱 (중복 제거용 공통 함수)
function parseTime(time: string): { hours: number; minutes: number } | null {
	const [hours, minutes] = time.split(":").map(Number);
	if (hours === undefined || minutes === undefined) return null;
	return { hours, minutes };
}

// 시간 슬롯 인덱스 계산 (10:00 = 0, 10:30 = 1, ...)
export function getTimeSlotIndex(time: string): number {
	const parsed = parseTime(time);
	if (!parsed) return 0;
	return (parsed.hours - 10) * 2 + (parsed.minutes === 30 ? 1 : 0);
}

// duration 기반 슬롯 수 계산 (30분 = 1슬롯)
export function getDurationSlots(duration: number): number {
	return duration / 30;
}

// 시간 문자열을 분 단위로 변환 (10:30 -> 630)
export function timeToMinutes(time: string): number {
	const parsed = parseTime(time);
	if (!parsed) return 0;
	return parsed.hours * 60 + parsed.minutes;
}

// 두 예약의 시간이 충돌하는지 확인
export function isTimeConflict(
	start1: string,
	duration1: number,
	start2: string,
	duration2: number,
): boolean {
	const startMin1 = timeToMinutes(start1);
	const endMin1 = startMin1 + duration1;
	const startMin2 = timeToMinutes(start2);
	const endMin2 = startMin2 + duration2;

	// 겹침 조건: start1 < end2 AND start2 < end1
	return startMin1 < endMin2 && startMin2 < endMin1;
}

// 충돌하는 예약 찾기
export function findConflictingReservation(
	reservations: Reservation[],
	staffId: string,
	date: string,
	startTime: string,
	duration: number,
	excludeId?: string,
): Reservation | null {
	return (
		reservations.find(
			(r) =>
				r.id !== excludeId &&
				r.staffId === staffId &&
				r.date === date &&
				r.status !== "cancelled" &&
				isTimeConflict(r.startTime, r.duration, startTime, duration),
		) ?? null
	);
}
