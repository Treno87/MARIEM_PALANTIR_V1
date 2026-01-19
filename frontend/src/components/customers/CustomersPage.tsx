import { type ReactElement, useState } from "react";
import { type Customer, useCustomers } from "../../contexts/CustomerContext";
import { genderOptions } from "../sale/constants";
import type { Gender } from "../sale/types";

interface CustomerFormData {
	name: string;
	phone: string;
	gender: Gender;
	birthDate: string;
	memo: string;
}

const INITIAL_FORM_DATA: CustomerFormData = {
	name: "",
	phone: "",
	gender: "unspecified",
	birthDate: "",
	memo: "",
};

const statusConfig = {
	active: {
		label: "활성",
		bgColor: "bg-green-100",
		textColor: "text-green-700",
	},
	inactive: {
		label: "비활성",
		bgColor: "bg-neutral-200",
		textColor: "text-neutral-600",
	},
} as const;

export default function CustomersPage(): ReactElement {
	const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [formData, setFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA);

	// 필터 및 검색
	const [searchQuery, setSearchQuery] = useState("");
	const [showInactive, setShowInactive] = useState(false);

	const filteredCustomers = customers.filter((c) => {
		// 상태 필터
		if (!showInactive && c.status === "inactive") return false;
		// 검색 필터
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			return c.name.toLowerCase().includes(query) || c.phone.includes(searchQuery);
		}
		return true;
	});

	const openAddModal = (): void => {
		setEditingCustomer(null);
		setFormData(INITIAL_FORM_DATA);
		setIsModalOpen(true);
	};

	const openEditModal = (customer: Customer): void => {
		setEditingCustomer(customer);
		setFormData({
			name: customer.name,
			phone: customer.phone,
			gender: customer.gender ?? "unspecified",
			birthDate: customer.birthDate ?? "",
			memo: customer.memo ?? "",
		});
		setIsModalOpen(true);
	};

	const closeModal = (): void => {
		setIsModalOpen(false);
		setEditingCustomer(null);
	};

	const handleSubmit = (): void => {
		if (!formData.name.trim() || !formData.phone.trim()) return;

		if (editingCustomer) {
			updateCustomer(editingCustomer.id, {
				name: formData.name,
				phone: formData.phone,
				gender: formData.gender,
				birthDate: formData.birthDate || undefined,
				memo: formData.memo || undefined,
			});
		} else {
			addCustomer({
				name: formData.name,
				phone: formData.phone,
				gender: formData.gender,
				birthDate: formData.birthDate || undefined,
				memo: formData.memo || undefined,
			});
		}
		closeModal();
	};

	const handleDeactivate = (id: string): void => {
		if (confirm("이 고객을 비활성화 하시겠습니까?")) {
			updateCustomer(id, { status: "inactive" });
		}
	};

	const handleReactivate = (id: string): void => {
		updateCustomer(id, { status: "active" });
	};

	const handleDelete = (id: string): void => {
		if (confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
			deleteCustomer(id);
		}
	};

	const formatDate = (dateStr?: string): string => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString("ko-KR");
	};

	const formatCurrency = (amount?: number): string => {
		if (amount === undefined || amount === 0) return "-";
		return `${amount.toLocaleString()}원`;
	};

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">고객 관리</h1>
					<p className="mt-1 text-neutral-500">고객 정보를 등록하고 관리합니다</p>
				</div>
				<button
					onClick={openAddModal}
					className="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-white transition-colors"
				>
					<span className="material-symbols-outlined">person_add</span>
					고객 추가
				</button>
			</div>

			{/* Search & Filter */}
			<div className="mb-6 flex items-center gap-4">
				<div className="relative max-w-md flex-1">
					<span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400">
						search
					</span>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
						}}
						placeholder="이름 또는 전화번호로 검색"
						className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 py-3 pr-4 pl-12 focus:ring-2 focus:outline-none"
					/>
				</div>
				<label className="inline-flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						checked={showInactive}
						onChange={(e) => {
							setShowInactive(e.target.checked);
						}}
						className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded"
					/>
					<span className="text-sm text-neutral-600">비활성 고객 포함</span>
				</label>
			</div>

			{/* Stats */}
			<div className="mb-6 grid grid-cols-4 gap-4">
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">전체 고객</p>
					<p className="text-2xl font-bold text-neutral-800">{customers.length}</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">활성 고객</p>
					<p className="text-2xl font-bold text-green-600">
						{customers.filter((c) => c.status === "active").length}
					</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">정액권 보유</p>
					<p className="text-2xl font-bold text-orange-600">
						{customers.filter((c) => c.storedValue !== undefined && c.storedValue > 0).length}
					</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">정기권 보유</p>
					<p className="text-2xl font-bold text-purple-600">
						{customers.filter((c) => c.membership !== undefined).length}
					</p>
				</div>
			</div>

			{/* Customer Table */}
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				<table className="w-full">
					<thead>
						<tr className="border-b border-neutral-200 bg-neutral-50">
							<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">고객</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">연락처</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">방문</th>
							<th className="px-6 py-4 text-right text-sm font-bold text-neutral-600">정액권</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">정기권</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">상태</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">관리</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{filteredCustomers.map((customer) => (
							<tr
								key={customer.id}
								className={`transition-colors hover:bg-neutral-50 ${
									customer.status === "inactive" ? "opacity-60" : ""
								}`}
							>
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="bg-primary-100 text-primary-600 flex h-10 w-10 items-center justify-center rounded-full font-bold">
											{customer.initials}
										</div>
										<div>
											<p className="font-medium text-neutral-800">{customer.name}</p>
											{customer.memo && (
												<p className="mt-0.5 max-w-[200px] truncate text-xs text-neutral-400">
													{customer.memo}
												</p>
											)}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 text-neutral-600">{customer.phone}</td>
								<td className="px-6 py-4 text-center">
									<div>
										<span className="font-medium text-neutral-800">{customer.visitCount}회</span>
										{customer.lastVisitDate && (
											<p className="text-xs text-neutral-400">
												최근 {formatDate(customer.lastVisitDate)}
											</p>
										)}
									</div>
								</td>
								<td className="px-6 py-4 text-right">
									<span
										className={
											customer.storedValue && customer.storedValue > 0
												? "font-medium text-orange-600"
												: "text-neutral-400"
										}
									>
										{formatCurrency(customer.storedValue)}
									</span>
								</td>
								<td className="px-6 py-4 text-center">
									{customer.membership ? (
										<span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
											{customer.membership.name} (
											{customer.membership.total - customer.membership.used}/
											{customer.membership.total})
										</span>
									) : (
										<span className="text-neutral-400">-</span>
									)}
								</td>
								<td className="px-6 py-4 text-center">
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig[customer.status].bgColor} ${statusConfig[customer.status].textColor}`}
									>
										{statusConfig[customer.status].label}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center justify-center gap-1">
										<button
											onClick={() => {
												openEditModal(customer);
											}}
											className="hover:bg-primary-50 hover:text-primary-500 rounded-lg p-2 text-neutral-400 transition-colors"
											title="수정"
										>
											<span className="material-symbols-outlined text-xl">edit</span>
										</button>
										{customer.status === "active" ? (
											<button
												onClick={() => {
													handleDeactivate(customer.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
												title="비활성화"
											>
												<span className="material-symbols-outlined text-xl">person_off</span>
											</button>
										) : (
											<button
												onClick={() => {
													handleReactivate(customer.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-green-50 hover:text-green-500"
												title="활성화"
											>
												<span className="material-symbols-outlined text-xl">person</span>
											</button>
										)}
										<button
											onClick={() => {
												handleDelete(customer.id);
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
				{filteredCustomers.length === 0 && (
					<div className="py-16 text-center">
						<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">
							person_search
						</span>
						<p className="text-neutral-400">
							{searchQuery ? "검색 결과가 없습니다" : "등록된 고객이 없습니다"}
						</p>
						{!searchQuery && (
							<button
								onClick={openAddModal}
								className="text-primary-500 mt-4 font-bold hover:underline"
							>
								첫 번째 고객 추가하기
							</button>
						)}
					</div>
				)}
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingCustomer ? "고객 수정" : "고객 추가"}
							</h2>
						</div>
						<div className="space-y-6 p-6">
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
									placeholder="고객 이름"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
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
										setFormData((prev) => ({
											...prev,
											phone: e.target.value,
										}));
									}}
									placeholder="010-0000-0000"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
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
										className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
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
										className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
									/>
								</div>
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
									placeholder="특이사항, 알러지 정보 등"
									rows={3}
									className="focus:ring-primary-500 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
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
								disabled={!formData.name.trim() || !formData.phone.trim()}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
							>
								{editingCustomer ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
