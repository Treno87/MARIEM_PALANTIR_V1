import { useState } from "react";
import { useStaff } from "../../contexts/StaffContext";
import {
	defaultPermissionsByRole,
	genderOptions,
	permissionConfig,
	staffRoleConfig,
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

const employmentStatusConfig = {
	active: {
		label: "재직중",
		bgColor: "bg-green-100",
		textColor: "text-green-700",
	},
	resigned: {
		label: "퇴사",
		bgColor: "bg-neutral-200",
		textColor: "text-neutral-600",
	},
} as const;

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

export default function StaffPage() {
	const { staffList, addStaff, updateStaff, deleteStaff } = useStaff();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
	const [formData, setFormData] = useState<StaffFormData>({
		...INITIAL_FORM_DATA,
		joinDate: getToday(),
	});

	// 필터
	const [showResigned, setShowResigned] = useState(false);

	const filteredStaff = staffList.filter((s) => showResigned || s.employmentStatus === "active");

	const openAddModal = (): void => {
		setEditingStaff(null);
		setFormData({ ...INITIAL_FORM_DATA, joinDate: getToday() });
		setIsModalOpen(true);
	};

	const openEditModal = (staff: Staff): void => {
		setEditingStaff(staff);
		setFormData(staffToFormData(staff));
		setIsModalOpen(true);
	};

	const closeModal = (): void => {
		setIsModalOpen(false);
		setEditingStaff(null);
	};

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
		closeModal();
	};

	const handleResign = (id: string): void => {
		if (confirm("이 직원을 퇴사 처리하시겠습니까?")) {
			updateStaff(id, {
				employmentStatus: "resigned",
				resignationDate: getToday(),
				showInSales: false,
			});
		}
	};

	const handleReactivate = (id: string): void => {
		updateStaff(id, {
			employmentStatus: "active",
			resignationDate: undefined,
		});
	};

	const handleDelete = (id: string): void => {
		if (confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
			deleteStaff(id);
		}
	};

	const formatDate = (dateStr?: string): string => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString("ko-KR");
	};

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">직원 관리</h1>
					<p className="mt-1 text-neutral-500">담당 디자이너 및 스탭을 관리합니다</p>
				</div>
				<button
					onClick={openAddModal}
					className="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-white transition-colors"
				>
					<span className="material-symbols-outlined">add</span>
					직원 추가
				</button>
			</div>

			{/* Filter */}
			<div className="mb-6">
				<label className="inline-flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						checked={showResigned}
						onChange={(e) => {
							setShowResigned(e.target.checked);
						}}
						className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded"
					/>
					<span className="text-sm text-neutral-600">퇴사자 포함</span>
				</label>
			</div>

			{/* Staff Table */}
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				<table className="w-full">
					<thead>
						<tr className="border-b border-neutral-200 bg-neutral-50">
							<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">직원</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">직급</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">연락처</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">입사일</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">거래표시</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">상태</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">관리</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{filteredStaff.map((staff) => (
							<tr
								key={staff.id}
								className={`transition-colors hover:bg-neutral-50 ${
									staff.employmentStatus === "resigned" ? "opacity-60" : ""
								}`}
							>
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div
											className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
											style={{ backgroundColor: staff.color }}
										>
											{staff.name.charAt(0)}
										</div>
										<div>
											<p className="font-medium text-neutral-800">{staff.name}</p>
											<div className="mt-0.5 flex items-center gap-1.5">
												<span
													className="h-2.5 w-2.5 rounded-full"
													style={{ backgroundColor: staff.color }}
												/>
												<span className="text-xs text-neutral-400">{staff.color}</span>
											</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 text-center">
									<span className="rounded-full bg-neutral-100 px-2.5 py-1 text-sm font-medium text-neutral-700">
										{staffRoleConfig[staff.role].label}
									</span>
								</td>
								<td className="px-6 py-4 text-neutral-600">{staff.phone ?? "-"}</td>
								<td className="px-6 py-4 text-center text-neutral-600">
									{formatDate(staff.joinDate)}
								</td>
								<td className="px-6 py-4 text-center">
									{staff.showInSales ? (
										<span className="inline-flex items-center gap-1 text-green-600">
											<span className="material-symbols-outlined text-lg">check_circle</span>
										</span>
									) : (
										<span className="text-neutral-400">-</span>
									)}
								</td>
								<td className="px-6 py-4 text-center">
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${employmentStatusConfig[staff.employmentStatus].bgColor} ${employmentStatusConfig[staff.employmentStatus].textColor}`}
									>
										{employmentStatusConfig[staff.employmentStatus].label}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center justify-center gap-1">
										<button
											onClick={() => {
												openEditModal(staff);
											}}
											className="hover:text-primary-500 hover:bg-primary-50 rounded-lg p-2 text-neutral-400 transition-colors"
											title="수정"
										>
											<span className="material-symbols-outlined text-xl">edit</span>
										</button>
										{staff.employmentStatus === "active" ? (
											<button
												onClick={() => {
													handleResign(staff.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
												title="퇴사 처리"
											>
												<span className="material-symbols-outlined text-xl">logout</span>
											</button>
										) : (
											<button
												onClick={() => {
													handleReactivate(staff.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-green-50 hover:text-green-500"
												title="재직 복귀"
											>
												<span className="material-symbols-outlined text-xl">undo</span>
											</button>
										)}
										<button
											onClick={() => {
												handleDelete(staff.id);
											}}
											className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
											title="삭제"
										>
											<span className="material-symbols-outlined text-xl">delete</span>
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filteredStaff.length === 0 && (
					<div className="py-16 text-center">
						<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">badge</span>
						<p className="text-neutral-400">등록된 직원이 없습니다</p>
						<button
							onClick={openAddModal}
							className="text-primary-500 mt-4 font-bold hover:underline"
						>
							첫 번째 직원 추가하기
						</button>
					</div>
				)}
			</div>

			{/* Modal */}
			{isModalOpen && (
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
										<label className="mb-2 block text-sm font-bold text-neutral-700">
											생년월일
										</label>
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
												<p className="text-sm text-neutral-500">
													{permissionConfig[key].description}
												</p>
											</div>
										</label>
									))}
								</div>
							</div>
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								type="button"
								onClick={closeModal}
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
			)}
		</div>
	);
}
