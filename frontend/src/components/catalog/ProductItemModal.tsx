import { useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import type { ProductItem } from "../sale/types";

interface ProductItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	categoryId: string;
	brandId: string;
	editingProduct?: ProductItem | null;
}

export function ProductItemModal({
	isOpen,
	onClose,
	categoryId,
	brandId,
	editingProduct = null,
}: ProductItemModalProps): React.ReactElement | null {
	const { addProductItem, updateProductItem } = useCatalog();
	const [productForm, setProductForm] = useState(() => ({
		name: editingProduct?.name ?? "",
		price: editingProduct?.price ? String(editingProduct.price) : "",
	}));

	const handleSubmit = (): void => {
		if (!productForm.name.trim() || !productForm.price) return;

		const price = parseInt(productForm.price);
		if (isNaN(price)) return;

		if (editingProduct) {
			updateProductItem(categoryId, brandId, editingProduct.id, {
				name: productForm.name,
				price,
			});
		} else {
			addProductItem(categoryId, brandId, {
				name: productForm.name,
				price,
			});
		}
		onClose();
	};

	const handleClose = (): void => {
		setProductForm({
			name: editingProduct?.name ?? "",
			price: editingProduct?.price ? String(editingProduct.price) : "",
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
				<div className="border-b border-neutral-200 p-6">
					<h2 className="text-xl font-bold text-neutral-800">
						{editingProduct ? "상품 수정" : "상품 추가"}
					</h2>
				</div>
				<div className="space-y-6 p-6">
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">상품명</label>
						<input
							type="text"
							value={productForm.name}
							onChange={(e) => {
								setProductForm((prev) => ({
									...prev,
									name: e.target.value,
								}));
							}}
							placeholder="상품 이름"
							className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
							autoFocus
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">가격</label>
						<input
							type="number"
							value={productForm.price}
							onChange={(e) => {
								setProductForm((prev) => ({
									...prev,
									price: e.target.value,
								}));
							}}
							placeholder="0"
							className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
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
						disabled={!productForm.name.trim() || !productForm.price}
						className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{editingProduct ? "수정" : "추가"}
					</button>
				</div>
			</div>
		</div>
	);
}
