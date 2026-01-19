import { useState } from "react";
import { discountEvents as initialEvents } from "../sale/constants";
import type { DiscountEvent } from "../sale/types";

export default function EventsPage() {
	const [events, setEvents] = useState<DiscountEvent[]>(initialEvents);
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
			setEvents((prev) =>
				prev.map((e) =>
					e.id === editingEvent.id
						? {
								...e,
								name: formData.name,
								discountType: formData.discountType,
								discountValue,
							}
						: e,
				),
			);
		} else {
			const newEvent: DiscountEvent = {
				id: `ev-${Date.now()}`,
				name: formData.name,
				discountType: formData.discountType,
				discountValue,
			};
			setEvents((prev) => [...prev, newEvent]);
		}
		closeModal();
	};

	const handleDelete = (id: string) => {
		if (confirm("이 이벤트를 삭제하시겠습니까?")) {
			setEvents((prev) => prev.filter((e) => e.id !== id));
		}
	};

	const formatDiscount = (event: DiscountEvent) => {
		if (event.discountType === "percent") {
			return `${event.discountValue}% 할인`;
		}
		return `${event.discountValue.toLocaleString()}원 할인`;
	};

	return (
		<div className="flex-1 p-8 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">이벤트 관리</h1>
					<p className="text-neutral-500 mt-1">할인 이벤트를 관리합니다</p>
				</div>
				<button
					onClick={openAddModal}
					className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
				>
					<span className="material-symbols-outlined">add</span>
					이벤트 추가
				</button>
			</div>

			{/* Events Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{events.map((event) => (
					<div
						key={event.id}
						className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow"
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
									<span className="material-symbols-outlined text-orange-600">
										local_offer
									</span>
								</div>
								<div>
									<h3 className="font-bold text-neutral-800">{event.name}</h3>
									<p className="text-sm mt-1">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
												event.discountType === "percent"
													? "bg-blue-100 text-blue-700"
													: "bg-green-100 text-green-700"
											}`}
										>
											{formatDiscount(event)}
										</span>
									</p>
									{event.applicableTo && event.applicableTo.length > 0 && (
										<p className="text-xs text-neutral-500 mt-2">
											특정 시술에만 적용
										</p>
									)}
								</div>
							</div>
							<div className="flex gap-1">
								<button
									onClick={() => openEditModal(event)}
									className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
								>
									<span className="material-symbols-outlined text-xl">
										edit
									</span>
								</button>
								<button
									onClick={() => handleDelete(event.id)}
									className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
								>
									<span className="material-symbols-outlined text-xl">
										delete
									</span>
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{events.length === 0 && (
				<div className="text-center py-16">
					<span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">
						local_offer
					</span>
					<p className="text-neutral-400">등록된 이벤트가 없습니다</p>
					<button
						onClick={openAddModal}
						className="mt-4 text-primary-500 font-bold hover:underline"
					>
						첫 번째 이벤트 추가하기
					</button>
				</div>
			)}

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingEvent ? "이벤트 수정" : "이벤트 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							{/* Name Input */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									이벤트명
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="여름특가, 신규고객 등"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							{/* Discount Type */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									할인 유형
								</label>
								<div className="flex gap-3">
									<button
										onClick={() =>
											setFormData((prev) => ({
												...prev,
												discountType: "percent",
											}))
										}
										className={`flex-1 px-4 py-3 rounded-xl border font-medium transition-colors ${
											formData.discountType === "percent"
												? "bg-primary-500 text-white border-primary-500"
												: "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
										}`}
									>
										% 할인
									</button>
									<button
										onClick={() =>
											setFormData((prev) => ({
												...prev,
												discountType: "amount",
											}))
										}
										className={`flex-1 px-4 py-3 rounded-xl border font-medium transition-colors ${
											formData.discountType === "amount"
												? "bg-primary-500 text-white border-primary-500"
												: "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
										}`}
									>
										금액 할인
									</button>
								</div>
							</div>

							{/* Discount Value */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									{formData.discountType === "percent"
										? "할인율 (%)"
										: "할인 금액 (원)"}
								</label>
								<input
									type="number"
									value={formData.discountValue}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											discountValue: e.target.value,
										}))
									}
									placeholder={
										formData.discountType === "percent" ? "10" : "5000"
									}
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
								{formData.discountType === "percent" && (
									<p className="text-xs text-neutral-500 mt-1">
										1~100 사이의 값을 입력하세요
									</p>
								)}
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={closeModal}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleSubmit}
								disabled={!formData.name.trim() || !formData.discountValue}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
