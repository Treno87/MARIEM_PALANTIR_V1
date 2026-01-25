import { useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import type { MembershipOption, StoredValueOption } from "../sale/types";

type ActiveTab = "stored_value" | "membership";

export default function MembershipPage() {
	const {
		storedValueOptions,
		addStoredValueOption,
		updateStoredValueOption,
		deleteStoredValueOption,
		membershipOptions,
		addMembershipOption,
		updateMembershipOption,
		deleteMembershipOption,
	} = useCatalog();

	const [activeTab, setActiveTab] = useState<ActiveTab>("stored_value");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<StoredValueOption | MembershipOption | null>(null);

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
			updateStoredValueOption(editingItem.id, {
				name,
				price: priceNum,
				value: valueNum,
			});
		} else {
			addStoredValueOption({
				name,
				price: priceNum,
				value: valueNum,
			});
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
			updateMembershipOption(editingItem.id, {
				name,
				price: priceNum,
				count: countNum,
			});
		} else {
			addMembershipOption({
				name,
				price: priceNum,
				count: countNum,
			});
		}
		setIsModalOpen(false);
	};

	const handleDelete = (id: string) => {
		if (confirm("이 옵션을 삭제하시겠습니까?")) {
			if (activeTab === "stored_value") {
				deleteStoredValueOption(id);
			} else {
				deleteMembershipOption(id);
			}
		}
	};

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">멤버쉽 관리</h1>
					<p className="mt-1 text-neutral-500">정액권과 정기권 옵션을 관리합니다</p>
				</div>
				<button
					onClick={openAddModal}
					className="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-white transition-colors"
				>
					<span className="material-symbols-outlined">add</span>
					{activeTab === "stored_value" ? "정액권 추가" : "정기권 추가"}
				</button>
			</div>

			{/* Tabs */}
			<div className="mb-6 flex gap-2">
				<button
					onClick={() => {
						setActiveTab("stored_value");
					}}
					className={`rounded-xl px-4 py-2.5 font-bold transition-colors ${
						activeTab === "stored_value"
							? "bg-primary-500 text-white"
							: "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
					}`}
				>
					<span className="flex items-center gap-2">
						<span className="material-symbols-outlined">account_balance_wallet</span>
						정액권 ({storedValueOptions.length})
					</span>
				</button>
				<button
					onClick={() => {
						setActiveTab("membership");
					}}
					className={`rounded-xl px-4 py-2.5 font-bold transition-colors ${
						activeTab === "membership"
							? "bg-primary-500 text-white"
							: "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
					}`}
				>
					<span className="flex items-center gap-2">
						<span className="material-symbols-outlined">card_membership</span>
						정기권 ({membershipOptions.length})
					</span>
				</button>
			</div>

			{/* Content */}
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				{activeTab === "stored_value" ? (
					<div className="divide-y divide-neutral-100">
						{storedValueOptions.map((option) => (
							<div
								key={option.id}
								className="flex items-center justify-between p-6 hover:bg-neutral-50"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
										<span className="material-symbols-outlined text-purple-600">
											account_balance_wallet
										</span>
									</div>
									<div>
										<h3 className="font-bold text-neutral-800">{option.name}</h3>
										<div className="mt-1 flex gap-4 text-sm text-neutral-500">
											<span>판매가: {option.price.toLocaleString()}원</span>
											<span>충전액: {option.value.toLocaleString()}원</span>
											{option.value > option.price && (
												<span className="font-medium text-green-600">
													(+
													{(((option.value - option.price) / option.price) * 100).toFixed(0)}%
													보너스)
												</span>
											)}
										</div>
									</div>
								</div>
								<div className="flex gap-1">
									<button
										onClick={() => {
											openEditModal(option);
										}}
										className="hover:bg-primary-50 hover:text-primary-500 rounded-lg p-2 text-neutral-400 transition-colors"
									>
										<span className="material-symbols-outlined text-xl">edit</span>
									</button>
									<button
										onClick={() => {
											handleDelete(option.id);
										}}
										className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
									>
										<span className="material-symbols-outlined text-xl">delete</span>
									</button>
								</div>
							</div>
						))}
						{storedValueOptions.length === 0 && (
							<div className="p-8 text-center text-neutral-400">등록된 정액권이 없습니다</div>
						)}
					</div>
				) : (
					<div className="divide-y divide-neutral-100">
						{membershipOptions.map((option) => (
							<div
								key={option.id}
								className="flex items-center justify-between p-6 hover:bg-neutral-50"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
										<span className="material-symbols-outlined text-pink-600">card_membership</span>
									</div>
									<div>
										<h3 className="font-bold text-neutral-800">{option.name}</h3>
										<div className="mt-1 flex gap-4 text-sm text-neutral-500">
											<span>판매가: {option.price.toLocaleString()}원</span>
											<span>횟수: {option.count}회</span>
											<span className="font-medium text-blue-600">
												(회당 {Math.round(option.price / option.count).toLocaleString()}
												원)
											</span>
										</div>
									</div>
								</div>
								<div className="flex gap-1">
									<button
										onClick={() => {
											openEditModal(option);
										}}
										className="hover:bg-primary-50 hover:text-primary-500 rounded-lg p-2 text-neutral-400 transition-colors"
									>
										<span className="material-symbols-outlined text-xl">edit</span>
									</button>
									<button
										onClick={() => {
											handleDelete(option.id);
										}}
										className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
									>
										<span className="material-symbols-outlined text-xl">delete</span>
									</button>
								</div>
							</div>
						))}
						{membershipOptions.length === 0 && (
							<div className="p-8 text-center text-neutral-400">등록된 정기권이 없습니다</div>
						)}
					</div>
				)}
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
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
						<div className="space-y-6 p-6">
							{activeTab === "stored_value" ? (
								<>
									<div>
										<label className="mb-2 block text-sm font-bold text-neutral-700">이름</label>
										<input
											type="text"
											value={storedValueForm.name}
											onChange={(e) => {
												setStoredValueForm((prev) => ({
													...prev,
													name: e.target.value,
												}));
											}}
											placeholder="정액권 10만원"
											className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
										/>
									</div>
									<div>
										<label className="mb-2 block text-sm font-bold text-neutral-700">판매가</label>
										<input
											type="number"
											value={storedValueForm.price}
											onChange={(e) => {
												setStoredValueForm((prev) => ({
													...prev,
													price: e.target.value,
												}));
											}}
											placeholder="100000"
											className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
										/>
									</div>
									<div>
										<label className="mb-2 block text-sm font-bold text-neutral-700">충전액</label>
										<input
											type="number"
											value={storedValueForm.value}
											onChange={(e) => {
												setStoredValueForm((prev) => ({
													...prev,
													value: e.target.value,
												}));
											}}
											placeholder="100000"
											className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
										/>
										<p className="mt-1 text-xs text-neutral-500">
											판매가보다 높으면 보너스가 적용됩니다
										</p>
									</div>
								</>
							) : (
								<>
									<div>
										<label className="mb-2 block text-sm font-bold text-neutral-700">이름</label>
										<input
											type="text"
											value={membershipForm.name}
											onChange={(e) => {
												setMembershipForm((prev) => ({
													...prev,
													name: e.target.value,
												}));
											}}
											placeholder="커트 10회권"
											className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
										/>
									</div>
									<div>
										<label className="mb-2 block text-sm font-bold text-neutral-700">판매가</label>
										<input
											type="number"
											value={membershipForm.price}
											onChange={(e) => {
												setMembershipForm((prev) => ({
													...prev,
													price: e.target.value,
												}));
											}}
											placeholder="200000"
											className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
										/>
									</div>
									<div>
										<label className="mb-2 block text-sm font-bold text-neutral-700">횟수</label>
										<input
											type="number"
											value={membershipForm.count}
											onChange={(e) => {
												setMembershipForm((prev) => ({
													...prev,
													count: e.target.value,
												}));
											}}
											placeholder="10"
											className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
										/>
									</div>
								</>
							)}
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								onClick={() => {
									setIsModalOpen(false);
								}}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								취소
							</button>
							<button
								onClick={
									activeTab === "stored_value" ? handleStoredValueSubmit : handleMembershipSubmit
								}
								disabled={
									activeTab === "stored_value"
										? !storedValueForm.name.trim() ||
											!storedValueForm.price ||
											!storedValueForm.value
										: !membershipForm.name.trim() || !membershipForm.price || !membershipForm.count
								}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
