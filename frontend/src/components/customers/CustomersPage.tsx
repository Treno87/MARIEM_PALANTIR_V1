import { type ReactElement, useMemo, useState } from "react";
import {
	type Customer,
	getAutoStatus,
	getCustomerTier,
	getDaysSinceLastVisit,
	tierConfig,
	useCustomers,
} from "../../contexts/CustomerContext";
import { useCreateCustomer, useUpdateCustomer } from "../../hooks/useCustomersApi";
import { USE_API } from "../../lib/config";
import CustomerDetailModal from "./CustomerDetailModal";
import CustomerFormModal, { type CustomerFormData } from "./CustomerFormModal";

// 정렬 관련 타입
type CustomerSortKey =
	| "name"
	| "phone"
	| "visitCount"
	| "tier"
	| "totalSpent"
	| "storedValue"
	| "status";
type SortDirection = "asc" | "desc";

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

	// API mutation hooks
	const createCustomerMutation = useCreateCustomer();
	const updateCustomerMutation = useUpdateCustomer();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

	// 필터 및 검색
	const [searchQuery, setSearchQuery] = useState("");
	const [showInactive, setShowInactive] = useState(false);
	const [sortKey, setSortKey] = useState<CustomerSortKey>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const filteredCustomers = customers.filter((c) => {
		// 상태 필터
		if (!showInactive && c.status === "inactive") return false;
		// 검색 필터
		if (searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			return c.name.toLowerCase().includes(query) || c.phone.includes(searchQuery);
		}
		return true;
	});

	// 정렬된 고객 목록
	const sortedCustomers = useMemo(() => {
		const tierOrder = { vip: 3, gold: 2, silver: 1, bronze: 0 };
		return [...filteredCustomers].sort((a, b) => {
			let comparison = 0;
			switch (sortKey) {
				case "name":
					comparison = a.name.localeCompare(b.name, "ko");
					break;
				case "phone":
					comparison = a.phone.localeCompare(b.phone);
					break;
				case "visitCount":
					comparison = a.visitCount - b.visitCount;
					break;
				case "tier":
					comparison =
						tierOrder[getCustomerTier(a.totalSpent)] - tierOrder[getCustomerTier(b.totalSpent)];
					break;
				case "totalSpent":
					comparison = a.totalSpent - b.totalSpent;
					break;
				case "storedValue":
					comparison = (a.storedValue ?? 0) - (b.storedValue ?? 0);
					break;
				case "status":
					comparison = a.status.localeCompare(b.status);
					break;
			}
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filteredCustomers, sortKey, sortDirection]);

	const handleSort = (key: CustomerSortKey): void => {
		if (sortKey === key) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDirection("asc");
		}
	};

	const getSortIcon = (key: CustomerSortKey): string => {
		if (sortKey !== key) return "unfold_more";
		return sortDirection === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
	};

	const openAddModal = (): void => {
		setEditingCustomer(null);
		setIsModalOpen(true);
	};

	const openEditModal = (customer: Customer): void => {
		setEditingCustomer(customer);
		setIsModalOpen(true);
	};

	const closeModal = (): void => {
		setIsModalOpen(false);
		setEditingCustomer(null);
	};

	const handleFormSubmit = (formData: CustomerFormData): void => {
		const customerData = {
			name: formData.name,
			phone: formData.phone,
			gender: formData.gender,
			...(formData.birthDate !== "" && { birthDate: formData.birthDate }),
			...(formData.memo !== "" && { memo: formData.memo }),
		};

		if (editingCustomer !== null) {
			// 수정 모드
			if (USE_API) {
				updateCustomerMutation.mutate({
					id: Number(editingCustomer.id),
					data: customerData,
				});
			}
			updateCustomer(editingCustomer.id, customerData);
		} else {
			// 생성 모드
			if (USE_API) {
				createCustomerMutation.mutate(customerData);
			}
			addCustomer(customerData);
		}
	};

	const handleDeactivate = (id: string): void => {
		if (!confirm("이 고객을 비활성화 하시겠습니까?")) return;

		updateCustomer(id, { status: "inactive" });
	};

	const handleReactivate = (id: string): void => {
		updateCustomer(id, { status: "active" });
	};

	const handleDelete = (id: string): void => {
		if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

		deleteCustomer(id);
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
			<div className="mb-6 grid grid-cols-5 gap-4">
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">전체 고객</p>
					<p className="text-2xl font-bold text-neutral-800">{customers.length}</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">VIP 고객</p>
					<p className="text-2xl font-bold text-amber-600">
						{customers.filter((c) => getCustomerTier(c.totalSpent) === "vip").length}
					</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">활성 고객</p>
					<p className="text-2xl font-bold text-green-600">
						{customers.filter((c) => getAutoStatus(c.lastVisitDate) === "active").length}
					</p>
					<p className="text-xs text-neutral-400">90일 이내 방문</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">휴면 위험</p>
					<p className="text-2xl font-bold text-red-500">
						{customers.filter((c) => getAutoStatus(c.lastVisitDate) === "inactive").length}
					</p>
					<p className="text-xs text-neutral-400">90일 이상 미방문</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">총 LTV</p>
					<p className="text-2xl font-bold text-blue-600">
						{(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 10000).toFixed(0)}
						만원
					</p>
				</div>
			</div>

			{/* Customer Table */}
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				<table className="w-full">
					<thead>
						<tr className="border-b border-neutral-200 bg-neutral-50">
							<th
								onClick={() => {
									handleSort("name");
								}}
								className="cursor-pointer px-6 py-4 text-left text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center gap-1">
									고객
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("name")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("phone");
								}}
								className="cursor-pointer px-6 py-4 text-left text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center gap-1">
									연락처
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("phone")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("visitCount");
								}}
								className="cursor-pointer px-6 py-4 text-center text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center justify-center gap-1">
									방문
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("visitCount")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("tier");
								}}
								className="cursor-pointer px-6 py-4 text-center text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center justify-center gap-1">
									등급
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("tier")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("totalSpent");
								}}
								className="cursor-pointer px-6 py-4 text-right text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center justify-end gap-1">
									LTV
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("totalSpent")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("storedValue");
								}}
								className="cursor-pointer px-6 py-4 text-right text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center justify-end gap-1">
									정액권
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("storedValue")}
									</span>
								</div>
							</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">정기권</th>
							<th
								onClick={() => {
									handleSort("status");
								}}
								className="cursor-pointer px-6 py-4 text-center text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center justify-center gap-1">
									상태
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("status")}
									</span>
								</div>
							</th>
							<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">관리</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{sortedCustomers.map((customer) => (
							<tr
								key={customer.id}
								onClick={() => {
									setSelectedCustomer(customer);
								}}
								className={`cursor-pointer transition-colors hover:bg-neutral-50 ${
									customer.status === "inactive" ? "opacity-60" : ""
								}`}
							>
								{/* 고객 */}
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="bg-primary-100 text-primary-600 flex h-10 w-10 items-center justify-center rounded-full font-bold">
											{customer.initials}
										</div>
										<div>
											<p className="font-medium text-neutral-800">{customer.name}</p>
											{customer.memo !== undefined && customer.memo !== "" && (
												<p className="mt-0.5 max-w-[200px] truncate text-xs text-neutral-400">
													{customer.memo}
												</p>
											)}
										</div>
									</div>
								</td>
								{/* 연락처 */}
								<td className="px-6 py-4 text-neutral-600">{customer.phone}</td>
								{/* 방문 */}
								<td className="px-6 py-4 text-center">
									<div>
										<span className="font-medium text-neutral-800">{customer.visitCount}회</span>
										{customer.lastVisitDate !== undefined && customer.lastVisitDate !== "" && (
											<p className="text-xs text-neutral-400">
												{getDaysSinceLastVisit(customer.lastVisitDate)}일 전
											</p>
										)}
									</div>
								</td>
								{/* 등급 */}
								<td className="px-6 py-4 text-center">
									{(() => {
										const tier = getCustomerTier(customer.totalSpent);
										const config = tierConfig[tier];
										return (
											<span
												className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${config.bgColor} ${config.color}`}
											>
												{config.label}
											</span>
										);
									})()}
								</td>
								{/* LTV */}
								<td className="px-6 py-4 text-right">
									<span className="font-medium text-neutral-800">
										{formatCurrency(customer.totalSpent)}
									</span>
								</td>
								{/* 정액권 */}
								<td className="px-6 py-4 text-right">
									<span
										className={
											customer.storedValue !== undefined && customer.storedValue > 0
												? "font-medium text-orange-600"
												: "text-neutral-400"
										}
									>
										{formatCurrency(customer.storedValue)}
									</span>
								</td>
								{/* 정기권 */}
								<td className="px-6 py-4 text-center">
									{customer.membership !== undefined ? (
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
											onClick={(e) => {
												e.stopPropagation();
												openEditModal(customer);
											}}
											className="hover:bg-primary-50 hover:text-primary-500 rounded-lg p-2 text-neutral-400 transition-colors"
											title="수정"
										>
											<span className="material-symbols-outlined text-xl">edit</span>
										</button>
										{customer.status === "active" ? (
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeactivate(customer.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
												title="비활성화"
											>
												<span className="material-symbols-outlined text-xl">person_off</span>
											</button>
										) : (
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleReactivate(customer.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-green-50 hover:text-green-500"
												title="활성화"
											>
												<span className="material-symbols-outlined text-xl">person</span>
											</button>
										)}
										<button
											onClick={(e) => {
												e.stopPropagation();
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
				{sortedCustomers.length === 0 && (
					<div className="py-16 text-center">
						<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">
							person_search
						</span>
						<p className="text-neutral-400">
							{searchQuery !== "" ? "검색 결과가 없습니다" : "등록된 고객이 없습니다"}
						</p>
						{searchQuery === "" && (
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

			{/* Customer Detail Modal */}
			{selectedCustomer !== null && (
				<CustomerDetailModal
					customer={selectedCustomer}
					onClose={() => {
						setSelectedCustomer(null);
					}}
				/>
			)}

			{/* Add/Edit Modal */}
			<CustomerFormModal
				isOpen={isModalOpen}
				onClose={closeModal}
				onSubmit={handleFormSubmit}
				mode={editingCustomer !== null ? "edit" : "create"}
				customer={editingCustomer}
			/>
		</div>
	);
}
