import { type ReactElement, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaff } from "../../contexts/StaffContext";
import { MOCK_RESERVATIONS, STATUS_CONFIG } from "./constants";
import ReservationCalendar from "./ReservationCalendar";
import ReservationDetailModal from "./ReservationDetailModal";
import ReservationFormModal from "./ReservationFormModal";
import ReservationGrid from "./ReservationGrid";
import type { Reservation, ReservationFormData } from "./types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateHeader(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const weekday = WEEKDAYS[date.getDay()] ?? "";
	return `${String(year)}년 ${month}월 ${day}일 (${weekday})`;
}

function formatDateString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${String(year)}-${month}-${day}`;
}

export default function ReservationPage(): ReactElement {
	const navigate = useNavigate();
	const { salesStaff } = useStaff();
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

	// 모달 상태
	const [isFormModalOpen, setIsFormModalOpen] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
	const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
	const [formContext, setFormContext] = useState({
		staffId: "",
		startTime: "",
	});

	const dateString = formatDateString(selectedDate);

	// 선택된 날짜의 예약만 필터링
	const filteredReservations = useMemo(() => {
		return reservations.filter((r) => r.date === dateString);
	}, [reservations, dateString]);

	// Summary 계산
	const summary = useMemo(() => {
		const total = filteredReservations.length;
		const completed = filteredReservations.filter((r) => r.status === "completed").length;
		const cancelled = filteredReservations.filter((r) => r.status === "cancelled").length;
		return { total, completed, cancelled };
	}, [filteredReservations]);

	// 날짜 네비게이션
	const handlePrevDay = (): void => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() - 1);
		setSelectedDate(newDate);
	};

	const handleNextDay = (): void => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + 1);
		setSelectedDate(newDate);
	};

	const handleToday = (): void => {
		setSelectedDate(new Date());
	};

	// 예약추가 버튼 클릭 -> 기본값으로 예약 등록 모달
	const handleAddReservation = (): void => {
		const firstStaff = salesStaff[0];
		setEditingReservation(null);
		setFormContext({
			staffId: firstStaff?.id ?? "",
			startTime: "10:00",
		});
		setIsFormModalOpen(true);
	};

	// 빈 슬롯 클릭 -> 예약 등록 모달
	const handleSlotClick = (staffId: string, _staffName: string, time: string): void => {
		setEditingReservation(null);
		setFormContext({ staffId, startTime: time });
		setIsFormModalOpen(true);
	};

	// 예약 블록 클릭 -> 상세 모달
	const handleReservationClick = (reservation: Reservation): void => {
		setSelectedReservation(reservation);
		setIsDetailModalOpen(true);
	};

	// 예약 수정 버튼 클릭
	const handleEditReservation = (reservation: Reservation): void => {
		setEditingReservation(reservation);
		setFormContext({
			staffId: reservation.staffId,
			startTime: reservation.startTime,
		});
		setIsFormModalOpen(true);
	};

	// 예약 등록/수정
	const handleFormSubmit = (data: ReservationFormData): void => {
		if (editingReservation === null) {
			// 등록 모드
			const newReservation: Reservation = {
				id: `res-${String(Date.now())}`,
				...data,
				status: "reserved",
			};
			setReservations((prev) => [...prev, newReservation]);
		} else {
			// 수정 모드
			setReservations((prev) =>
				prev.map((r) => (r.id === editingReservation.id ? { ...r, ...data, status: r.status } : r)),
			);
		}

		setIsFormModalOpen(false);
		setEditingReservation(null);
	};

	// 예약 취소
	const handleCancelReservation = (id: string): void => {
		setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)));
	};

	// 거래입력 페이지로 이동
	const handleSaleReservation = (reservation: Reservation): void => {
		void navigate("/sale", {
			state: {
				customerId: reservation.customerId,
				customerName: reservation.customerName,
				staffId: reservation.staffId,
				staffName: reservation.staffName,
				serviceName: reservation.serviceName,
			},
		});
	};

	return (
		<div className="flex h-full flex-col bg-neutral-50 p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-neutral-800">예약관리</h1>
				<div className="flex items-center gap-4">
					<button
						onClick={handleToday}
						className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
					>
						오늘
					</button>
					<button
						onClick={handlePrevDay}
						aria-label="이전 날짜"
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
					>
						<span className="material-symbols-outlined">chevron_left</span>
					</button>
					<span className="min-w-[180px] text-center font-medium text-neutral-800">
						{formatDateHeader(selectedDate)}
					</span>
					<button
						onClick={handleNextDay}
						aria-label="다음 날짜"
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
					>
						<span className="material-symbols-outlined">chevron_right</span>
					</button>
					<button
						onClick={handleAddReservation}
						className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
					>
						<span className="material-symbols-outlined text-lg">add</span>
						예약추가
					</button>
				</div>
			</div>

			{/* 날짜 선택 캘린더 */}
			<ReservationCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

			{/* Summary 카드 */}
			<div className="mb-6 grid grid-cols-3 gap-4">
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">오늘 예약</p>
					<p className="text-2xl font-bold text-neutral-800">{summary.total}건</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">완료</p>
					<p className="text-2xl font-bold text-green-600">{summary.completed}건</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">취소</p>
					<p className="text-2xl font-bold text-red-600">{summary.cancelled}건</p>
				</div>
			</div>

			{/* 상태 범례 */}
			<div data-testid="status-legend" className="mb-2 flex justify-end gap-4">
				{Object.entries(STATUS_CONFIG).map(([key, config]) => (
					<div key={key} className="flex items-center gap-1.5">
						<span className={`h-3 w-3 rounded-full ${config.bg}`} />
						<span className="text-xs text-neutral-600">{config.label}</span>
					</div>
				))}
			</div>

			{/* 예약 그리드 */}
			<ReservationGrid
				staff={salesStaff}
				reservations={filteredReservations}
				onSlotClick={handleSlotClick}
				onReservationClick={handleReservationClick}
			/>

			{/* 예약 등록/수정 모달 */}
			<ReservationFormModal
				key={editingReservation?.id ?? "new"}
				isOpen={isFormModalOpen}
				staffId={formContext.staffId}
				date={editingReservation?.date ?? dateString}
				startTime={formContext.startTime}
				editingReservation={editingReservation}
				reservations={reservations}
				onClose={() => {
					setIsFormModalOpen(false);
					setEditingReservation(null);
				}}
				onSubmit={handleFormSubmit}
			/>

			{/* 예약 상세 모달 */}
			<ReservationDetailModal
				isOpen={isDetailModalOpen}
				reservation={selectedReservation}
				onClose={() => {
					setIsDetailModalOpen(false);
					setSelectedReservation(null);
				}}
				onEdit={handleEditReservation}
				onCancel={handleCancelReservation}
				onSale={handleSaleReservation}
			/>
		</div>
	);
}
