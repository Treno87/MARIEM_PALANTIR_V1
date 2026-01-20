import { useState } from "react";
import { useStaff } from "../../contexts/StaffContext";
import {
	defaultPermissionsByRole,
	genderOptions,
	permissionConfig,
	staffRoleOptions,
} from "../sale/constants";
import type { Gender, Staff, StaffPermissions, StaffRole } from "../sale/types";

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

interface StaffFormData {
	name: string;
	role: StaffRole;
	phone: string;
	color: string;
	joinDate: string;
	showInSales: boolean;
	gender: Gender;
	birthDate: string;
	address: string;
	memo: string;
	permissions: StaffPermissions;
}

const getToday = (): string => {
	return new Date().toISOString().split("T")[0] ?? "";
};

const INITIAL_FORM_DATA: StaffFormData = {
	name: "",
	role: "designer",
	phone: "",
	color: DEFAULT_COLOR,
	joinDate: "",
	showInSales: true,
	gender: "unspecified",
	birthDate: "",
	address: "",
	memo: "",
	permissions: { ...defaultPermissionsByRole.designer },
};

const formDataToStaffFields = (data: StaffFormData) => ({
	name: data.name,
	role: data.role,
	phone: data.phone || undefined,
	color: data.color,
	joinDate: data.joinDate || undefined,
	showInSales: data.showInSales,
	gender: data.gender,
	birthDate: data.birthDate || undefined,
	address: data.address || undefined,
	memo: data.memo || undefined,
	permissions: { ...data.permissions },
});

const staffToFormData = (staff: Staff): StaffFormData => ({
	name: staff.name,
	role: staff.role,
	phone: staff.phone ?? "",
	color: staff.color,
	joinDate: staff.joinDate ?? "",
	showInSales: staff.showInSales,
	gender: staff.gender ?? "unspecified",
	birthDate: staff.birthDate ?? "",
	address: staff.address ?? "",
	memo: staff.memo ?? "",
	permissions: staff.permissions ?? { ...defaultPermissionsByRole[staff.role] },
});

interface StaffFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	editingStaff?: Staff | null;
}

