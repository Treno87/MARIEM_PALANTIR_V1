import { useState } from "react";
import {
	membershipOptions as initialMembership,
	storedValueOptions as initialStoredValue,
} from "../sale/constants";
import type { MembershipOption, StoredValueOption } from "../sale/types";

type ActiveTab = "stored_value" | "membership";

export default function MembershipPage() {
	const [activeTab, setActiveTab] = useState<ActiveTab>("stored_value");
	const [storedValueOptions, setStoredValueOptions] =
		useState<StoredValueOption[]>(initialStoredValue);
	const [membershipOptions, setMembershipOptions] =
		useState<MembershipOption[]>(initialMembership);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<
		StoredValueOption | MembershipOption | null
	>(null);

	const [storedValueForm, setStoredValueForm] = useState({
		name: "",
		price: "",
		value: "",
	});
	const [membershipForm, setMembershipForm] = useState({
		name: "",
		price: "",
		count: "",
	});

	const openAddModal = () => {
		setEditingItem(null);
		if (activeTab === "stored_value") {
			setStoredValueForm({ name: "", price: "", value: "" });
		} else {
			setMembershipForm({ name: "", price: "", count: "" });
		}
		setIsModalOpen(true);
	};

	const openEditModal = (item: StoredValueOption | MembershipOption) => {
		setEditingItem(item);
		if (activeTab === "stored_value") {
			const sv = item as StoredValueOption;
			setStoredValueForm({
				name: sv.name,
				price: String(sv.price),
				value: String(sv.value),
			});
		} else {
			const mb = item as MembershipOption;
			setMembershipForm({
				name: mb.name,
				price: String(mb.price),
				count: String(mb.count),
			});
		}
		setIsModalOpen(true);
	};

	const handleStoredValueSubmit = () => {
		const { name, price, value } = storedValueForm;
		if (!name.trim() || !price || !value) return;

		const priceNum = parseInt(price);
		const valueNum = parseInt(value);
		if (isNaN(priceNum) || isNaN(valueNum)) return;

		if (editingItem) {
			setStoredValueOptions((prev) =>
				prev.map((sv) =>
					sv.id === editingItem.id
						? { ...sv, name, price: priceNum, value: valueNum }
						: sv,
				),
			);
		} else {
			const newItem: StoredValueOption = {
				id: `sv-${Date.now()}`,
				name,
				price: priceNum,
				value: valueNum,
			};
			setStoredValueOptions((prev) => [...prev, newItem]);
		}
		setIsModalOpen(false);
	};

	const handleMembershipSubmit = () => {
		const { name, price, count } = membershipForm;
		if (!name.trim() || !price || !count) return;

		const priceNum = parseInt(price);
		const countNum = parseInt(count);
		if (isNaN(priceNum) || isNaN(countNum)) return;

		if (editingItem) {
			setMembershipOptions((prev) =>
				prev.map((mb) =>
					mb.id === editingItem.id
						? { ...mb, name, price: priceNum, count: countNum }
						: mb,
				),
			);
		} else {
			const newItem: MembershipOption = {
				id: `mb-${Date.now()}`,
				name,
				price: priceNum,
				count: countNum,
			};
			setMembershipOptions((prev) => [...prev, newItem]);
		}
		setIsModalOpen(false);
	};

	const handleDelete = (id: string) => {
		if (confirm("이 옵션을 삭제하시겠습니까?")) {
			if (activeTab === "stored_value") {
				setStoredValueOptions((prev) => prev.filter((sv) => sv.id !== id));
			} else {
				setMembershipOptions((prev) => prev.filter((mb) => mb.id !== id));
			}
		}
	};

	return (
		<div className="flex-1 p-8 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">멤버쉽 관리</h1>
					<p className="text-neutral-500 mt-1">
						정액권과 정기권 옵션을 관리합니다
					</p>
				</div>
				<button
					onClick={openAddModal}
					className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
				>
					<span className="material-symbols-outlined">add</span>
					{activeTab === "stored_value" ? "정액권 추가" : "정기권 추가"}
				</button>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6">
				<button
					onClick={() => setActiveTab("stored_value")}
					className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
						activeTab === "stored_value"
							? "bg-primary-500 text-white"
							: "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
					}`}
				>
					<span className="flex items-center gap-2">
						<span className="material-symbols-outlined">
							account_balance_wallet
						</span>
						정액권 ({storedValueOptions.length})
					</span>
				</button>
				<button
					onClick={() => setActiveTab("membership")}
					className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
						activeTab === "membership"
							? "bg-primary-500 text-white"
							: "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
					}`}
				>
					<span className="flex items-center gap-2">
						<span className="material-symbols-outlined">card_membership</span>
						정기권 ({membershipOptions.length})
					</span>
				</button>
			</div>

			{/* Content */}
			<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
				{activeTab === "stored_value" ? (
					<div className="divide-y divide-neutral-100">
						{storedValueOptions.map((option) => (
							<div
								key={option.id}
								className="p-6 flex items-center justify-between hover:bg-neutral-50"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
										<span className="material-symbols-outlined text-purple-600">
											account_balance_wallet
										</span>
									</div>
									<div>
										<h3 className="font-bold text-neutral-800">
											{option.name}
										</h3>
										<div className="flex gap-4 mt-1 text-sm text-neutral-500">
											<span>판매가: {option.price.toLocaleString()}원</span>
											<span>충전액: {option.value.toLocaleString()}원</span>
											{option.value > option.price && (
												<span className="text-green-600 font-medium">
													(+
													{(
														((option.value - option.price) / option.price) *
														100
													).toFixed(0)}
													% 보너스)
												</span>
											)}
										</div>
									</div>
								</div>
								<div className="flex gap-1">
									<button
										onClick={() => openEditModal(option)}
										className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
									>
										<span className="material-symbols-outlined text-xl">
											edit
										</span>
									</button>
									<button
										onClick={() => handleDelete(option.id)}
										className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
									>
										<span className="material-symbols-outlined text-xl">
											delete
										</span>
									</button>
								</div>
							</div>
						))}
						{storedValueOptions.length === 0 && (
							<div className="p-8 text-center text-neutral-400">
								등록된 정액권이 없습니다
							</div>
						)}
					</div>
				) : (
					<div className="divide-y divide-neutral-100">
						{membershipOptions.map((option) => (
							<div
								key={option.id}
								className="p-6 flex items-center justify-between hover:bg-neutral-50"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
										<span className="material-symbols-outlined text-pink-600">
											card_membership
										</span>
									</div>
									<div>
										<h3 className="font-bold text-neutral-800">
											{option.name}
										</h3>
										<div className="flex gap-4 mt-1 text-sm text-neutral-500">
											<span>판매가: {option.price.toLocaleString()}원</span>
											<span>횟수: {option.count}회</span>
											<span className="text-blue-600 font-medium">
												(회당{" "}
												{Math.round(
													option.price / option.count,
												).toLocaleString()}
												원)
											</span>
										</div>
									</div>
								</div>
								<div className="flex gap-1">
									<button
										onClick={() => openEditModal(option)}
										className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
									>
										<span className="material-symbols-outlined text-xl">
											edit
										</span>
									</button>
									<button
										onClick={() => handleDelete(option.id)}
										className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
									>
										<span className="material-symbols-outlined text-xl">
											delete
										</span>
									</button>
								</div>
							</div>
						))}
						{membershipOptions.length === 0 && (
							<div className="p-8 text-center text-neutral-400">
								등록된 정기권이 없습니다
							</div>
						)}
					</div>
				)}
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingItem
									? activeTab === "stored_value"
										? "정액권 수정"
										: "정기권 수정"
									: activeTab === "stored_value"
										? "정액권 추가"
										: "정기권 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							{activeTab === "stored_value" ? (
								<>
									<div>
										<label className="block text-sm font-bold text-neutral-700 mb-2">
											이름
										</label>
										<input
											type="text"
											value={storedValueForm.name}
											onChange={(e) =>
												setStoredValueForm((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											placeholder="정액권 10만원"
											className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-neutral-700 mb-2">
											판매가
										</label>
										<input
											type="number"
											value={storedValueForm.price}
											onChange={(e) =>
												setStoredValueForm((prev) => ({
													...prev,
													price: e.target.value,
												}))
											}
											placeholder="100000"
											className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-neutral-700 mb-2">
											충전액
										</label>
										<input
											type="number"
											value={storedValueForm.value}
											onChange={(e) =>
												setStoredValueForm((prev) => ({
													...prev,
													value: e.target.value,
												}))
											}
											placeholder="100000"
											className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
										/>
										<p className="text-xs text-neutral-500 mt-1">
											판매가보다 높으면 보너스가 적용됩니다
										</p>
									</div>
								</>
							) : (
								<>
									<div>
										<label className="block text-sm font-bold text-neutral-700 mb-2">
											이름
										</label>
										<input
											type="text"
											value={membershipForm.name}
											onChange={(e) =>
												setMembershipForm((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											placeholder="커트 10회권"
											className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-neutral-700 mb-2">
											판매가
										</label>
										<input
											type="number"
											value={membershipForm.price}
											onChange={(e) =>
												setMembershipForm((prev) => ({
													...prev,
													price: e.target.value,
												}))
											}
											placeholder="200000"
											className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-neutral-700 mb-2">
											횟수
										</label>
										<input
											type="number"
											value={membershipForm.count}
											onChange={(e) =>
												setMembershipForm((prev) => ({
													...prev,
													count: e.target.value,
												}))
											}
											placeholder="10"
											className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
										/>
									</div>
								</>
							)}
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={() => setIsModalOpen(false)}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={
									activeTab === "stored_value"
										? handleStoredValueSubmit
										: handleMembershipSubmit
								}
								disabled={
									activeTab === "stored_value"
										? !storedValueForm.name.trim() ||
											!storedValueForm.price ||
											!storedValueForm.value
										: !membershipForm.name.trim() ||
											!membershipForm.price ||
											!membershipForm.count
								}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{editingItem ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
