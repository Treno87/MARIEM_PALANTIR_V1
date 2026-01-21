import type { ReactElement } from "react";

interface ReservationCalendarProps {
	selectedDate: Date;
	onDateSelect: (date: Date) => void;
}

export default function ReservationCalendar({
	selectedDate,
	onDateSelect,
}: ReservationCalendarProps): ReactElement {
	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();

	// 해당 월의 일 수 계산
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const handleDayClick = (day: number): void => {
		const newDate = new Date(year, month, day);
		onDateSelect(newDate);
	};

	// 요일별 텍스트 색상 (0=일, 6=토)
	const getDayTextColor = (day: number): string => {
		const date = new Date(year, month, day);
		const dayOfWeek = date.getDay();
		if (dayOfWeek === 0) return "text-red-500"; // 일요일
		if (dayOfWeek === 6) return "text-blue-500"; // 토요일
		return "text-neutral-600";
	};

	return (
		<div data-testid="reservation-calendar" className="mb-6 flex gap-1 overflow-x-auto pb-2">
			{Array.from({ length: daysInMonth }, (_, i) => {
				const day = i + 1;
				const isSelected = selectedDate.getDate() === day;
				const dayTextColor = getDayTextColor(day);
				return (
					<button
						key={day}
						onClick={() => {
							handleDayClick(day);
						}}
						className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
							isSelected
								? "bg-primary-500 text-white"
								: `bg-white ${dayTextColor} hover:bg-neutral-100`
						}`}
					>
						{day}
					</button>
				);
			})}
		</div>
	);
}
