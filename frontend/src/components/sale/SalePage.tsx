import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCatalog } from "../../contexts/CatalogContext";
import type { Customer } from "../../contexts/CustomerContext";
import { useCustomers } from "../../contexts/CustomerContext";
import { useSales } from "../../contexts/SaleContext";
import { useStaff } from "../../contexts/StaffContext";
import { useCart } from "../../hooks/useCart";
import { useCustomerBalance } from "../../hooks/useCustomerBalance";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { CategoryModal } from "../catalog/CategoryModal";
import { ProductBrandModal } from "../catalog/ProductBrandModal";
import { ProductItemModal } from "../catalog/ProductItemModal";
import { ServiceItemModal } from "../catalog/ServiceItemModal";
import StaffFormModal from "../staff/StaffFormModal";
import { CartTable } from "./CartTable";
import type { CatalogModalContext, CatalogModalType } from "./CatalogTabs";
import { CatalogTabs } from "./CatalogTabs";
import { CustomerSelect } from "./CustomerSelect";
import { PAYMENT_METHOD_LABELS } from "./constants";
import { PaymentSummary } from "./PaymentSummary";
import { SaleFooter } from "./SaleFooter";
import { StaffSelect } from "./StaffSelect";
import type { CartItem } from "./types";

type ModalType = "staff" | CatalogModalType | null;

interface ReservationState {
	customerId?: string;
	customerName?: string;
	staffId?: string;
	staffName?: string;
	serviceName?: string;
}