export function StaffFormModal({ isOpen, onClose, editingStaff = null }: StaffFormModalProps) {
	const { staffList, addStaff, updateStaff } = useStaff();
	const [formData, setFormData] = useState<StaffFormData>(() =>
		editingStaff ? staffToFormData(editingStaff) : { ...INITIAL_FORM_DATA, joinDate: getToday() },
	);

	const handleSubmit = (): void => {
		if (!formData.name.trim()) return;

		if (editingStaff) {
			updateStaff(editingStaff.id, formDataToStaffFields(formData));
		} else {
			const newStaff: Staff = {
				id: `staff-${String(Date.now())}`,
				...formDataToStaffFields(formData),
				employmentStatus: "active",
				displayOrder: staffList.length + 1,
			};
			addStaff(newStaff);
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
				<div className="border-b border-neutral-200 p-6">
					<h2 className="text-xl font-bold text-neutral-800">
						{editingStaff ? "직원 수정" : "직원 추가"}
					</h2>
				</div>
				<div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
					{/* 섹션 1: 기본 정보 */}
					<div className="space-y-4">
						<h3 className="border-b border-neutral-200 pb-2 text-sm font-bold tracking-wide text-neutral-500 uppercase">
							기본 정보
						</h3>
						<div className="grid grid-cols-2 gap-4">
							{/* Name */}
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">
									이름 <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => {
										setFormData((prev) => ({
											...prev,
											name: e.target.value,
										}));
									}}
									placeholder="직원 이름"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>

							{/* Role */}
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">
									직급 <span className="text-red-500">*</span>
								</label>
								<select
									value={formData.role}
									onChange={(e) => {
										const newRole = e.target.value as StaffRole;
										setFormData((prev) => ({
											...prev,
											role: newRole,
											permissions: {
												...defaultPermissionsByRole[newRole],
											},
										}));
									}}
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								>
									{staffRoleOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>

							{/* Phone */}
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">연락처</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) => {
										setFormData((prev) => ({
											...prev,
											phone: e.target.value,
										}));
									}}
									placeholder="010-0000-0000"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>

							{/* Join Date */}
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">입사일</label>
								<input
									type="date"
									value={formData.joinDate}
									onChange={(e) => {
										setFormData((prev) => ({
											...prev,
											joinDate: e.target.value,
										}));
									}}
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
						</div>

						{/* Color */}
						<div>
							<label className="mb-2 block text-sm font-bold text-neutral-700">
								색상 <span className="text-red-500">*</span>
							</label>
							<div className="flex flex-wrap gap-3">
								{colorOptions.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => {
											setFormData((prev) => ({ ...prev, color }));
										}}
										className={`h-10 w-10 rounded-full transition-transform ${
											formData.color === color
												? "ring-primary-500 scale-110 ring-2 ring-offset-2"
												: "hover:scale-105"
										}`}
										style={{ backgroundColor: color }}
									/>
								))}
							</div>
						</div>

						{/* Show in Sales */}
						<div>
							<label className="flex cursor-pointer items-center gap-3">
								<input
									type="checkbox"
									checked={formData.showInSales}
									onChange={(e) => {
										setFormData((prev) => ({
											...prev,
											showInSales: e.target.checked,
										}));
									}}
									className="text-primary-500 focus:ring-primary-500 h-5 w-5 rounded"
								/>
								<span className="font-medium text-neutral-700">거래 입력 시 담당자로 표시</span>
							</label>
							<p className="mt-1 ml-8 text-sm text-neutral-500">
								체크 시 거래 입력 화면에서 담당자로 선택할 수 있습니다
							</p>
						</div>
					</div>

					{/* 섹션 2: 개인정보 */}
					<div className="space-y-4">
						<h3 className="border-b border-neutral-200 pb-2 text-sm font-bold tracking-wide text-neutral-500 uppercase">
							개인정보
						</h3>
						<div className="grid grid-cols-2 gap-4">
							{/* Gender */}
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
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								>
									{genderOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>

							{/* Birth Date */}
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
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
						</div>

						{/* Address */}
						<div>
							<label className="mb-2 block text-sm font-bold text-neutral-700">주소</label>
							<textarea
								value={formData.address}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										address: e.target.value,
									}));
								}}
								placeholder="주소를 입력하세요"
								rows={2}
								className="focus:ring-primary-500 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
							/>
						</div>

						{/* Memo */}
						<div>
							<label className="mb-2 block text-sm font-bold text-neutral-700">메모</label>
							<textarea
								value={formData.memo}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										memo: e.target.value,
									}));
								}}
								placeholder="메모를 입력하세요"
								rows={2}
								className="focus:ring-primary-500 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
							/>
						</div>
					</div>

					{/* 섹션 3: 시스템 권한 */}
					<div className="space-y-4">
						<h3 className="border-b border-neutral-200 pb-2 text-sm font-bold tracking-wide text-neutral-500 uppercase">
							시스템 권한
						</h3>
						<div className="space-y-3">
							{(Object.keys(permissionConfig) as (keyof StaffPermissions)[]).map((key) => (
								<label
									key={key}
									className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-50"
								>
									<input
										type="checkbox"
										checked={formData.permissions[key]}
										onChange={(e) => {
											setFormData((prev) => ({
												...prev,
												permissions: {
													...prev.permissions,
													[key]: e.target.checked,
												},
											}));
										}}
										className="text-primary-500 focus:ring-primary-500 mt-0.5 h-5 w-5 rounded"
									/>
									<div>
										<span className="font-medium text-neutral-700">
											{permissionConfig[key].label}
										</span>
										<p className="text-sm text-neutral-500">{permissionConfig[key].description}</p>
									</div>
								</label>
							))}
						</div>
					</div>
				</div>
				<div className="flex justify-end gap-3 bg-neutral-50 p-6">
					<button
						type="button"
						onClick={onClose}
						className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
					>
						취소
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!formData.name.trim()}
						className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						{editingStaff ? "수정" : "추가"}
					</button>
				</div>
			</div>
		</div>
	);
}
