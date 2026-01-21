import { useState } from "react";
import { useStaff } from "../../contexts/StaffContext";
import { staffRoleConfig } from "../sale/constants";
import type { Staff } from "../sale/types";
import StaffFormModal, { type StaffFormData } from "./StaffFormModal";

const getToday = (): string => {
	return new Date().toISOString().split("T")[0] ?? "";
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

export default function StaffPage() {
	const { staffList, addStaff, updateStaff, deleteStaff } = useStaff();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
	const [modalKey, setModalKey] = useState(0);

	// 필터
	const [showResigned, setShowResigned] = useState(false);

	const filteredStaff = staffList.filter((s) => showResigned || s.employmentStatus === "active");

	const openAddModal = (): void => {
		setEditingStaff(undefined);
		setModalKey((prev) => prev + 1);
		setIsModalOpen(true);
	};

	const openEditModal = (staff: Staff): void => {
		setEditingStaff(staff);
		setModalKey((prev) => prev + 1);
		setIsModalOpen(true);
	};

	const closeModal = (): void => {
		setIsModalOpen(false);
		setEditingStaff(undefined);
	};

	const handleSubmit = (formData: StaffFormData): void => {
		if (editingStaff !== undefined) {
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
		if (dateStr === undefined) return "-";
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
					className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
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
			<StaffFormModal
				key={modalKey}
				isOpen={isModalOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				mode={editingStaff !== undefined ? "edit" : "create"}
				{...(editingStaff !== undefined && { staff: editingStaff })}
			/>
		</div>
	);
}
