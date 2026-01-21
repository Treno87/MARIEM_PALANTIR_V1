import type { DragEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
import { TIME_SLOTS } from "./constants";
import ReservationBlock from "./ReservationBlock";
import type { Reservation } from "./types";

interface StaffForGrid {
	id: string;
	name: string;
	color: string;
}

interface DropTarget {
	staffId: string;
	staffName: string;
	time: string;
}

interface ReservationGridProps {
	staff: StaffForGrid[];
	reservations: Reservation[];
	onSlotClick: (staffId: string, staffName: string, time: string) => void;
	onReservationClick: (reservation: Reservation) => void;
	onReservationDrop?: (reservationId: string, target: DropTarget) => void;
}

export default function ReservationGrid({
	staff,
	reservations,
	onSlotClick,
	onReservationClick,
	onReservationDrop,
}: ReservationGridProps): ReactElement {
	const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const getReservationsForStaff = (staffId: string): Reservation[] => {
		return reservations.filter((r) => r.staffId === staffId);
	};

	const slotCount = TIME_SLOTS.length;

	const handleDragOver = (e: DragEvent<HTMLDivElement>, staffId: string, time: string): void => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverSlot(`${staffId}-${time}`);
	};

	const handleDragLeave = (): void => {
		setDragOverSlot(null);
	};

	const handleBlockDragStart = (): void => {
		// 동기적으로 pointer-events를 변경하면 브라우저가 드래그를 취소함
		requestAnimationFrame(() => {
			setIsDragging(true);
		});
	};

	useEffect(() => {
		const handleDocumentDragEnd = (): void => {
			setIsDragging(false);
		};

		document.addEventListener("dragend", handleDocumentDragEnd);
		return () => {
			document.removeEventListener("dragend", handleDocumentDragEnd);
		};
	}, []);

	const handleDrop = (
		e: DragEvent<HTMLDivElement>,
		staffId: string,
		staffName: string,
		time: string,
	): void => {
		e.preventDefault();
		setDragOverSlot(null);

		const reservationId = e.dataTransfer.getData("text/plain");
		if (!reservationId || !onReservationDrop) return;

		onReservationDrop(reservationId, { staffId, staffName, time });
	};

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
								{TIME_SLOTS.map((slot) => {
									const slotKey = `${s.id}-${slot.time}`;
									const isOver = dragOverSlot === slotKey;
									return (
										<div
											key={slot.time}
											data-empty-slot="true"
											data-drop-zone="true"
											data-staff-id={s.id}
											data-time={slot.time}
											className={`h-14 flex-1 cursor-pointer border-r border-neutral-100 transition-colors hover:bg-neutral-50 ${isOver ? "bg-primary-100" : ""}`}
											onClick={() => {
												onSlotClick(s.id, s.name, slot.time);
											}}
											onDragOver={(e) => {
												handleDragOver(e, s.id, slot.time);
											}}
											onDragLeave={handleDragLeave}
											onDrop={(e) => {
												handleDrop(e, s.id, s.name, slot.time);
											}}
										/>
									);
								})}

								{/* 예약 블록들 */}
								{getReservationsForStaff(s.id).map((reservation) => (
									<ReservationBlock
										key={reservation.id}
										reservation={reservation}
										slotCount={slotCount}
										onClick={onReservationClick}
										isDragging={isDragging}
										onDragStart={handleBlockDragStart}
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
