import type { ReactElement } from "react";
import { useCallback, useRef, useState } from "react";
import type { Customer } from "../../contexts/CustomerContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import CustomerFormModal, { type CustomerFormData } from "../customers/CustomerFormModal";

interface CustomerSelectProps {
	customers: Customer[];
	selectedCustomer: Customer | undefined;
	onSelect: (customerId: string) => void;
	onClear: () => void;
	onAddCustomer: (customer: {
		name: string;
		phone: string;
		gender?: string;
		birthDate?: string;
		memo?: string;
	}) => string;
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

	const dropdownRef = useRef<HTMLDivElement>(null);

	const closeDropdown = useCallback(() => {
		setShowSearch(false);
		setSearchQuery("");
	}, []);

	const closeModal = useCallback(() => {
		setShowNewCustomerModal(false);
	}, []);

	useClickOutside(dropdownRef, closeDropdown, showSearch);
	useEscapeKey(
		showNewCustomerModal ? closeModal : closeDropdown,
		showSearch || showNewCustomerModal,
	);

	const filteredCustomers = customers.filter(
		(c) => c.name.includes(searchQuery) || c.phone.includes(searchQuery),
	);

	const selectFirstCustomerOnEnter = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key !== "Enter") return;

		const firstCustomer = filteredCustomers[0];
		if (firstCustomer === undefined) return;

		onSelect(firstCustomer.id);
		closeDropdown();
	};

	const handleFormSubmit = (formData: CustomerFormData): void => {
		const newCustomerId = onAddCustomer({
			name: formData.name,
			phone: formData.phone,
			gender: formData.gender,
			...(formData.birthDate !== "" && { birthDate: formData.birthDate }),
			...(formData.memo !== "" && { memo: formData.memo }),
		});
		onSelect(newCustomerId);
		closeDropdown();
	};

	return (
		<div className="relative">
			{selectedCustomer !== undefined ? (
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
							onKeyDown={selectFirstCustomerOnEnter}
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

			{/* 신규 고객 등록 모달 */}
			<CustomerFormModal
				isOpen={showNewCustomerModal}
				onClose={closeModal}
				onSubmit={handleFormSubmit}
				mode="create"
			/>
		</div>
	);
}
