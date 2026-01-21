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

// Mock 예약 데이터 (staffId는 실제 Staff ID와 일치)
export const MOCK_RESERVATIONS: Reservation[] = [
	{
		id: "res-1",
		customerId: "cust-1",
		customerName: "김미영",
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
		customerId: "cust-2",
		customerName: "이수진",
		isNewCustomer: true,
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
		customerId: "cust-3",
		customerName: "박지현",
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
		customerId: "cust-4",
		customerName: "최영희",
		isNewCustomer: false,
		staffId: "2",
		staffName: "박수민",
		serviceName: "클리닉",
		date: "2026-01-21",
		startTime: "16:00",
		duration: 60,
		status: "reserved",
	},
	{
		id: "res-5",
		customerId: "cust-5",
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
		customerId: "cust-6",
		customerName: "정다은",
		isNewCustomer: true,
		staffId: "3",
		staffName: "이하늘",
		serviceName: "매직",
		date: "2026-01-21",
		startTime: "13:00",
		duration: 120,
		status: "reserved",
	},
];

// 시간 슬롯 인덱스 계산 (10:00 = 0, 10:30 = 1, ...)
export function getTimeSlotIndex(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	if (hours === undefined || minutes === undefined) return 0;
	return (hours - 10) * 2 + (minutes === 30 ? 1 : 0);
}

// duration 기반 슬롯 수 계산 (30분 = 1슬롯)
export function getDurationSlots(duration: number): number {
	return duration / 30;
}
