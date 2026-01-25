import type { ReactElement } from "react";
import { TIME_SLOTS } from "./constants";
import ReservationBlock from "./ReservationBlock";
import type { Reservation } from "./types";

interface StaffForGrid {
	id: string;
	name: string;
	color: string;
}

interface ReservationGridProps {
	staff: StaffForGrid[];
	reservations: Reservation[];
	onSlotClick: (staffId: string, staffName: string, time: string) => void;
	onReservationClick: (reservation: Reservation) => void;
}

export default function ReservationGrid({
	staff,
	reservations,
	onSlotClick,
	onReservationClick,
}: ReservationGridProps): ReactElement {
	const getReservationsForStaff = (staffId: string): Reservation[] => {
		return reservations.filter((r) => r.staffId === staffId);
	};

	// 슬롯 수 (10:00 ~ 20:00, 30분 단위)
	const slotCount = TIME_SLOTS.length;

	return (
		<div
			data-testid="reservation-grid"
			className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white"
		>
			<div className="flex h-full flex-col">
				{/* 시간 헤더 */}
				<div className="sticky top-0 z-10 flex border-b border-neutral-200 bg-neutral-50">
					<div className="w-20 shrink-0 border-r border-neutral-200 px-2 py-2">
						<span className="text-xs font-bold text-neutral-600">담당자</span>
					</div>
					<div className="flex flex-1">
						{TIME_SLOTS.map((slot) => (
							<div
								key={slot.time}
								className="flex flex-1 items-center justify-center border-r border-neutral-100 py-2"
							>
								<span className="text-[10px] font-medium text-neutral-500 sm:text-xs">
									{slot.label}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* 담당자별 행 */}
				<div className="flex-1 overflow-y-auto">
					{staff.map((s) => (
						<div key={s.id} className="flex border-b border-neutral-100 last:border-b-0">
							{/* 담당자 이름 */}
							<div className="flex w-20 shrink-0 items-center gap-1 border-r border-neutral-200 bg-white px-2 py-3">
								<span
									className="h-2.5 w-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: s.color }}
								/>
								<span className="truncate text-xs font-medium text-neutral-700 sm:text-sm">
									{s.name}
								</span>
							</div>

							{/* 시간 슬롯 */}
							<div className="relative flex flex-1">
								{TIME_SLOTS.map((slot) => (
									<div
										key={slot.time}
										data-empty-slot="true"
										className="h-14 flex-1 cursor-pointer border-r border-neutral-100 transition-colors hover:bg-neutral-50"
										onClick={() => {
											onSlotClick(s.id, s.name, slot.time);
										}}
									/>
								))}

								{/* 예약 블록들 */}
								{getReservationsForStaff(s.id).map((reservation) => (
									<ReservationBlock
										key={reservation.id}
										reservation={reservation}
										slotCount={slotCount}
										onClick={onReservationClick}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
