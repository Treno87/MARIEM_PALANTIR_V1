import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import type { Customer, Payment, PaymentMethod } from "./types";

interface PaymentSectionProps {
	paymentMethods: PaymentMethod[];
	payments: Payment[];
	remaining: number;
	selectedCustomer: Customer | undefined;
	displayedStoredValue: number;
	displayedMembershipUsed: number;
	onAddPayment: (payment: Payment) => void;
	onRemovePayment: (index: number) => void;
}

export function PaymentSection({
	paymentMethods,
	payments,
	remaining,
	selectedCustomer,
	displayedStoredValue,
	displayedMembershipUsed,
	onAddPayment,
	onRemovePayment,
}: PaymentSectionProps): ReactElement {
	const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
	const [paymentAmount, setPaymentAmount] = useState<number>(0);

	const closeModal = useCallback(() => {
		setShowPaymentModal(null);
		setPaymentAmount(0);
	}, []);

	useEscapeKey(closeModal, showPaymentModal !== null);

	const openPaymentModal = (method: string): void => {
		if (remaining <= 0) return;

		// 정기권은 금액 입력 없이 바로 추가 (1회 = remaining 전액 차감)
		if (method === "membership") {
			onAddPayment({ method, amount: remaining });
			return;
		}

		setShowPaymentModal(method);
		setPaymentAmount(remaining);
	};

	const confirmPayment = (): void => {
		if (showPaymentModal === null || paymentAmount <= 0) return;

		const method = showPaymentModal;
		const amount =
			method === "stored_value" && displayedStoredValue > 0
				? Math.min(paymentAmount, displayedStoredValue)
				: paymentAmount;

		onAddPayment({ method, amount });
		closeModal();
	};

	return (
		<div className="border-t border-neutral-200 px-6 py-4">
			<h3 className="mb-3 text-sm font-bold text-neutral-700">결제 수단</h3>
			<div className="mb-3 flex flex-wrap gap-2">
				{paymentMethods.map((method) => (
					<button
						key={method.id}
						onClick={() => {
							openPaymentModal(method.id);
						}}
						disabled={remaining <= 0}
						className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
						style={{ backgroundColor: method.color }}
					>
						{method.label}
					</button>
				))}
				{selectedCustomer?.storedValue !== undefined &&
					selectedCustomer.storedValue > 0 &&
					displayedStoredValue > 0 && (
						<button
							onClick={() => {
								openPaymentModal("stored_value");
							}}
							disabled={remaining <= 0}
							className="rounded-lg bg-[#a25ddc] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
						>
							정액권
						</button>
					)}
				{selectedCustomer?.membership &&
					displayedMembershipUsed < selectedCustomer.membership.total && (
						<button
							onClick={() => {
								openPaymentModal("membership");
							}}
							disabled={remaining <= 0}
							className="rounded-lg bg-[#e2445c] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
						>
							정기권
						</button>
					)}
			</div>

			{payments.length > 0 && (
				<div className="space-y-2">
					{payments.map((payment, index) => {
						const method = paymentMethods.find((m) => m.id === payment.method);
						const isStoredValue = payment.method === "stored_value";
						const isMembership = payment.method === "membership";
						const color = isStoredValue
							? "#a25ddc"
							: isMembership
								? "#e2445c"
								: (method?.color ?? "#6b7280");

						return (
							<div
								key={index}
								className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2"
							>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
									<span className="text-sm font-medium">
										{isStoredValue ? "정액권" : isMembership ? "정기권" : method?.label}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-semibold">
										{isMembership ? "1회 사용" : `${payment.amount.toLocaleString()}원`}
									</span>
									<button
										onClick={() => {
											onRemovePayment(index);
										}}
										className="text-neutral-400 hover:text-[#e2445c]"
									>
										<span className="material-symbols-outlined text-sm">close</span>
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{showPaymentModal !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/40" onClick={closeModal} />
					<div className="relative mx-4 w-full max-w-sm rounded-lg bg-white shadow-xl">
						<div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
							<h3 className="text-lg font-bold">
								{showPaymentModal === "card" && "카드 결제"}
								{showPaymentModal === "cash" && "현금 결제"}
								{showPaymentModal === "transfer" && "계좌이체"}
								{showPaymentModal === "stored_value" && "정액권 사용"}
							</h3>
							<button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="p-6">
							<div className="mb-4">
								<label className="mb-1 block text-sm font-medium text-neutral-700">결제 금액</label>
								<div className="relative">
									<input
										type="number"
										value={paymentAmount || ""}
										onChange={(e) => {
											setPaymentAmount(Number(e.target.value));
										}}
										max={remaining}
										className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-right text-lg font-semibold focus:border-[#0073ea] focus:outline-none"
										autoFocus
									/>
									<span className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500">
										원
									</span>
								</div>
							</div>
							<div className="mb-2 flex justify-between text-sm text-neutral-500">
								<span>남은 금액</span>
								<span className="font-medium">{remaining.toLocaleString()}원</span>
							</div>
							<button
								onClick={() => {
									setPaymentAmount(remaining);
								}}
								className="mb-4 w-full rounded-lg py-2 text-sm text-[#0073ea] hover:bg-blue-50"
							>
								전액 입력
							</button>
						</div>
						<div className="flex gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
							<button
								onClick={closeModal}
								className="flex-1 rounded-lg border border-neutral-200 bg-white py-2 font-medium text-neutral-600 hover:bg-neutral-50"
							>
								취소
							</button>
							<button
								onClick={confirmPayment}
								disabled={paymentAmount <= 0 || paymentAmount > remaining}
								className="flex-1 rounded-lg bg-[#0073ea] py-2 font-medium text-white hover:bg-[#0060c2] disabled:opacity-40"
							>
								결제 추가
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