export default function SalePage(): ReactElement {
	const location = useLocation();
	const reservationState = location.state as ReservationState | null;

	const { salesStaff } = useStaff();
	const {
		serviceCategories,
		productCategories,
		storedValueOptions,
		membershipOptions,
		discountEvents,
	} = useCatalog();
	const { customers, addCustomer, updateCustomer } = useCustomers();
	const { addSale } = useSales();

	// 예약에서 넘어온 경우 초기 카트 계산
	const getInitialCart = (): CartItem[] => {
		if (reservationState?.serviceName !== undefined && reservationState.serviceName !== "") {
			for (const category of serviceCategories) {
				const serviceItem = category.items.find(
					(item) => item.name === reservationState.serviceName,
				);
				if (serviceItem !== undefined) {
					return [
						{
							id: serviceItem.id,
							name: serviceItem.name,
							price: serviceItem.price,
							quantity: 1,
							type: "service" as const,
							paymentMethod: "card" as const,
							discountAmount: 0,
							finalPrice: serviceItem.price,
						},
					];
				}
			}
		}
		return [];
	};

	// 커스텀 훅 사용
	const {
		cart,
		subtotal,
		totalDiscount,
		total,
		topupTotal,
		addToCart,
		updateQuantity,
		removeFromCart,
		updatePaymentMethod,
		updateEvent,
		clearCart,
	} = useCart(getInitialCart(), discountEvents);

	// 예약에서 넘어온 경우 초기값 설정 (lazy initialization)
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => {
		if (reservationState?.customerId !== undefined && reservationState.customerId !== "") {
			const existingCustomer = customers.find((c) => c.id === reservationState.customerId);
			return existingCustomer?.id ?? null;
		}
		return null;
	});

	const [selectedDesignerId, setSelectedDesignerId] = useState<string>(() => {
		if (reservationState?.staffId !== undefined && reservationState.staffId !== "") {
			const staffExists = salesStaff.some((s) => s.id === reservationState.staffId);
			if (staffExists) {
				return reservationState.staffId;
			}
		}
		return "1";
	});

	// 모달 상태
	const [activeModal, setActiveModal] = useState<ModalType>(null);
	const [modalContext, setModalContext] = useState<CatalogModalContext>({});

	const closeModal = useCallback(() => {
		setActiveModal(null);
		setModalContext({});
	}, []);

	useEscapeKey(closeModal, activeModal !== null);

	const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

	// 고객 잔액 계산 훅 사용
	const {
		usedStoredValue,
		usedMembershipCount,
		displayedStoredValue,
		displayedMembershipRemaining,
	} = useCustomerBalance(selectedCustomer, cart);

	const handleAddCustomer = (newCustomer: {
		name: string;
		phone: string;
		memo?: string;
	}): string => {
		return addCustomer(newCustomer);
	};

	const handleOpenModal = (type: CatalogModalType, context?: CatalogModalContext): void => {
		setActiveModal(type);
		setModalContext(context ?? {});
	};

	const handleSave = (): void => {
		if (selectedCustomerId === null || cart.length === 0) {
			alert("고객과 시술/상품을 입력해주세요.");
			return;
		}

		if (!selectedCustomer) {
			alert("고객 정보를 찾을 수 없습니다.");
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

		const selectedStaff = salesStaff.find((s) => s.id === selectedDesignerId);
		if (!selectedStaff) {
			alert("담당 디자이너를 선택해주세요.");
			return;
		}

		// 결제수단별 금액 계산
		const paymentAmounts: Record<string, number> = {};
		for (const item of cart) {
			const method = PAYMENT_METHOD_LABELS[item.paymentMethod] ?? item.paymentMethod;
			paymentAmounts[method] = (paymentAmounts[method] ?? 0) + item.finalPrice;
		}

		const payments = Object.entries(paymentAmounts)
			.filter(([, amount]) => amount > 0)
			.map(([method, amount]) => ({ method, amount }));

		const today = new Date().toISOString().split("T")[0] ?? "";
		const isNewCustomer = selectedCustomer.visitCount === 0;
		const grandTotal = total + topupTotal;

		const saleRecord = {
			saleDate: today,
			customer: {
				id: selectedCustomer.id,
				name: selectedCustomer.name,
				phone: selectedCustomer.phone,
				type: isNewCustomer ? "new" : "returning",
			} as const,
			staff: {
				id: selectedStaff.id,
				name: selectedStaff.name,
				color: selectedStaff.color,
			},
			items: cart.map((item) => ({
				name: item.name,
				quantity: item.quantity,
				unitPrice: item.price,
				lineTotal: item.finalPrice,
				type: item.type,
			})),
			subtotal,
			discountAmount: totalDiscount,
			total: grandTotal,
			payments,
			status: "completed" as const,
		};

		addSale(saleRecord);

		// 고객 정보 업데이트
		const updates: Partial<Customer> = {};

		if (usedStoredValue > 0 || storedValueTopup > 0) {
			updates.storedValue =
				(selectedCustomer.storedValue ?? 0) - usedStoredValue + storedValueTopup;
		}

		if (selectedCustomer.membership) {
			updates.membership = {
				...selectedCustomer.membership,
				used: selectedCustomer.membership.used + usedMembershipCount,
				total: selectedCustomer.membership.total + membershipTopup,
			};
		} else if (membershipTopup > 0 && membershipItem) {
			updates.membership = {
				name: membershipItem.name,
				used: 0,
				total: membershipTopup,
			};
		}

		updates.visitCount = selectedCustomer.visitCount + 1;
		updates.lastVisitDate = today;
		updates.totalSpent = selectedCustomer.totalSpent + grandTotal;

		updateCustomer(selectedCustomerId, updates);

		alert("거래가 저장되었습니다.");
		clearCart();
	};

	const handleReset = (): void => {
		setSelectedCustomerId(null);
		clearCart();
	};

	const canSave = selectedCustomerId !== null && cart.length > 0;

	// CartTable에 전달할 원본 잔액 (사용량 차감 전)
	const originalStoredValue =
		selectedCustomer?.storedValue !== undefined && selectedCustomer.storedValue > 0
			? selectedCustomer.storedValue
			: 0;

	const originalMembershipRemaining = selectedCustomer?.membership
		? selectedCustomer.membership.total - selectedCustomer.membership.used
		: 0;

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
								<th className="w-64 px-6 py-3">고객</th>
								<th className="w-[140px] px-6 py-3">정액권</th>
								<th className="w-[140px] px-6 py-3">정기권</th>
								<th className="px-6 py-3">디자이너</th>
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
											setActiveModal("staff");
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
					onAddToCart={addToCart}
					onOpenModal={handleOpenModal}
				/>

				{/* 선택한 항목 */}
				<CartTable
					cart={cart}
					displayedStoredValue={originalStoredValue}
					displayedMembershipRemaining={originalMembershipRemaining}
					onUpdateQuantity={updateQuantity}
					onRemove={removeFromCart}
					onUpdatePaymentMethod={updatePaymentMethod}
					onUpdateEvent={updateEvent}
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

			{/* 모달들 */}
			<StaffFormModal isOpen={activeModal === "staff"} onClose={closeModal} />

			<CategoryModal
				isOpen={activeModal === "serviceCategory"}
				onClose={closeModal}
				type="service"
			/>

			{modalContext.categoryId !== undefined && modalContext.categoryId !== "" && (
				<ServiceItemModal
					isOpen={activeModal === "serviceItem"}
					onClose={closeModal}
					categoryId={modalContext.categoryId}
				/>
			)}

			<CategoryModal
				isOpen={activeModal === "productCategory"}
				onClose={closeModal}
				type="product"
			/>

			{modalContext.categoryId !== undefined && modalContext.categoryId !== "" && (
				<ProductBrandModal
					isOpen={activeModal === "productBrand"}
					onClose={closeModal}
					categoryId={modalContext.categoryId}
				/>
			)}

			{modalContext.categoryId !== undefined &&
				modalContext.categoryId !== "" &&
				modalContext.brandId !== undefined &&
				modalContext.brandId !== "" && (
					<ProductItemModal
						isOpen={activeModal === "productItem"}
						onClose={closeModal}
						categoryId={modalContext.categoryId}
						brandId={modalContext.brandId}
					/>
				)}
		</div>
	);
}
