import { useState } from "react";
import { serviceCategories as initialCategories } from "../sale/constants";
import type { ServiceCategory, ServiceItem } from "../sale/types";

const DEFAULT_COLOR = "#00c875";
const colorOptions = [
	DEFAULT_COLOR,
	"#fdab3d",
	"#e2445c",
	"#a25ddc",
	"#0073ea",
	"#ff7eb3",
	"#00d2d2",
	"#6b7280",
];

export default function ServicesPage() {
	const [categories, setCategories] =
		useState<ServiceCategory[]>(initialCategories);
	const [selectedCategory, setSelectedCategory] =
		useState<ServiceCategory | null>(categories[0] || null);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isItemModalOpen, setIsItemModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] =
		useState<ServiceCategory | null>(null);
	const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);

	const [categoryForm, setCategoryForm] = useState({
		name: "",
		color: "#00c875",
	});
	const [itemForm, setItemForm] = useState({
		name: "",
		price: "",
		membershipEligible: false,
	});

	// Category handlers
	const openAddCategoryModal = () => {
		setEditingCategory(null);
		setCategoryForm({ name: "", color: DEFAULT_COLOR });
		setIsCategoryModalOpen(true);
	};

	const openEditCategoryModal = (cat: ServiceCategory) => {
		setEditingCategory(cat);
		setCategoryForm({ name: cat.name, color: cat.color });
		setIsCategoryModalOpen(true);
	};

	const handleCategorySubmit = () => {
		if (!categoryForm.name.trim()) return;

		if (editingCategory) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === editingCategory.id
						? { ...c, name: categoryForm.name, color: categoryForm.color }
						: c,
				),
			);
		} else {
			const newCategory: ServiceCategory = {
				id: `cat-${Date.now()}`,
				name: categoryForm.name,
				color: categoryForm.color,
				items: [],
			};
			setCategories((prev) => [...prev, newCategory]);
			setSelectedCategory(newCategory);
		}
		setIsCategoryModalOpen(false);
	};

	const handleDeleteCategory = (id: string) => {
		if (
			confirm("카테고리와 포함된 모든 시술이 삭제됩니다. 계속하시겠습니까?")
		) {
			setCategories((prev) => prev.filter((c) => c.id !== id));
			if (selectedCategory?.id === id) {
				setSelectedCategory(categories.find((c) => c.id !== id) || null);
			}
		}
	};

	// Item handlers
	const openAddItemModal = () => {
		setEditingItem(null);
		setItemForm({ name: "", price: "", membershipEligible: false });
		setIsItemModalOpen(true);
	};

	const openEditItemModal = (item: ServiceItem) => {
		setEditingItem(item);
		setItemForm({
			name: item.name,
			price: String(item.price),
			membershipEligible: item.membershipEligible || false,
		});
		setIsItemModalOpen(true);
	};

	const handleItemSubmit = () => {
		if (!itemForm.name.trim() || !itemForm.price || !selectedCategory) return;

		const price = parseInt(itemForm.price);
		if (isNaN(price)) return;

		if (editingItem) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? {
								...c,
								items: c.items.map((item) =>
									item.id === editingItem.id
										? {
												...item,
												name: itemForm.name,
												price,
												membershipEligible: itemForm.membershipEligible,
											}
										: item,
								),
							}
						: c,
				),
			);
		} else {
			const newItem: ServiceItem = {
				id: `s-${Date.now()}`,
				name: itemForm.name,
				price,
				membershipEligible: itemForm.membershipEligible,
			};
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? { ...c, items: [...c.items, newItem] }
						: c,
				),
			);
		}
		setIsItemModalOpen(false);
	};

	const handleDeleteItem = (itemId: string) => {
		if (!selectedCategory) return;
		if (confirm("이 시술을 삭제하시겠습니까?")) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? { ...c, items: c.items.filter((item) => item.id !== itemId) }
						: c,
				),
			);
		}
	};

	// Update selectedCategory when categories change
	const currentCategory = categories.find((c) => c.id === selectedCategory?.id);

	return (
		<div className="flex-1 p-8 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">시술 관리</h1>
					<p className="text-neutral-500 mt-1">
						시술 카테고리와 항목을 관리합니다
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Categories Panel */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
						<div className="p-4 border-b border-neutral-200 flex items-center justify-between">
							<h2 className="font-bold text-neutral-800">카테고리</h2>
							<button
								onClick={openAddCategoryModal}
								className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
							>
								<span className="material-symbols-outlined">add</span>
							</button>
						</div>
						<div className="divide-y divide-neutral-100">
							{categories.map((cat) => (
								<button
									key={cat.id}
									onClick={() => setSelectedCategory(cat)}
									className={`w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors ${
										selectedCategory?.id === cat.id ? "bg-primary-50" : ""
									}`}
								>
									<div className="flex items-center gap-3">
										<span
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: cat.color }}
										/>
										<span className="font-medium">{cat.name}</span>
										<span className="text-sm text-neutral-400">
											({cat.items.length})
										</span>
									</div>
									<div className="flex gap-1">
										<span
											onClick={(e) => {
												e.stopPropagation();
												openEditCategoryModal(cat);
											}}
											className="p-1 text-neutral-400 hover:text-primary-500 cursor-pointer"
										>
											<span className="material-symbols-outlined text-lg">
												edit
											</span>
										</span>
										<span
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteCategory(cat.id);
											}}
											className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
										>
											<span className="material-symbols-outlined text-lg">
												delete
											</span>
										</span>
									</div>
								</button>
							))}
						</div>
						{categories.length === 0 && (
							<div className="p-8 text-center text-neutral-400">
								카테고리가 없습니다
							</div>
						)}
					</div>
				</div>

				{/* Items Panel */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
						<div className="p-4 border-b border-neutral-200 flex items-center justify-between">
							<div className="flex items-center gap-3">
								{currentCategory && (
									<span
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: currentCategory.color }}
									/>
								)}
								<h2 className="font-bold text-neutral-800">
									{currentCategory?.name || "카테고리 선택"} 시술
								</h2>
							</div>
							{currentCategory && (
								<button
									onClick={openAddItemModal}
									className="flex items-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors"
								>
									<span className="material-symbols-outlined text-lg">add</span>
									시술 추가
								</button>
							)}
						</div>
						{currentCategory ? (
							<div className="divide-y divide-neutral-100">
								{currentCategory.items.map((item) => (
									<div
										key={item.id}
										className="p-4 flex items-center justify-between hover:bg-neutral-50"
									>
										<div className="flex items-center gap-4">
											<div>
												<h3 className="font-medium text-neutral-800">
													{item.name}
												</h3>
												<div className="flex items-center gap-2 mt-1">
													<span className="text-sm text-neutral-500">
														{item.price.toLocaleString()}원
													</span>
													{item.membershipEligible && (
														<span className="px-2 py-0.5 bg-accent-100 text-accent-600 text-xs font-bold rounded">
															정기권 가능
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex gap-1">
											<button
												onClick={() => openEditItemModal(item)}
												className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
											>
												<span className="material-symbols-outlined text-xl">
													edit
												</span>
											</button>
											<button
												onClick={() => handleDeleteItem(item.id)}
												className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
											>
												<span className="material-symbols-outlined text-xl">
													delete
												</span>
											</button>
										</div>
									</div>
								))}
								{currentCategory.items.length === 0 && (
									<div className="p-8 text-center text-neutral-400">
										등록된 시술이 없습니다
									</div>
								)}
							</div>
						) : (
							<div className="p-8 text-center text-neutral-400">
								카테고리를 선택하세요
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Category Modal */}
			{isCategoryModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingCategory ? "카테고리 수정" : "카테고리 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									이름
								</label>
								<input
									type="text"
									value={categoryForm.name}
									onChange={(e) =>
										setCategoryForm((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="카테고리 이름"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									색상
								</label>
								<div className="flex flex-wrap gap-3">
									{colorOptions.map((color) => (
										<button
											key={color}
											onClick={() =>
												setCategoryForm((prev) => ({ ...prev, color }))
											}
											className={`w-10 h-10 rounded-full transition-transform ${
												categoryForm.color === color
													? "ring-2 ring-offset-2 ring-primary-500 scale-110"
													: "hover:scale-105"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={() => setIsCategoryModalOpen(false)}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleCategorySubmit}
								disabled={!categoryForm.name.trim()}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{editingCategory ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Item Modal */}
			{isItemModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingItem ? "시술 수정" : "시술 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									시술명
								</label>
								<input
									type="text"
									value={itemForm.name}
									onChange={(e) =>
										setItemForm((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="시술 이름"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									가격
								</label>
								<input
									type="number"
									value={itemForm.price}
									onChange={(e) =>
										setItemForm((prev) => ({ ...prev, price: e.target.value }))
									}
									placeholder="0"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
							<div>
								<label className="flex items-center gap-3 cursor-pointer">
									<input
										type="checkbox"
										checked={itemForm.membershipEligible}
										onChange={(e) =>
											setItemForm((prev) => ({
												...prev,
												membershipEligible: e.target.checked,
											}))
										}
										className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
									/>
									<span className="font-medium text-neutral-700">
										정기권 사용 가능
									</span>
								</label>
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={() => setIsItemModalOpen(false)}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleItemSubmit}
								disabled={!itemForm.name.trim() || !itemForm.price}
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
