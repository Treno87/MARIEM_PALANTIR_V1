import { type ReactElement, useState } from "react";
import type { Customer } from "../../contexts/CustomerContext";
import { genderOptions } from "../sale/constants";
import type { Gender } from "../sale/types";

export interface CustomerFormData {
	name: string;
	phone: string;
	gender: Gender;
	birthDate: string;
	memo: string;
}

function getInitialFormData(mode: "create" | "edit", customer?: Customer | null): CustomerFormData {
	if (mode === "edit" && customer !== null && customer !== undefined) {
		return {
			name: customer.name,
			phone: customer.phone,
			gender: customer.gender ?? "unspecified",
			birthDate: customer.birthDate ?? "",
			memo: customer.memo ?? "",
		};
	}
	return {
		name: "",
		phone: "",
		gender: "unspecified",
		birthDate: "",
		memo: "",
	};
}

interface CustomerFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CustomerFormData) => void;
	mode: "create" | "edit";
	customer?: Customer | null;
}

export default function CustomerFormModal({
	isOpen,
	onClose,
	onSubmit,
	mode,
	customer,
}: CustomerFormModalProps): ReactElement | null {
	// key를 사용해 모달이 열릴 때마다 폼 리셋
	const key = isOpen ? `${mode}-${customer?.id ?? "new"}` : "closed";

	if (!isOpen) return null;

	return (
		<CustomerFormContent
			key={key}
			onClose={onClose}
			onSubmit={onSubmit}
			mode={mode}
			customer={customer}
		/>
	);
}

interface CustomerFormContentProps {
	onClose: () => void;
	onSubmit: (data: CustomerFormData) => void;
	mode: "create" | "edit";
	customer?: Customer | null | undefined;
}

// 내부 폼 컴포넌트 (key로 리셋됨)
function CustomerFormContent({
	onClose,
	onSubmit,
	mode,
	customer,
}: CustomerFormContentProps): ReactElement {
	const [formData, setFormData] = useState<CustomerFormData>(() =>
		getInitialFormData(mode, customer),
	);

	const handleSubmit = (): void => {
		if (formData.name.trim() === "" || formData.phone.trim() === "") return;
		onSubmit(formData);
		onClose();
	};

	const isValid = formData.name.trim() !== "" && formData.phone.trim() !== "";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-neutral-200 p-6">
					<h2 className="text-xl font-bold text-neutral-800">
						{mode === "edit" ? "고객 수정" : "고객 등록"}
					</h2>
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{/* Form */}
				<div className="space-y-5 p-6">
					{/* Name */}
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">
							이름 <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => {
								setFormData((prev) => ({ ...prev, name: e.target.value }));
							}}
							placeholder="고객 이름"
							autoFocus
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
						/>
					</div>

					{/* Phone */}
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">
							전화번호 <span className="text-red-500">*</span>
						</label>
						<input
							type="tel"
							value={formData.phone}
							onChange={(e) => {
								setFormData((prev) => ({ ...prev, phone: e.target.value }));
							}}
							placeholder="010-0000-0000"
							className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
						/>
					</div>

					{/* Gender & Birth Date */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="mb-2 block text-sm font-bold text-neutral-700">성별</label>
							<select
								value={formData.gender}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										gender: e.target.value as Gender,
									}));
								}}
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
							>
								{genderOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="mb-2 block text-sm font-bold text-neutral-700">생년월일</label>
							<input
								type="date"
								value={formData.birthDate}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										birthDate: e.target.value,
									}));
								}}
								className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
							/>
						</div>
					</div>

					{/* Memo */}
					<div>
						<label className="mb-2 block text-sm font-bold text-neutral-700">메모</label>
						<textarea
							value={formData.memo}
							onChange={(e) => {
								setFormData((prev) => ({ ...prev, memo: e.target.value }));
							}}
							placeholder="특이사항, 알러지 정보 등"
							rows={3}
							className="focus:border-primary-500 focus:ring-primary-500 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 p-6">
					<button
						type="button"
						onClick={onClose}
						className="rounded-xl px-5 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
					>
						취소
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!isValid}
						className="bg-primary-500 hover:bg-primary-600 rounded-xl px-5 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{mode === "edit" ? "수정" : "등록"}
					</button>
				</div>
			</div>
		</div>
	);
}
