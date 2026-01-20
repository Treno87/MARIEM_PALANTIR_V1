import { useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import type { ProductBrand } from "../sale/types";

interface ProductBrandModalProps {
	isOpen: boolean;
	onClose: () => void;
	categoryId: string;
	editingBrand?: ProductBrand | null;
}

export function ProductBrandModal({
	isOpen,
	onClose,
	categoryId,
	editingBrand = null,
}: ProductBrandModalProps): React.ReactElement | null {
	const { addProductBrand, updateProductBrand } = useCatalog();
	const [brandForm, setBrandForm] = useState(() => ({
		name: editingBrand?.name ?? "",
	}));

	const handleSubmit = (): void => {
		if (!brandForm.name.trim()) return;

		if (editingBrand) {
			updateProductBrand(categoryId, editingBrand.id, {
				name: brandForm.name,
			});
		} else {
			addProductBrand(categoryId, {
				name: brandForm.name,
			});
		}
		onClose();
	};

	const handleClose = (): void => {
		setBrandForm({
			name: editingBrand?.name ?? "",
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
				<div className="border-b border-neutral-200 p-6">
					<h2 className="text-xl font-bold text-neutral-800">
						{editingBrand ? "브랜드 수정" : "브랜드 추가"}
					</h2>
				</div>
				<div className="space-y-6 p-6">
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">브랜드명</label>
						<input
							type="text"
							value={brandForm.name}
							onChange={(e) => {
								setBrandForm((prev) => ({ ...prev, name: e.target.value }));
							}}
							placeholder="브랜드 이름"
							className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
							autoFocus
						/>
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
						disabled={!brandForm.name.trim()}
						className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{editingBrand ? "수정" : "추가"}
					</button>
				</div>
			</div>
		</div>
	);
}
