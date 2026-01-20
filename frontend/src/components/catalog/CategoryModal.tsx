import { useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import { COLOR_OPTIONS, DEFAULT_COLOR } from "../sale/constants";

export type CategoryType = "service" | "product";

interface Category {
	id: string;
	name: string;
	color: string;
}

interface CategoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: CategoryType;
	editingCategory?: Category | null;
}

const TITLES: Record<CategoryType, { add: string; edit: string }> = {
	service: { add: "시술 카테고리 추가", edit: "카테고리 수정" },
	product: { add: "상품 카테고리 추가", edit: "카테고리 수정" },
};

export function CategoryModal({
	isOpen,
	onClose,
	type,
	editingCategory = null,
}: CategoryModalProps): React.ReactElement | null {
	const { addServiceCategory, updateServiceCategory, addProductCategory, updateProductCategory } =
		useCatalog();

	const [form, setForm] = useState(() => ({
		name: editingCategory?.name ?? "",
		color: editingCategory?.color ?? DEFAULT_COLOR,
	}));

	const handleSubmit = (): void => {
		if (!form.name.trim()) return;

		const payload = { name: form.name, color: form.color };

		if (editingCategory) {
			if (type === "service") {
				updateServiceCategory(editingCategory.id, payload);
			} else {
				updateProductCategory(editingCategory.id, payload);
			}
		} else {
			if (type === "service") {
				addServiceCategory(payload);
			} else {
				addProductCategory(payload);
			}
		}
		onClose();
	};

	const handleClose = (): void => {
		setForm({
			name: editingCategory?.name ?? "",
			color: editingCategory?.color ?? DEFAULT_COLOR,
		});
		onClose();
	};

	if (!isOpen) return null;

	const title = editingCategory ? TITLES[type].edit : TITLES[type].add;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
				<div className="border-b border-neutral-200 p-6">
					<h2 className="text-xl font-bold text-neutral-800">{title}</h2>
				</div>
				<div className="space-y-6 p-6">
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">이름</label>
						<input
							type="text"
							value={form.name}
							onChange={(e) => {
								setForm((prev) => ({ ...prev, name: e.target.value }));
							}}
							placeholder="카테고리 이름"
							className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
							autoFocus
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">색상</label>
						<div className="flex flex-wrap gap-3">
							{COLOR_OPTIONS.map((color) => (
								<button
									key={color}
									onClick={() => {
										setForm((prev) => ({ ...prev, color }));
									}}
									className={`h-10 w-10 rounded-full transition-transform ${
										form.color === color
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
						onClick={handleClose}
						className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
					>
						취소
					</button>
					<button
						onClick={handleSubmit}
						disabled={!form.name.trim()}
						className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{editingCategory ? "수정" : "추가"}
					</button>
				</div>
			</div>
		</div>
	);
}
