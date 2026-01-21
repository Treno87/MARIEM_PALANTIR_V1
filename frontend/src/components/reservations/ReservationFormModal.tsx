import { type ReactElement, useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import { DURATION_OPTIONS, TIME_SLOTS } from "./constants";
import type { Reservation, ReservationFormData } from "./types";

interface ReservationFormModalProps {
	isOpen: boolean;
	staffId: string;
	staffName: string;
	date: string;
	startTime: string;
	editingReservation?: Reservation | null;
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
	onClose,
	onSubmit,
}: ReservationFormModalProps): ReactElement | null {
	const { serviceCategories } = useCatalog();

	// 수정 모드에서 기존 시술명으로 카테고리 ID 찾기
	const initialCategoryId = editingReservation
		? findCategoryIdByServiceName(serviceCategories, editingReservation.serviceName)
		: "";

	// 초기값은 editingReservation에서 가져옴 (key prop으로 리마운트되므로 안전)
	const [customerName, setCustomerName] = useState(editingReservation?.customerName ?? "");
	const [isNewCustomer, setIsNewCustomer] = useState(editingReservation?.isNewCustomer ?? false);
	const [formDate, setFormDate] = useState(editingReservation?.date ?? date);
	const [formStartTime, setFormStartTime] = useState(editingReservation?.startTime ?? startTime);
	const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
	const [serviceName, setServiceName] = useState(editingReservation?.serviceName ?? "");
	const [duration, setDuration] = useState(editingReservation?.duration ?? 60);
	const [memo, setMemo] = useState(editingReservation?.memo ?? "");

	const isEditMode = editingReservation !== null && editingReservation !== undefined;

	// 선택된 카테고리의 시술 목록
	const selectedCategory = serviceCategories.find((c) => c.id === selectedCategoryId);
	const serviceItems = selectedCategory?.items ?? [];

	if (!isOpen) return null;

	const handleCategoryChange = (categoryId: string): void => {
		setSelectedCategoryId(categoryId);
		setServiceName(""); // 카테고리 변경 시 시술 선택 초기화
	};

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

		const formData: ReservationFormData = {
			customerId: `cust-${String(Date.now())}`,
			customerName: customerName.trim(),
			isNewCustomer,
			staffId,
			staffName,
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

	const isValid = customerName.trim() !== "" && serviceName.trim() !== "";

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
					{/* 담당자 (읽기 전용) */}
					<div className="rounded-lg bg-neutral-50 p-4">
						<p className="text-sm text-neutral-500">담당자</p>
						<p className="font-medium text-neutral-800">{staffName}</p>
					</div>

					{/* 예약 날짜 */}
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
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:ring-2 focus:outline-none"
						/>
					</div>

					{/* 예약 시간 */}
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
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:ring-2 focus:outline-none"
						>
							{TIME_SLOTS.map((slot) => (
								<option key={slot.time} value={slot.time}>
									{slot.label}
								</option>
							))}
						</select>
					</div>

					{/* 고객 */}
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
							placeholder="고객명을 입력하세요"
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:ring-2 focus:outline-none"
						/>
						<label className="mt-2 flex items-center gap-2">
							<input
								type="checkbox"
								checked={isNewCustomer}
								onChange={(e) => {
									setIsNewCustomer(e.target.checked);
								}}
								className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded border-neutral-300"
							/>
							<span className="text-sm text-neutral-600">신규 고객</span>
						</label>
					</div>

					{/* 시술 카테고리 */}
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
								handleCategoryChange(e.target.value);
							}}
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:ring-2 focus:outline-none"
						>
							<option value="">카테고리 선택</option>
							{serviceCategories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))}
						</select>
					</div>

					{/* 시술 */}
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
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
						>
							<option value="">시술 선택</option>
							{serviceItems.map((item) => (
								<option key={item.id} value={item.name}>
									{item.name}
								</option>
							))}
						</select>
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
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:ring-2 focus:outline-none"
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
							rows={3}
							className="focus:border-primary-500 focus:ring-primary-500 w-full resize-none rounded-lg border border-neutral-200 px-4 py-2.5 focus:ring-2 focus:outline-none"
						/>
					</div>
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
