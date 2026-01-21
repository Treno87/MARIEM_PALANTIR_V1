import { type ReactElement, useMemo, useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import { useStaff } from "../../contexts/StaffContext";
import { DURATION_OPTIONS, findConflictingReservation, TIME_SLOTS } from "./constants";
import type { Reservation, ReservationFormData } from "./types";

interface ReservationFormModalProps {
	isOpen: boolean;
	staffId: string;
	staffName: string;
	date: string;
	startTime: string;
	editingReservation?: Reservation | null;
	reservations: Reservation[];
	onClose: () => void;
	onSubmit: (data: ReservationFormData) => void;
}

// 시술명으로 카테고리 ID 찾기
function findCategoryIdByServiceName(
	serviceCategories: { id: string; items: { name: string }[] }[],
	serviceName: string,
): string {
	for (const category of serviceCategories) {
		const found = category.items.find((item) => item.name === serviceName);
		if (found) {
			return category.id;
		}
	}
	return "";
}

export default function ReservationFormModal({
	isOpen,
	staffId,
	staffName,
	date,
	startTime,
	editingReservation,
	reservations,
	onClose,
	onSubmit,
}: ReservationFormModalProps): ReactElement | null {
	const { serviceCategories } = useCatalog();
	const { salesStaff } = useStaff();

	// 수정 모드에서 기존 시술명으로 카테고리 ID 찾기
	const initialCategoryId = editingReservation
		? findCategoryIdByServiceName(serviceCategories, editingReservation.serviceName)
		: "";

	// 초기값은 editingReservation에서 가져옴 (key prop으로 리마운트되므로 안전)
	const [customerName, setCustomerName] = useState(editingReservation?.customerName ?? "");
	const [isNewCustomer, setIsNewCustomer] = useState(editingReservation?.isNewCustomer ?? false);
	const [formStaffId, setFormStaffId] = useState(editingReservation?.staffId ?? staffId);
	const [formDate, setFormDate] = useState(editingReservation?.date ?? date);
	const [formStartTime, setFormStartTime] = useState(editingReservation?.startTime ?? startTime);
	const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
	const [serviceName, setServiceName] = useState(editingReservation?.serviceName ?? "");
	const [duration, setDuration] = useState(editingReservation?.duration ?? 60);
	const [memo, setMemo] = useState(editingReservation?.memo ?? "");

	// 충돌하는 예약 검사
	const conflictingReservation = useMemo(() => {
		if (!formStaffId || !formDate || !formStartTime) return null;
		return findConflictingReservation(
			reservations,
			formStaffId,
			formDate,
			formStartTime,
			duration,
			editingReservation?.id,
		);
	}, [reservations, formStaffId, formDate, formStartTime, duration, editingReservation?.id]);

	// 선택된 담당자 이름 찾기
	const selectedStaff = salesStaff.find((s) => s.id === formStaffId);
	const formStaffName = selectedStaff?.name ?? staffName;

	const isEditMode = editingReservation !== null;

	// 선택된 카테고리의 시술 목록
	const selectedCategory = serviceCategories.find((c) => c.id === selectedCategoryId);
	const serviceItems = selectedCategory?.items ?? [];

	if (!isOpen) return null;

	const resetForm = (): void => {
		setCustomerName("");
		setIsNewCustomer(false);
		setSelectedCategoryId("");
		setServiceName("");
		setDuration(60);
		setMemo("");
	};

	const handleSubmit = (): void => {
		if (!customerName.trim() || !serviceName.trim()) return;
		// staffId가 없으면 기본값 사용
		const finalStaffId = formStaffId || staffId;
		const finalStaffName = formStaffName || staffName;

		const formData: ReservationFormData = {
			customerId: `cust-${String(Date.now())}`,
			customerName: customerName.trim(),
			isNewCustomer,
			staffId: finalStaffId,
			staffName: finalStaffName,
			serviceName: serviceName.trim(),
			date: formDate,
			startTime: formStartTime,
			duration,
		};
		if (memo.trim()) {
			formData.memo = memo.trim();
		}
		onSubmit(formData);
		resetForm();
	};

	const isValid =
		customerName.trim() !== "" && serviceName.trim() !== "" && conflictingReservation === null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-neutral-200 p-6">
					<h2 className="text-xl font-bold text-neutral-800">
						{isEditMode ? "예약 수정" : "예약 등록"}
					</h2>
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{/* Form */}
				<div className="space-y-4 p-6">
					{/* 고객 + 담당자 */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="customer" className="mb-1 block text-sm font-medium text-neutral-700">
								고객 *
							</label>
							<input
								id="customer"
								type="text"
								value={customerName}
								onChange={(e) => {
									setCustomerName(e.target.value);
								}}
								placeholder="고객명"
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
							/>
							<label className="mt-1.5 flex items-center gap-1.5">
								<input
									type="checkbox"
									checked={isNewCustomer}
									onChange={(e) => {
										setIsNewCustomer(e.target.checked);
									}}
									className="text-primary-500 focus:ring-primary-500 h-3.5 w-3.5 rounded border-neutral-300"
								/>
								<span className="text-xs text-neutral-600">신규 고객</span>
							</label>
						</div>
						<div>
							<label htmlFor="staff" className="mb-1 block text-sm font-medium text-neutral-700">
								담당자 *
							</label>
							<select
								id="staff"
								value={formStaffId}
								onChange={(e) => {
									setFormStaffId(e.target.value);
								}}
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
							>
								{salesStaff.map((s) => (
									<option key={s.id} value={s.id}>
										{s.name}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* 예약 날짜 + 예약 시간 */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="reservationDate"
								className="mb-1 block text-sm font-medium text-neutral-700"
							>
								예약 날짜 *
							</label>
							<input
								id="reservationDate"
								type="date"
								value={formDate}
								onChange={(e) => {
									setFormDate(e.target.value);
								}}
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
							/>
						</div>
						<div>
							<label
								htmlFor="reservationTime"
								className="mb-1 block text-sm font-medium text-neutral-700"
							>
								예약 시간 *
							</label>
							<select
								id="reservationTime"
								value={formStartTime}
								onChange={(e) => {
									setFormStartTime(e.target.value);
								}}
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
							>
								{TIME_SLOTS.map((slot) => (
									<option key={slot.time} value={slot.time}>
										{slot.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* 시술 카테고리 + 시술 */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="serviceCategory"
								className="mb-1 block text-sm font-medium text-neutral-700"
							>
								시술 카테고리 *
							</label>
							<select
								id="serviceCategory"
								value={selectedCategoryId}
								onChange={(e) => {
									setSelectedCategoryId(e.target.value);
									setServiceName("");
								}}
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
							>
								<option value="">카테고리 선택</option>
								{serviceCategories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="service" className="mb-1 block text-sm font-medium text-neutral-700">
								시술 *
							</label>
							<select
								id="service"
								value={serviceName}
								onChange={(e) => {
									setServiceName(e.target.value);
								}}
								disabled={!selectedCategoryId}
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
							>
								<option value="">시술 선택</option>
								{serviceItems.map((item) => (
									<option key={item.id} value={item.name}>
										{item.name}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* 소요시간 */}
					<div>
						<label htmlFor="duration" className="mb-1 block text-sm font-medium text-neutral-700">
							소요시간 *
						</label>
						<select
							id="duration"
							value={duration}
							onChange={(e) => {
								setDuration(Number(e.target.value));
							}}
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
						>
							{DURATION_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					{/* 메모 */}
					<div>
						<label htmlFor="memo" className="mb-1 block text-sm font-medium text-neutral-700">
							메모
						</label>
						<textarea
							id="memo"
							value={memo}
							onChange={(e) => {
								setMemo(e.target.value);
							}}
							placeholder="메모를 입력하세요 (선택)"
							rows={2}
							className="focus:border-primary-500 focus:ring-primary-500 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
						/>
					</div>

					{/* 충돌 경고 메시지 */}
					{conflictingReservation !== null && (
						<div
							className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
							role="alert"
						>
							<span className="material-symbols-outlined text-red-500">warning</span>
							<div className="text-sm text-red-700">
								<p className="font-medium">예약 시간이 충돌합니다</p>
								<p className="mt-1">
									{conflictingReservation.customerName}님의 예약 ({conflictingReservation.startTime}
									, {conflictingReservation.serviceName})과 시간이 겹칩니다.
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 p-6">
					<button
						onClick={onClose}
						className="rounded-xl px-5 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
					>
						취소
					</button>
					<button
						onClick={handleSubmit}
						disabled={!isValid}
						className="bg-primary-500 hover:bg-primary-600 rounded-xl px-5 py-2.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isEditMode ? "저장" : "등록"}
					</button>
				</div>
			</div>
		</div>
	);
}
