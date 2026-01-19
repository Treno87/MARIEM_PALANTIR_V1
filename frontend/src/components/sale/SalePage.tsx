import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { useStaff } from "../../contexts/StaffContext";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { CartTable } from "./CartTable";
import { CatalogTabs } from "./CatalogTabs";
import { CustomerSelect } from "./CustomerSelect";
import {
	discountEvents,
	initialCustomers,
	membershipOptions,
	productCategories,
	serviceCategories,
	storedValueOptions,
} from "./constants";
import { PaymentSummary } from "./PaymentSummary";
import { SaleFooter } from "./SaleFooter";
import { StaffSelect } from "./StaffSelect";
import type { CartItem, Customer, ItemPaymentMethod } from "./types";

export default function SalePage(): ReactElement {
	const { salesStaff } = useStaff();
	const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
	const [selectedDesignerId, setSelectedDesignerId] = useState<string>("1");
	const [cart, setCart] = useState<CartItem[]>([]);
	const [showAddModal, setShowAddModal] = useState<string | null>(null);
	const [addForm, setAddForm] = useState({ name: "", price: "" });

	const closeAddModal = useCallback(() => {
		setShowAddModal(null);
		setAddForm({ name: "", price: "" });
	}, []);

	useEscapeKey(closeAddModal, showAddModal !== null && showAddModal !== "");

	const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

	// 정액권/정기권 사용량 계산 (cart 항목 기준)
	const usedStoredValue = cart
		.filter((item) => item.paymentMethod === "stored_value")
		.reduce((sum, item) => sum + item.finalPrice, 0);
	const usedMembershipCount = cart.filter((item) => item.paymentMethod === "membership").length;

	// 고객의 현재 잔액 - 사용량
	const displayedStoredValue =
		selectedCustomer?.storedValue !== undefined && selectedCustomer.storedValue > 0
			? selectedCustomer.storedValue - usedStoredValue
			: 0;

	const displayedMembershipRemaining = selectedCustomer?.membership
		? selectedCustomer.membership.total - selectedCustomer.membership.used - usedMembershipCount
		: 0;

	// 합계 계산 (topup 제외)
	const payableItems = cart.filter((item) => item.type !== "topup");
	const subtotal = payableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const totalDiscount = payableItems.reduce((sum, item) => sum + item.discountAmount, 0);

	// 실제 결제 금액 (정기권 사용 제외)
	const total = payableItems
		.filter((item) => item.paymentMethod !== "membership")
		.reduce((sum, item) => sum + item.finalPrice, 0);

	// topup 금액
	const topupTotal = cart
		.filter((item) => item.type === "topup")
		.reduce((sum, item) => sum + item.price * item.quantity, 0);

	const handleAddToCart = (item: CartItem): void => {
		const existingItem = cart.find((c) => c.id === item.id);
		if (existingItem) {
			setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
		} else {
			// 새 항목 추가 시 기본값 설정
			const newItem: CartItem = {
				...item,
				paymentMethod: item.paymentMethod,
				eventId: undefined,
				discountAmount: 0,
				finalPrice: item.price,
			};
			setCart([...cart, newItem]);
		}
	};

	const handleUpdateQuantity = (id: string, delta: number): void => {
		const updated = cart
			.map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
			.filter((item) => item.quantity > 0);
		setCart(updated);
	};

	const handleRemoveFromCart = (id: string): void => {
		setCart(cart.filter((item) => item.id !== id));
	};

	const handleUpdatePaymentMethod = (id: string, method: ItemPaymentMethod): void => {
		setCart(cart.map((item) => (item.id === id ? { ...item, paymentMethod: method } : item)));
	};

	const handleUpdateEvent = (id: string, eventId: string | undefined): void => {
		setCart(
			cart.map((item) => {
				if (item.id !== id) return item;

				const event =
					eventId !== undefined && eventId !== ""
						? discountEvents.find((e) => e.id === eventId)
						: undefined;

				const discountAmount = calculateDiscountAmount(event, item);
				const finalPrice = item.price * item.quantity - discountAmount;

				return { ...item, eventId, discountAmount, finalPrice };
			}),
		);
	};

	const calculateDiscountAmount = (
		event: (typeof discountEvents)[number] | undefined,
		item: CartItem,
	): number => {
		if (!event) return 0;

		if (event.discountType === "percent") {
			return Math.round(item.price * item.quantity * (event.discountValue / 100));
		}

		return event.discountValue;
	};

	const handleAddCustomer = (customer: Customer): void => {
		setCustomers([...customers, customer]);
	};

	const handleSave = (): void => {
		if (selectedCustomerId === null || cart.length === 0) {
			alert("고객과 시술/상품을 입력해주세요.");
			return;
		}

		const storedValueTopup = cart
			.filter((item) => item.type === "topup" && item.topupType === "stored_value")
			.reduce((sum, item) => sum + (item.topupValue ?? 0) * item.quantity, 0);

		const membershipTopup = cart
			.filter((item) => item.type === "topup" && item.topupType === "membership")
			.reduce((sum, item) => sum + (item.topupValue ?? 0) * item.quantity, 0);

		const membershipItem = cart.find(
			(item) => item.type === "topup" && item.topupType === "membership",
		);

		// 정액권/정기권 사용 및 충전 반영
		setCustomers(
			customers.map((c) => {
				if (c.id !== selectedCustomerId) return c;

				const updatedCustomer = { ...c };

				// 정액권 사용 차감 후 충전 반영
				if (usedStoredValue > 0 || storedValueTopup > 0) {
					updatedCustomer.storedValue =
						(updatedCustomer.storedValue ?? 0) - usedStoredValue + storedValueTopup;
				}

				// 정기권 사용 차감 후 충전 반영
				if (updatedCustomer.membership) {
					updatedCustomer.membership = {
						...updatedCustomer.membership,
						used: updatedCustomer.membership.used + usedMembershipCount,
						total: updatedCustomer.membership.total + membershipTopup,
					};
				} else if (membershipTopup > 0 && membershipItem) {
					updatedCustomer.membership = {
						name: membershipItem.name,
						used: 0,
						total: membershipTopup,
					};
				}

				return updatedCustomer;
			}),
		);

		// eslint-disable-next-line no-console
		console.log({
			customer_id: selectedCustomerId,
			designer_id: selectedDesignerId,
			items: cart,
			total,
			topupTotal,
			storedValueTopup,
			membershipTopup,
		});
		alert("거래가 저장되었습니다.");

		// 초기화
		setCart([]);
	};

	const handleReset = (): void => {
		setSelectedCustomerId(null);
		setCart([]);
	};

	const canSave = selectedCustomerId !== null && cart.length > 0;

	return (
		<div className="flex h-full flex-col bg-white">
			{/* Header */}
			<header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
				<h1 className="text-xl font-bold text-neutral-800">거래 입력</h1>
				<button onClick={handleReset} className="text-sm text-neutral-500 hover:text-neutral-700">
					초기화
				</button>
			</header>

			<main className="flex-1 overflow-y-auto pb-48">
				{/* 고객/디자이너/정액권 테이블 */}
				<div className="border-b border-neutral-200">
					<table className="w-full">
						<thead>
							<tr className="bg-neutral-50 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
								<th className="w-48 px-6 py-3">고객</th>
								<th className="w-[140px] px-6 py-3">정액권</th>
								<th className="w-[140px] px-6 py-3">정기권</th>
								<th className="px-6 py-3">담당</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-neutral-100">
								<td className="px-6 py-3">
									<CustomerSelect
										customers={customers}
										selectedCustomer={selectedCustomer}
										onSelect={setSelectedCustomerId}
										onClear={() => {
											setSelectedCustomerId(null);
										}}
										onAddCustomer={handleAddCustomer}
									/>
								</td>
								<td className="px-6 py-3">
									{selectedCustomer?.storedValue !== undefined &&
									selectedCustomer.storedValue > 0 ? (
										<span className="inline-flex items-center rounded-full bg-[#00c875] px-3 py-1 text-sm font-medium whitespace-nowrap text-white">
											{displayedStoredValue.toLocaleString()}원
										</span>
									) : (
										<span className="text-neutral-300">-</span>
									)}
								</td>
								<td className="px-6 py-3">
									{selectedCustomer?.membership ? (
										<span className="inline-flex items-center rounded-full bg-[#fdab3d] px-3 py-1 text-sm font-medium whitespace-nowrap text-white">
											{displayedMembershipRemaining}회 남음
										</span>
									) : (
										<span className="text-neutral-300">-</span>
									)}
								</td>
								<td className="px-6 py-3">
									<StaffSelect
										designers={salesStaff}
										selectedDesignerId={selectedDesignerId}
										onSelect={setSelectedDesignerId}
										onAddClick={() => {
											setShowAddModal("designer");
										}}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* 시술/상품/멤버쉽 탭 */}
				<CatalogTabs
					serviceCategories={serviceCategories}
					productCategories={productCategories}
					storedValueOptions={storedValueOptions}
					membershipOptions={membershipOptions}
					onAddToCart={handleAddToCart}
					onShowAddModal={setShowAddModal}
				/>

				{/* 선택한 항목 */}
				<CartTable
					cart={cart}
					displayedStoredValue={
						selectedCustomer?.storedValue !== undefined && selectedCustomer.storedValue > 0
							? selectedCustomer.storedValue
							: 0
					}
					displayedMembershipRemaining={
						selectedCustomer?.membership
							? selectedCustomer.membership.total - selectedCustomer.membership.used
							: 0
					}
					onUpdateQuantity={handleUpdateQuantity}
					onRemove={handleRemoveFromCart}
					onUpdatePaymentMethod={handleUpdatePaymentMethod}
					onUpdateEvent={handleUpdateEvent}
				/>

				{/* 결제 요약 */}
				<PaymentSummary cart={cart} />
			</main>

			{/* Footer */}
			<SaleFooter
				subtotal={subtotal}
				discountAmount={totalDiscount}
				total={total + topupTotal}
				canSave={canSave}
				onSave={handleSave}
			/>

			{/* 항목 추가 모달 */}
			{showAddModal !== null && showAddModal !== "" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/40" onClick={closeAddModal} />
					<div className="relative mx-4 w-full max-w-sm rounded-lg bg-white shadow-xl">
						<div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
							<h3 className="text-lg font-bold">
								{showAddModal === "designer" && "디자이너 추가"}
								{showAddModal === "serviceCategory" && "시술 카테고리 추가"}
								{showAddModal === "serviceItem" && "시술 추가"}
								{showAddModal === "productCategory" && "상품 카테고리 추가"}
								{showAddModal === "brand" && "브랜드 추가"}
								{showAddModal === "productItem" && "상품 추가"}
							</h3>
							<button onClick={closeAddModal} className="text-neutral-400 hover:text-neutral-600">
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="space-y-4 p-6">
							<div>
								<label className="mb-1 block text-sm font-medium text-neutral-700">이름 *</label>
								<input
									type="text"
									value={addForm.name}
									onChange={(e) => {
										setAddForm({ ...addForm, name: e.target.value });
									}}
									className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-[#0073ea] focus:outline-none"
									autoFocus
								/>
							</div>
							{showAddModal === "serviceItem" && (
								<div>
									<label className="mb-1 block text-sm font-medium text-neutral-700">가격 *</label>
									<input
										type="number"
										value={addForm.price}
										onChange={(e) => {
											setAddForm({ ...addForm, price: e.target.value });
										}}
										className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm focus:border-[#0073ea] focus:outline-none"
									/>
								</div>
							)}
						</div>
						<div className="flex gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
							<button
								onClick={closeAddModal}
								className="flex-1 rounded-lg border border-neutral-200 bg-white py-2 font-medium text-neutral-600 hover:bg-neutral-50"
							>
								취소
							</button>
							<button
								onClick={() => {
									// eslint-disable-next-line no-console
									console.log("추가:", showAddModal, addForm);
									alert(`${addForm.name} 추가됨 (MVP: 실제 저장은 미구현)`);
									closeAddModal();
								}}
								disabled={!addForm.name.trim()}
								className="flex-1 rounded-lg bg-[#0073ea] py-2 font-medium text-white hover:bg-[#0060c2] disabled:opacity-40"
							>
								추가
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
