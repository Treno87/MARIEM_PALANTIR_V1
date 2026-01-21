import { useState } from "react";
import { COLOR_OPTIONS, DEFAULT_COLOR } from "../../constants/colors";
import { useCatalog } from "../../contexts/CatalogContext";
import {
	useCreateService,
	useCreateServiceCategory,
	useUpdateService,
	useUpdateServiceCategory,
} from "../../hooks/useServicesApi";
import { USE_API } from "../../lib/config";
import type { ServiceCategory, ServiceItem } from "../sale/types";

export default function ServicesPage(): React.ReactElement {
	const {
		serviceCategories,
		addServiceCategory,
		updateServiceCategory,
		deleteServiceCategory,
		addServiceItem,
		updateServiceItem,
		deleteServiceItem,
	} = useCatalog();

	// API mutation hooks
	const createCategoryMutation = useCreateServiceCategory();
	const updateCategoryMutation = useUpdateServiceCategory();
	const createServiceMutation = useCreateService();
	const updateServiceMutation = useUpdateService();

	const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(
		serviceCategories[0] ?? null,
	);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isItemModalOpen, setIsItemModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
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

	const handleCategorySubmit = (): void => {
		if (!categoryForm.name.trim()) return;

		if (editingCategory !== null) {
			// 수정 모드
			if (USE_API) {
				updateCategoryMutation.mutate({
					id: Number(editingCategory.id),
					data: { name: categoryForm.name },
				});
			}
			updateServiceCategory(editingCategory.id, {
				name: categoryForm.name,
				color: categoryForm.color,
			});
		} else {
			// 생성 모드
			if (USE_API) {
				createCategoryMutation.mutate({ name: categoryForm.name });
			}
			addServiceCategory({
				name: categoryForm.name,
				color: categoryForm.color,
			});
		}
		setIsCategoryModalOpen(false);
	};

	const handleDeleteCategory = (id: string): void => {
		if (!confirm("카테고리와 포함된 모든 시술이 삭제됩니다. 계속하시겠습니까?")) return;

		deleteServiceCategory(id);
		if (selectedCategory?.id === id) {
			setSelectedCategory(serviceCategories.find((c) => c.id !== id) ?? null);
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
			membershipEligible: item.membershipEligible ?? false,
		});
		setIsItemModalOpen(true);
	};

	const handleItemSubmit = (): void => {
		if (!itemForm.name.trim() || !itemForm.price || !selectedCategory) return;

		const price = parseInt(itemForm.price);
		if (isNaN(price)) return;

		if (editingItem !== null) {
			// 수정 모드
			if (USE_API) {
				updateServiceMutation.mutate({
					id: Number(editingItem.id),
					data: {
						name: itemForm.name,
						list_price: price,
						service_category_id: Number(selectedCategory.id),
					},
				});
			}
			updateServiceItem(selectedCategory.id, editingItem.id, {
				name: itemForm.name,
				price,
				membershipEligible: itemForm.membershipEligible,
			});
		} else {
			// 생성 모드
			if (USE_API) {
				createServiceMutation.mutate({
					name: itemForm.name,
					list_price: price,
					service_category_id: Number(selectedCategory.id),
				});
			}
			addServiceItem(selectedCategory.id, {
				name: itemForm.name,
				price,
				membershipEligible: itemForm.membershipEligible,
			});
		}
		setIsItemModalOpen(false);
	};

	const handleDeleteItem = (itemId: string): void => {
		if (selectedCategory === null) return;
		if (!confirm("이 시술을 삭제하시겠습니까?")) return;

		deleteServiceItem(selectedCategory.id, itemId);
	};

	// Update selectedCategory when categories change
	const currentCategory = serviceCategories.find((c) => c.id === selectedCategory?.id);

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">시술 관리</h1>
					<p className="mt-1 text-neutral-500">시술 카테고리와 항목을 관리합니다</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Categories Panel */}
				<div className="lg:col-span-1">
					<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
						<div className="flex items-center justify-between border-b border-neutral-200 p-4">
							<h2 className="font-bold text-neutral-800">카테고리</h2>
							<button
								onClick={openAddCategoryModal}
								className="text-primary-500 hover:bg-primary-50 rounded-lg p-2 transition-colors"
							>
								<span className="material-symbols-outlined">add</span>
							</button>
						</div>
						<div className="divide-y divide-neutral-100">
							{serviceCategories.map((cat) => (
								<button
									key={cat.id}
									onClick={() => {
										setSelectedCategory(cat);
									}}
									className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-neutral-50 ${
										selectedCategory?.id === cat.id ? "bg-primary-50" : ""
									}`}
								>
									<div className="flex items-center gap-3">
										<span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
										<span className="font-medium">{cat.name}</span>
										<span className="text-sm text-neutral-400">({cat.items.length})</span>
									</div>
									<div className="flex gap-1">
										<span
											onClick={(e) => {
												e.stopPropagation();
												openEditCategoryModal(cat);
											}}
											className="hover:text-primary-500 cursor-pointer p-1 text-neutral-400"
										>
											<span className="material-symbols-outlined text-lg">edit</span>
										</span>
										<span
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteCategory(cat.id);
											}}
											className="cursor-pointer p-1 text-neutral-400 hover:text-red-500"
										>
											<span className="material-symbols-outlined text-lg">delete</span>
										</span>
									</div>
								</button>
							))}
						</div>
						{serviceCategories.length === 0 && (
							<div className="p-8 text-center text-neutral-400">카테고리가 없습니다</div>
						)}
					</div>
				</div>

				{/* Items Panel */}
				<div className="lg:col-span-2">
					<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
						<div className="flex items-center justify-between border-b border-neutral-200 p-4">
							<div className="flex items-center gap-3">
								{currentCategory && (
									<span
										className="h-4 w-4 rounded-full"
										style={{ backgroundColor: currentCategory.color }}
									/>
								)}
								<h2 className="font-bold text-neutral-800">
									{currentCategory?.name ?? "카테고리 선택"} 시술
								</h2>
							</div>
							{currentCategory && (
								<button
									onClick={openAddItemModal}
									className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
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
										className="flex items-center justify-between p-4 hover:bg-neutral-50"
									>
										<div className="flex items-center gap-4">
											<div>
												<h3 className="font-medium text-neutral-800">{item.name}</h3>
												<div className="mt-1 flex items-center gap-2">
													<span className="text-sm text-neutral-500">
														{item.price.toLocaleString()}원
													</span>
													{item.membershipEligible && (
														<span className="bg-accent-100 text-accent-600 rounded px-2 py-0.5 text-xs font-bold">
															정기권 가능
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex gap-1">
											<button
												onClick={() => {
													openEditItemModal(item);
												}}
												className="hover:bg-primary-50 hover:text-primary-500 rounded-lg p-2 text-neutral-400 transition-colors"
											>
												<span className="material-symbols-outlined text-xl">edit</span>
											</button>
											<button
												onClick={() => {
													handleDeleteItem(item.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
											>
												<span className="material-symbols-outlined text-xl">delete</span>
											</button>
										</div>
									</div>
								))}
								{currentCategory.items.length === 0 && (
									<div className="p-8 text-center text-neutral-400">등록된 시술이 없습니다</div>
								)}
							</div>
						) : (
							<div className="p-8 text-center text-neutral-400">카테고리를 선택하세요</div>
						)}
					</div>
				</div>
			</div>

			{/* Category Modal */}
			{isCategoryModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingCategory ? "카테고리 수정" : "카테고리 추가"}
							</h2>
						</div>
						<div className="space-y-6 p-6">
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">이름</label>
								<input
									type="text"
									value={categoryForm.name}
									onChange={(e) => {
										setCategoryForm((prev) => ({
											...prev,
											name: e.target.value,
										}));
									}}
									placeholder="카테고리 이름"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">색상</label>
								<div className="flex flex-wrap gap-3">
									{COLOR_OPTIONS.map((color) => (
										<button
											key={color}
											onClick={() => {
												setCategoryForm((prev) => ({ ...prev, color }));
											}}
											className={`h-10 w-10 rounded-full transition-transform ${
												categoryForm.color === color
													? "ring-primary-500 scale-110 ring-2 ring-offset-2"
													: "hover:scale-105"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								onClick={() => {
									setIsCategoryModalOpen(false);
								}}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								취소
							</button>
							<button
								onClick={handleCategorySubmit}
								disabled={!categoryForm.name.trim()}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
							>
								{editingCategory ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Item Modal */}
			{isItemModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingItem ? "시술 수정" : "시술 추가"}
							</h2>
						</div>
						<div className="space-y-6 p-6">
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">시술명</label>
								<input
									type="text"
									value={itemForm.name}
									onChange={(e) => {
										setItemForm((prev) => ({ ...prev, name: e.target.value }));
									}}
									placeholder="시술 이름"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">가격</label>
								<input
									type="number"
									value={itemForm.price}
									onChange={(e) => {
										setItemForm((prev) => ({ ...prev, price: e.target.value }));
									}}
									placeholder="0"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
							<div>
								<label className="flex cursor-pointer items-center gap-3">
									<input
										type="checkbox"
										checked={itemForm.membershipEligible}
										onChange={(e) => {
											setItemForm((prev) => ({
												...prev,
												membershipEligible: e.target.checked,
											}));
										}}
										className="text-primary-500 focus:ring-primary-500 h-5 w-5 rounded"
									/>
									<span className="font-medium text-neutral-700">정기권 사용 가능</span>
								</label>
							</div>
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								onClick={() => {
									setIsItemModalOpen(false);
								}}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								취소
							</button>
							<button
								onClick={handleItemSubmit}
								disabled={!itemForm.name.trim() || !itemForm.price}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
