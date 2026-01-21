import type { ReactElement } from "react";
import { getDurationSlots, getTimeSlotIndex, STATUS_CONFIG } from "./constants";
import type { Reservation } from "./types";

interface ReservationBlockProps {
	reservation: Reservation;
	slotCount: number;
	onClick: (reservation: Reservation) => void;
}

export default function ReservationBlock({
	reservation,
	slotCount,
	onClick,
}: ReservationBlockProps): ReactElement {
	const startSlot = getTimeSlotIndex(reservation.startTime);
	const slots = getDurationSlots(reservation.duration);
	const statusStyle = STATUS_CONFIG[reservation.status];

	// Percentage 기반 위치/너비 계산
	const slotWidthPercent = 100 / slotCount;
	const leftPercent = startSlot * slotWidthPercent;
	const widthPercent = slots * slotWidthPercent;

	return (
		<div
			className={`absolute top-1 cursor-pointer overflow-hidden rounded px-1 py-0.5 sm:px-2 sm:py-1 ${statusStyle.bg}`}
			style={{
				left: `calc(${String(leftPercent)}% + 2px)`,
				width: `calc(${String(widthPercent)}% - 4px)`,
				height: "calc(100% - 8px)",
			}}
			onClick={() => {
				onClick(reservation);
			}}
		>
			<p className={`truncate text-[10px] font-medium sm:text-sm ${statusStyle.text}`}>
				{reservation.customerName}
				{reservation.isNewCustomer && (
					<span className="ml-0.5 text-[8px] sm:ml-1 sm:text-xs">(신규)</span>
				)}
			</p>
			<p className={`truncate text-[8px] sm:text-xs ${statusStyle.text} opacity-75`}>
				{reservation.serviceName} {reservation.duration}분
			</p>
		</div>
	);
}
