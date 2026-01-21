import { useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import type { DiscountEvent } from "../sale/types";

export default function EventsPage() {
	const { discountEvents, addDiscountEvent, updateDiscountEvent, deleteDiscountEvent } =
		useCatalog();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState<DiscountEvent | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		discountType: "percent" as "percent" | "amount",
		discountValue: "",
	});

	const openAddModal = () => {
		setEditingEvent(null);
		setFormData({ name: "", discountType: "percent", discountValue: "" });
		setIsModalOpen(true);
	};

	const openEditModal = (event: DiscountEvent) => {
		setEditingEvent(event);
		setFormData({
			name: event.name,
			discountType: event.discountType,
			discountValue: String(event.discountValue),
		});
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingEvent(null);
		setFormData({ name: "", discountType: "percent", discountValue: "" });
	};

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.discountValue) return;

		const discountValue = parseInt(formData.discountValue);
		if (isNaN(discountValue)) return;

		if (editingEvent) {
			updateDiscountEvent(editingEvent.id, {
				name: formData.name,
				discountType: formData.discountType,
				discountValue,
			});
		} else {
			addDiscountEvent({
				name: formData.name,
				discountType: formData.discountType,
				discountValue,
			});
		}
		closeModal();
	};

	const handleDelete = (id: string) => {
		if (confirm("이 이벤트를 삭제하시겠습니까?")) {
			deleteDiscountEvent(id);
		}
	};

	const formatDiscount = (event: DiscountEvent): string => {
		if (event.discountType === "percent") {
			return `${String(event.discountValue)}% 할인`;
		}
		return `${event.discountValue.toLocaleString()}원 할인`;
	};

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">이벤트 관리</h1>
					<p className="mt-1 text-neutral-500">할인 이벤트를 관리합니다</p>
				</div>
				<button
					onClick={openAddModal}
					className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
				>
					<span className="material-symbols-outlined">add</span>
					이벤트 추가
				</button>
			</div>

			{/* Events Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{discountEvents.map((event) => (
					<div
						key={event.id}
						className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg"
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
									<span className="material-symbols-outlined text-orange-600">local_offer</span>
								</div>
								<div>
									<h3 className="font-bold text-neutral-800">{event.name}</h3>
									<p className="mt-1 text-sm">
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
												event.discountType === "percent"
													? "bg-blue-100 text-blue-700"
													: "bg-green-100 text-green-700"
											}`}
										>
											{formatDiscount(event)}
										</span>
									</p>
									{event.applicableTo && event.applicableTo.length > 0 && (
										<p className="mt-2 text-xs text-neutral-500">특정 시술에만 적용</p>
									)}
								</div>
							</div>
							<div className="flex gap-1">
								<button
									onClick={() => {
										openEditModal(event);
									}}
									className="hover:bg-primary-50 hover:text-primary-500 rounded-lg p-2 text-neutral-400 transition-colors"
								>
									<span className="material-symbols-outlined text-xl">edit</span>
								</button>
								<button
									onClick={() => {
										handleDelete(event.id);
									}}
									className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
								>
									<span className="material-symbols-outlined text-xl">delete</span>
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{discountEvents.length === 0 && (
				<div className="py-16 text-center">
					<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">
						local_offer
					</span>
					<p className="text-neutral-400">등록된 이벤트가 없습니다</p>
					<button
						onClick={openAddModal}
						className="text-primary-500 mt-4 font-bold hover:underline"
					>
						첫 번째 이벤트 추가하기
					</button>
				</div>
			)}

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingEvent ? "이벤트 수정" : "이벤트 추가"}
							</h2>
						</div>
						<div className="space-y-6 p-6">
							{/* Name Input */}
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">이벤트명</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => {
										setFormData((prev) => ({ ...prev, name: e.target.value }));
									}}
									placeholder="여름특가, 신규고객 등"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>

							{/* Discount Type */}
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">할인 유형</label>
								<div className="flex gap-3">
									<button
										onClick={() => {
											setFormData((prev) => ({
												...prev,
												discountType: "percent",
											}));
										}}
										className={`flex-1 rounded-xl border px-4 py-3 font-medium transition-colors ${
											formData.discountType === "percent"
												? "border-primary-500 bg-primary-500 text-white"
												: "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
										}`}
									>
										% 할인
									</button>
									<button
										onClick={() => {
											setFormData((prev) => ({
												...prev,
												discountType: "amount",
											}));
										}}
										className={`flex-1 rounded-xl border px-4 py-3 font-medium transition-colors ${
											formData.discountType === "amount"
												? "border-primary-500 bg-primary-500 text-white"
												: "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
										}`}
									>
										금액 할인
									</button>
								</div>
							</div>

							{/* Discount Value */}
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">
									{formData.discountType === "percent" ? "할인율 (%)" : "할인 금액 (원)"}
								</label>
								<input
									type="number"
									value={formData.discountValue}
									onChange={(e) => {
										setFormData((prev) => ({
											...prev,
											discountValue: e.target.value,
										}));
									}}
									placeholder={formData.discountType === "percent" ? "10" : "5000"}
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
								{formData.discountType === "percent" && (
									<p className="mt-1 text-xs text-neutral-500">1~100 사이의 값을 입력하세요</p>
								)}
							</div>
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								onClick={closeModal}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								취소
							</button>
							<button
								onClick={handleSubmit}
								disabled={!formData.name.trim() || !formData.discountValue}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
							>
								{editingEvent ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
