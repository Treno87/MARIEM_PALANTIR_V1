export type ReservationStatus = "reserved" | "completed" | "cancelled";

export interface Reservation {
	id: string;
	customerId: string;
	customerName: string;
	isNewCustomer: boolean;
	staffId: string;
	staffName: string;
	serviceName: string;
	date: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	duration: number; // minutes: 30, 60, 90, 120
	status: ReservationStatus;
	memo?: string;
}

export interface TimeSlot {
	time: string; // HH:mm
	label: string; // 10:00
}

export interface ReservationFormData {
	customerId: string;
	customerName: string;
	isNewCustomer: boolean;
	staffId: string;
	staffName: string;
	serviceName: string;
	date: string;
	startTime: string;
	duration: number;
	memo?: string;
}
