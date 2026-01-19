import { useState } from "react";
import {
	mockStaff,
	staffRoleConfig,
	staffRoleOptions,
} from "../sale/constants";
import type { Staff, StaffRole } from "../sale/types";

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
});

export default function StaffPage() {
	const [staffList, setStaffList] = useState<Staff[]>(mockStaff);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
	const [formData, setFormData] = useState<StaffFormData>({
		...INITIAL_FORM_DATA,
		joinDate: getToday(),
	});

	// 필터
	const [showResigned, setShowResigned] = useState(false);

	const filteredStaff = staffList.filter(
		(s) => showResigned || s.employmentStatus === "active",
	);

	const openAddModal = (): void => {
		setEditingStaff(null);
		setFormData({ ...INITIAL_FORM_DATA, joinDate: getToday() });
		setIsModalOpen(true);
	};

	const openEditModal = (staff: Staff): void => {
		setEditingStaff(staff);
		setFormData({
			name: staff.name,
			role: staff.role,
			phone: staff.phone ?? "",
			color: staff.color,
			joinDate: staff.joinDate ?? "",
			showInSales: staff.showInSales,
		});
		setIsModalOpen(true);
	};

	const closeModal = (): void => {
		setIsModalOpen(false);
		setEditingStaff(null);
	};

	const handleSubmit = (): void => {
		if (!formData.name.trim()) return;

		if (editingStaff) {
			setStaffList((prev) =>
				prev.map(
					(s): Staff =>
						s.id === editingStaff.id
							? { ...s, ...formDataToStaffFields(formData) }
							: s,
				),
			);
		} else {
			const newStaff: Staff = {
				id: `staff-${String(Date.now())}`,
				...formDataToStaffFields(formData),
				employmentStatus: "active",
				displayOrder: staffList.length + 1,
			};
			setStaffList((prev) => [...prev, newStaff]);
		}
		closeModal();
	};

	const handleResign = (id: string): void => {
		if (confirm("이 직원을 퇴사 처리하시겠습니까?")) {
			setStaffList((prev) =>
				prev.map(
					(s): Staff =>
						s.id === id
							? {
									...s,
									employmentStatus: "resigned",
									resignationDate: getToday(),
									showInSales: false,
								}
							: s,
				),
			);
		}
	};

	const handleReactivate = (id: string): void => {
		setStaffList((prev) =>
			prev.map(
				(s): Staff =>
					s.id === id
						? {
								...s,
								employmentStatus: "active",
								resignationDate: undefined,
							}
						: s,
			),
		);
	};

	const handleDelete = (id: string): void => {
		if (confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
			setStaffList((prev) => prev.filter((s) => s.id !== id));
		}
	};

	const formatDate = (dateStr?: string): string => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString("ko-KR");
	};

	return (
		<div className="flex-1 p-8 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">직원 관리</h1>
					<p className="text-neutral-500 mt-1">
						담당 디자이너 및 스탭을 관리합니다
					</p>
				</div>
				<button
					onClick={openAddModal}
					className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
				>
					<span className="material-symbols-outlined">add</span>
					직원 추가
				</button>
			</div>

			{/* Filter */}
			<div className="mb-6">
				<label className="inline-flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={showResigned}
						onChange={(e) => setShowResigned(e.target.checked)}
						className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
					/>
					<span className="text-sm text-neutral-600">퇴사자 포함</span>
				</label>
			</div>

			{/* Staff Table */}
			<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="bg-neutral-50 border-b border-neutral-200">
							<th className="text-left px-6 py-4 text-sm font-bold text-neutral-600">
								직원
							</th>
							<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
								직급
							</th>
							<th className="text-left px-6 py-4 text-sm font-bold text-neutral-600">
								연락처
							</th>
							<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
								입사일
							</th>
							<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
								거래표시
							</th>
							<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
								상태
							</th>
							<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
								관리
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{filteredStaff.map((staff) => (
							<tr
								key={staff.id}
								className={`hover:bg-neutral-50 transition-colors ${
									staff.employmentStatus === "resigned" ? "opacity-60" : ""
								}`}
							>
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div
											className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
											style={{ backgroundColor: staff.color }}
										>
											{staff.name.charAt(0)}
										</div>
										<div>
											<p className="font-medium text-neutral-800">
												{staff.name}
											</p>
											<div className="flex items-center gap-1.5 mt-0.5">
												<span
													className="w-2.5 h-2.5 rounded-full"
													style={{ backgroundColor: staff.color }}
												/>
												<span className="text-xs text-neutral-400">
													{staff.color}
												</span>
											</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 text-center">
									<span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
										{staffRoleConfig[staff.role].label}
									</span>
								</td>
								<td className="px-6 py-4 text-neutral-600">
									{staff.phone ?? "-"}
								</td>
								<td className="px-6 py-4 text-center text-neutral-600">
									{formatDate(staff.joinDate)}
								</td>
								<td className="px-6 py-4 text-center">
									{staff.showInSales ? (
										<span className="inline-flex items-center gap-1 text-green-600">
											<span className="material-symbols-outlined text-lg">
												check_circle
											</span>
										</span>
									) : (
										<span className="text-neutral-400">-</span>
									)}
								</td>
								<td className="px-6 py-4 text-center">
									<span
										className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${employmentStatusConfig[staff.employmentStatus].bgColor} ${employmentStatusConfig[staff.employmentStatus].textColor}`}
									>
										{employmentStatusConfig[staff.employmentStatus].label}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center justify-center gap-1">
										<button
											onClick={() => openEditModal(staff)}
											className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
											title="수정"
										>
											<span className="material-symbols-outlined text-xl">
												edit
											</span>
										</button>
										{staff.employmentStatus === "active" ? (
											<button
												onClick={() => handleResign(staff.id)}
												className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
												title="퇴사 처리"
											>
												<span className="material-symbols-outlined text-xl">
													logout
												</span>
											</button>
										) : (
											<button
												onClick={() => handleReactivate(staff.id)}
												className="p-2 text-neutral-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
												title="재직 복귀"
											>
												<span className="material-symbols-outlined text-xl">
													undo
												</span>
											</button>
										)}
										<button
											onClick={() => handleDelete(staff.id)}
											className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
											title="삭제"
										>
											<span className="material-symbols-outlined text-xl">
												delete
											</span>
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filteredStaff.length === 0 && (
					<div className="text-center py-16">
						<span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">
							badge
						</span>
						<p className="text-neutral-400">등록된 직원이 없습니다</p>
						<button
							onClick={openAddModal}
							className="mt-4 text-primary-500 font-bold hover:underline"
						>
							첫 번째 직원 추가하기
						</button>
					</div>
				)}
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingStaff ? "직원 수정" : "직원 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
							{/* Name */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									이름 <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="직원 이름"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							{/* Role */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									직급 <span className="text-red-500">*</span>
								</label>
								<select
									value={formData.role}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											role: e.target.value as StaffRole,
										}))
									}
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
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
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									연락처
								</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, phone: e.target.value }))
									}
									placeholder="010-0000-0000"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							{/* Join Date */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									입사일
								</label>
								<input
									type="date"
									value={formData.joinDate}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											joinDate: e.target.value,
										}))
									}
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							{/* Color */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									색상 <span className="text-red-500">*</span>
								</label>
								<div className="flex flex-wrap gap-3">
									{colorOptions.map((color) => (
										<button
											key={color}
											type="button"
											onClick={() =>
												setFormData((prev) => ({ ...prev, color }))
											}
											className={`w-10 h-10 rounded-full transition-transform ${
												formData.color === color
													? "ring-2 ring-offset-2 ring-primary-500 scale-110"
													: "hover:scale-105"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>

							{/* Show in Sales */}
							<div>
								<label className="flex items-center gap-3 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.showInSales}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												showInSales: e.target.checked,
											}))
										}
										className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
									/>
									<span className="font-medium text-neutral-700">
										거래 입력 시 담당자로 표시
									</span>
								</label>
								<p className="text-sm text-neutral-500 mt-1 ml-8">
									체크 시 거래 입력 화면에서 담당자로 선택할 수 있습니다
								</p>
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								type="button"
								onClick={closeModal}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={!formData.name.trim()}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
