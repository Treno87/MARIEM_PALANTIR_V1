import type { ReactElement } from "react";
import { itemPaymentMethods } from "./constants";
import type { CartItem } from "./types";

interface PaymentSummaryProps {
	cart: CartItem[];
}

interface PaymentTotal {
	method: string;
	label: string;
	color: string;
	amount: number;
	count: number;
	isMembership: boolean;
}

export function PaymentSummary({ cart }: PaymentSummaryProps): ReactElement | null {
	// topup 제외한 항목만 계산
	const payableItems = cart.filter((item) => item.type !== "topup");

	if (payableItems.length === 0) return null;

	// 결제수단별 합계 계산
	const totals: PaymentTotal[] = itemPaymentMethods.map((method) => {
		const items = payableItems.filter((item) => item.paymentMethod === method.id);
		const amount = items.reduce((sum, item) => sum + item.finalPrice, 0);
		const count = items.length;

		return {
			method: method.id,
			label: method.label,
			color: method.color,
			amount,
			count,
			isMembership: method.id === "membership",
		};
	});

	// 사용된 결제수단만 필터
	const usedTotals = totals.filter((t) => t.count > 0);

	// 전체 합계 (정기권 제외)
	const grandTotal = totals.filter((t) => !t.isMembership).reduce((sum, t) => sum + t.amount, 0);

	const membershipCount = totals.find((t) => t.isMembership)?.count ?? 0;

	return (
		<div className="border-t border-neutral-200 px-6 py-4">
			<h3 className="mb-3 text-sm font-bold text-neutral-700">결제 요약</h3>

			{/* 결제수단별 버튼 */}
			<div className="mb-4 flex flex-wrap gap-2">
				{usedTotals.map((total) => (
					<div
						key={total.method}
						className="flex flex-col items-center rounded-xl px-4 py-2"
						style={{ backgroundColor: `${total.color}15` }}
					>
						<span className="mb-0.5 text-xs font-medium" style={{ color: total.color }}>
							{total.label}
						</span>
						<span className="text-sm font-bold" style={{ color: total.color }}>
							{total.isMembership
								? `${String(total.count)}회`
								: `${total.amount.toLocaleString()}원`}
						</span>
					</div>
				))}
			</div>

			{/* 총 합계 */}
			<div className="flex items-center justify-end gap-4 border-t border-neutral-100 pt-2">
				{membershipCount > 0 && (
					<span className="text-sm text-neutral-500">정기권 {membershipCount}회 사용</span>
				)}
				<div className="text-right">
					<span className="mr-2 text-sm text-neutral-500">총 결제</span>
					<span className="text-xl font-bold text-neutral-800">
						{grandTotal.toLocaleString()}원
					</span>
				</div>
			</div>
		</div>
	);
}
