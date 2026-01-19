import type { ReactElement } from "react";
import type { DiscountType } from "./types";

interface DiscountSectionProps {
	discountType: DiscountType;
	discountValue: number;
	discountAmount: number;
	onTypeChange: (type: DiscountType) => void;
	onValueChange: (value: number) => void;
}

export function DiscountSection({
	discountType,
	discountValue,
	discountAmount,
	onTypeChange,
	onValueChange,
}: DiscountSectionProps): ReactElement {
	return (
		<div className="border-t border-neutral-200 px-6 py-4">
			<h3 className="mb-3 text-sm font-bold text-neutral-700">할인</h3>
			<div className="flex items-center gap-3">
				<div className="flex rounded-lg bg-neutral-100 p-1">
					<button
						onClick={() => {
							onTypeChange("percent");
						}}
						className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
							discountType === "percent"
								? "bg-white text-neutral-800 shadow-sm"
								: "text-neutral-500"
						}`}
					>
						%
					</button>
					<button
						onClick={() => {
							onTypeChange("amount");
						}}
						className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
							discountType === "amount" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500"
						}`}
					>
						원
					</button>
				</div>
				<input
					type="number"
					value={discountValue || ""}
					onChange={(e) => {
						onValueChange(Number(e.target.value));
					}}
					placeholder="0"
					className="w-24 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-right text-sm focus:border-[#0073ea] focus:outline-none"
				/>
				{discountAmount > 0 && (
					<span className="text-sm font-medium text-[#e2445c]">
						-{discountAmount.toLocaleString()}원
					</span>
				)}
			</div>
		</div>
	);
}
