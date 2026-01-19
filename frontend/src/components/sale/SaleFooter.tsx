import type { ReactElement } from "react";

interface SaleFooterProps {
	subtotal: number;
	discountAmount: number;
	total: number;
	canSave: boolean;
	onSave: () => void;
}

export function SaleFooter({
	subtotal,
	discountAmount,
	total,
	canSave,
	onSave,
}: SaleFooterProps): ReactElement {
	return (
		<footer className="fixed right-0 bottom-0 z-40 w-[calc(100%-280px)] border-t border-neutral-200 bg-white px-6 py-4">
			<div className="mb-4 flex items-center justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-4 text-sm">
						<span className="text-neutral-500">소계</span>
						<span className="font-medium">{subtotal.toLocaleString()}원</span>
					</div>
					{discountAmount > 0 && (
						<div className="flex items-center gap-4 text-sm">
							<span className="text-neutral-500">할인</span>
							<span className="font-medium text-[#e2445c]">
								-{discountAmount.toLocaleString()}원
							</span>
						</div>
					)}
				</div>
				<div className="text-right">
					<p className="mb-1 text-xs text-neutral-500">총 결제금액</p>
					<p className="text-2xl font-bold text-[#0073ea]">{total.toLocaleString()}원</p>
				</div>
			</div>
			<button
				onClick={onSave}
				disabled={!canSave}
				className="w-full rounded-lg bg-[#0073ea] py-3 font-semibold text-white transition-colors hover:bg-[#0060c2] disabled:cursor-not-allowed disabled:opacity-40"
			>
				거래 저장
			</button>
		</footer>
	);
}
