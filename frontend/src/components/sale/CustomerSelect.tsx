import type { ReactElement } from "react";
import { useCallback, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import type { Customer } from "./types";

interface CustomerSelectProps {
	customers: Customer[];
	selectedCustomer: Customer | undefined;
	onSelect: (customerId: string) => void;
	onClear: () => void;
	onAddCustomer: (customer: Customer) => void;
}

function getInitials(name: string): string {
	const chars = name.trim().split("");
	if (chars.length < 2) return name.slice(0, 2).toUpperCase();
	const first = chars[0] ?? "";
	const last = chars[chars.length - 1] ?? "";
	return (first + last).toUpperCase();
}

export function CustomerSelect({
	customers,
	selectedCustomer,
	onSelect,
	onClear,
	onAddCustomer,
}: CustomerSelectProps): ReactElement {
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
	const [newCustomerForm, setNewCustomerForm] = useState({
		name: "",
		phone: "",
		memo: "",
	});

	const dropdownRef = useRef<HTMLDivElement>(null);

	const closeDropdown = useCallback(() => {
		setShowSearch(false);
		setSearchQuery("");
	}, []);

	const closeModal = useCallback(() => {
		setShowNewCustomerModal(false);
		setNewCustomerForm({ name: "", phone: "", memo: "" });
	}, []);

	useClickOutside(dropdownRef, closeDropdown, showSearch);
	useEscapeKey(
		showNewCustomerModal ? closeModal : closeDropdown,
		showSearch || showNewCustomerModal,
	);

	const filteredCustomers = customers.filter(
		(c) => c.name.includes(searchQuery) || c.phone.includes(searchQuery),
	);

	const handleNewCustomerSubmit = (): void => {
		if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) {
			alert("이름과 전화번호를 입력해주세요.");
			return;
		}
		const memoTrimmed = newCustomerForm.memo.trim();
		const newCustomer: Customer = {
			id: `new-${String(Date.now())}`,
			name: newCustomerForm.name.trim(),
			phone: newCustomerForm.phone.trim(),
			initials: getInitials(newCustomerForm.name.trim()),
			...(memoTrimmed && { memo: memoTrimmed }),
		};
		onAddCustomer(newCustomer);
		onSelect(newCustomer.id);
		closeModal();
		closeDropdown();
	};

	return (
		<div className="relative">
			{selectedCustomer ? (
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a25ddc] text-xs font-bold text-white">
						{selectedCustomer.initials}
					</div>
					<div>
						<p className="text-sm font-medium text-neutral-800">{selectedCustomer.name}</p>
						<p className="text-xs text-neutral-400">{selectedCustomer.phone}</p>
					</div>
					<button onClick={onClear} className="ml-2 text-neutral-400 hover:text-neutral-600">
						<span className="material-symbols-outlined text-sm">close</span>
					</button>
				</div>
			) : (
				<button
					onClick={() => {
						setShowSearch(true);
					}}
					className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600"
				>
					<span className="material-symbols-outlined text-lg">person_add</span>
					<span className="text-sm">고객 선택</span>
				</button>
			)}

			{showSearch && (
				<div
					ref={dropdownRef}
					className="absolute top-full left-0 z-20 mt-2 w-64 rounded-lg border border-neutral-200 bg-white shadow-lg"
				>
					<div className="border-b border-neutral-100 p-2">
						<input
							type="text"
							placeholder="검색..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
							}}
							className="w-full rounded-md bg-neutral-50 px-3 py-2 text-sm focus:outline-none"
							autoFocus
						/>
					</div>
					<button
						onClick={() => {
							setShowNewCustomerModal(true);
						}}
						className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0073ea] hover:bg-neutral-50"
					>
						<span className="material-symbols-outlined text-base">add</span>
						신규 고객 등록
					</button>
					<div className="max-h-40 overflow-y-auto">
						{filteredCustomers.map((customer) => (
							<button
								key={customer.id}
								onClick={() => {
									onSelect(customer.id);
									closeDropdown();
								}}
								className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-neutral-50"
							>
								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#a25ddc] text-[10px] font-bold text-white">
									{customer.initials}
								</div>
								<span className="text-sm">{customer.name}</span>
							</button>
						))}
					</div>
					<button
						onClick={closeDropdown}
						className="w-full border-t border-neutral-100 py-2 text-xs text-neutral-400 hover:bg-neutral-50"
					>
						닫기
					</button>
				</div>
			)}

			{showNewCustomerModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/40" onClick={closeModal} />
					<div className="relative mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
						<div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
							<h3 className="text-lg font-bold">신규 고객 등록</h3>
							<button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="space-y-4 p-6">
							<div>
								<label className="mb-1 block text-sm font-medium text-neutral-700">이름 *</label>
								<input
									type="text"
									value={newCustomerForm.name}
									onChange={(e) => {
										setNewCustomerForm({
											...newCustomerForm,
											name: e.target.value,
										});
									}}
									className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-[#0073ea] focus:outline-none"
									autoFocus
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium text-neutral-700">
									전화번호 *
								</label>
								<input
									type="tel"
									value={newCustomerForm.phone}
									onChange={(e) => {
										setNewCustomerForm({
											...newCustomerForm,
											phone: e.target.value,
										});
									}}
									className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-[#0073ea] focus:outline-none"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium text-neutral-700">메모</label>
								<textarea
									value={newCustomerForm.memo}
									onChange={(e) => {
										setNewCustomerForm({
											...newCustomerForm,
											memo: e.target.value,
										});
									}}
									rows={2}
									className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-[#0073ea] focus:outline-none"
								/>
							</div>
						</div>
						<div className="flex gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
							<button
								onClick={closeModal}
								className="flex-1 rounded-lg border border-neutral-200 bg-white py-2 font-medium text-neutral-600 hover:bg-neutral-50"
							>
								취소
							</button>
							<button
								onClick={handleNewCustomerSubmit}
								className="flex-1 rounded-lg bg-[#0073ea] py-2 font-medium text-white hover:bg-[#0060c2]"
							>
								등록
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
