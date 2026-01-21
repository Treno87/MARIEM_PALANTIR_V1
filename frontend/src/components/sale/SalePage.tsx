import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCatalog } from "../../contexts/CatalogContext";
import type { Customer } from "../../contexts/CustomerContext";
import { useCustomers } from "../../contexts/CustomerContext";
import { useSales } from "../../contexts/SaleContext";
import { useStaff } from "../../contexts/StaffContext";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { CategoryModal } from "../catalog/CategoryModal";
import { ProductBrandModal } from "../catalog/ProductBrandModal";
import { ProductItemModal } from "../catalog/ProductItemModal";
import { ServiceItemModal } from "../catalog/ServiceItemModal";
import { StaffFormModal } from "../staff/StaffFormModal";
import { CartTable } from "./CartTable";
import type { CatalogModalContext, CatalogModalType } from "./CatalogTabs";
import { CatalogTabs } from "./CatalogTabs";
import { CustomerSelect } from "./CustomerSelect";
import { PAYMENT_METHOD_LABELS } from "./constants";
import { PaymentSummary } from "./PaymentSummary";
import { SaleFooter } from "./SaleFooter";
import { StaffSelect } from "./StaffSelect";
import type { CartItem, ItemPaymentMethod } from "./types";

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

	// 예약에서 넘어온 경우 초기값 설정 (lazy initialization)
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => {
		if (reservationState?.customerId !== undefined && reservationState.customerId !== "") {
			// customerId로 고객 존재 여부 확인
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

	const [cart, setCart] = useState<CartItem[]>(() => {
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

		// 디자이너 정보
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

		// SaleRecord 생성
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

		// 거래 저장
		addSale(saleRecord);

		// 고객 정보 업데이트
		const updates: Partial<Customer> = {};

		// 정액권 사용 차감 후 충전 반영
		if (usedStoredValue > 0 || storedValueTopup > 0) {
			updates.storedValue =
				(selectedCustomer.storedValue ?? 0) - usedStoredValue + storedValueTopup;
		}

		// 정기권 사용 차감 후 충전 반영
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

		// 방문 횟수, 마지막 방문일, 총 결제액(LTV) 업데이트
		updates.visitCount = selectedCustomer.visitCount + 1;
		updates.lastVisitDate = today;
		updates.totalSpent = selectedCustomer.totalSpent + grandTotal;

		updateCustomer(selectedCustomerId, updates);

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
					onAddToCart={handleAddToCart}
					onOpenModal={handleOpenModal}
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
