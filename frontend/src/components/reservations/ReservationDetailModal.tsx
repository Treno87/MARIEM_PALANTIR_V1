import type { ReactElement } from "react";
import { STATUS_CONFIG } from "./constants";
import type { Reservation } from "./types";

interface ReservationDetailModalProps {
	isOpen: boolean;
	reservation: Reservation | null;
	onClose: () => void;
	onEdit: (reservation: Reservation) => void;
	onCancel: (id: string) => void;
	onSale: (reservation: Reservation) => void;
}

export default function ReservationDetailModal({
	isOpen,
	reservation,
	onClose,
	onEdit,
	onCancel,
	onSale,
}: ReservationDetailModalProps): ReactElement | null {
	if (!isOpen || !reservation) return null;

	const statusStyle = STATUS_CONFIG[reservation.status];

	const handleSale = (): void => {
		onSale(reservation);
		onClose();
	};

	const handleEdit = (): void => {
		onEdit(reservation);
		onClose();
	};

	const handleCancel = (): void => {
		onCancel(reservation.id);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-neutral-200 p-6">
					<h2 className="text-xl font-bold text-neutral-800">예약 상세</h2>
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{/* Content */}
				<div className="space-y-4 p-6">
					{/* 기본 정보 */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-neutral-500">고객</p>
							<p className="font-medium text-neutral-800">
								{reservation.customerName}
								{reservation.isNewCustomer && (
									<span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
										신규
									</span>
								)}
							</p>
						</div>
						<div>
							<p className="text-sm text-neutral-500">담당자</p>
							<p className="font-medium text-neutral-800">{reservation.staffName}</p>
						</div>
						<div>
							<p className="text-sm text-neutral-500">시술</p>
							<p className="font-medium text-neutral-800">{reservation.serviceName}</p>
						</div>
						<div>
							<p className="text-sm text-neutral-500">상태</p>
							<span
								className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
							>
								{statusStyle.label}
							</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">날짜</p>
							<p className="font-medium text-neutral-800">{reservation.date}</p>
						</div>
						<div>
							<p className="text-sm text-neutral-500">시간</p>
							<p className="font-medium text-neutral-800">
								{reservation.startTime} ({reservation.duration}분)
							</p>
						</div>
					</div>

					{/* 메모 */}
					{reservation.memo !== undefined && reservation.memo !== "" && (
						<div>
							<p className="mb-1 text-sm text-neutral-500">메모</p>
							<p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
								{reservation.memo}
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div
					data-testid="detail-modal-footer"
					className="flex justify-center gap-2 border-t border-neutral-200 bg-neutral-50 p-4"
				>
					{reservation.status === "reserved" && (
						<>
							<button
								onClick={handleSale}
								aria-label="거래입력"
								className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-green-600 transition-colors hover:bg-green-50"
							>
								<span className="material-symbols-outlined text-2xl">point_of_sale</span>
								<span className="text-xs font-medium">거래입력</span>
							</button>
							<button
								onClick={handleEdit}
								aria-label="수정"
								className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
							>
								<span className="material-symbols-outlined text-2xl">edit</span>
								<span className="text-xs font-medium">수정</span>
							</button>
							<button
								onClick={handleCancel}
								aria-label="취소"
								className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
							>
								<span className="material-symbols-outlined text-2xl">event_busy</span>
								<span className="text-xs font-medium">취소</span>
							</button>
						</>
					)}
					<button
						onClick={onClose}
						aria-label="닫기"
						className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-neutral-600 transition-colors hover:bg-neutral-200"
					>
						<span className="material-symbols-outlined text-2xl">close</span>
						<span className="text-xs font-medium">닫기</span>
					</button>
				</div>
			</div>
		</div>
	);
}
