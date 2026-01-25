import { useState } from "react";
import { useCatalog } from "../../contexts/CatalogContext";
import type { ServiceItem } from "../sale/types";

interface ServiceItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	categoryId: string;
	editingItem?: ServiceItem | null;
}

export function ServiceItemModal({
	isOpen,
	onClose,
	categoryId,
	editingItem = null,
}: ServiceItemModalProps): React.ReactElement | null {
	const { addServiceItem, updateServiceItem } = useCatalog();
	const [itemForm, setItemForm] = useState(() => ({
		name: editingItem?.name ?? "",
		price: editingItem?.price ? String(editingItem.price) : "",
		membershipEligible: editingItem?.membershipEligible ?? false,
	}));

	const handleSubmit = (): void => {
		if (!itemForm.name.trim() || !itemForm.price) return;

		const price = parseInt(itemForm.price);
		if (isNaN(price)) return;

		if (editingItem) {
			updateServiceItem(categoryId, editingItem.id, {
				name: itemForm.name,
				price,
				membershipEligible: itemForm.membershipEligible,
			});
		} else {
			addServiceItem(categoryId, {
				name: itemForm.name,
				price,
				membershipEligible: itemForm.membershipEligible,
			});
		}
		onClose();
	};

	const handleClose = (): void => {
		setItemForm({
			name: editingItem?.name ?? "",
			price: editingItem?.price ? String(editingItem.price) : "",
			membershipEligible: editingItem?.membershipEligible ?? false,
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
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
							autoFocus
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
						onClick={handleClose}
						className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
					>
						취소
					</button>
					<button
						onClick={handleSubmit}
						disabled={!itemForm.name.trim() || !itemForm.price}
						className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{editingItem ? "수정" : "추가"}
					</button>
				</div>
			</div>
		</div>
	);
}
