import type { ReactElement } from "react";
import {
	discountEvents,
	itemPaymentMethods,
	membershipOptions,
	productCategories,
	serviceCategories,
	storedValueOptions,
} from "./constants";
import type { CartItem, DiscountEvent, ItemPaymentMethod } from "./types";

interface CartTableProps {
	cart: CartItem[];
	displayedStoredValue: number;
	displayedMembershipRemaining: number;
	onUpdateQuantity: (id: string, delta: number) => void;
	onRemove: (id: string) => void;
	onUpdatePaymentMethod: (id: string, method: ItemPaymentMethod) => void;
	onUpdateEvent: (id: string, eventId: string | undefined) => void;
}

function getCategoryColor(itemId: string): string {
	if (storedValueOptions.find((i) => i.id === itemId)) return "#00c875";
	if (membershipOptions.find((i) => i.id === itemId)) return "#a25ddc";

	for (const cat of serviceCategories) {
		if (cat.items.find((i) => i.id === itemId)) return cat.color;
	}

	for (const cat of productCategories) {
		for (const brand of cat.brands) {
			if (brand.items.find((i) => i.id === itemId)) return cat.color;
		}
	}

	return "#6b7280";
}

function getApplicableEvents(itemId: string): DiscountEvent[] {
	return discountEvents.filter((event) => {
		if (!event.applicableTo) return true;
		return event.applicableTo.includes(itemId);
	});
}

export function CartTable({
	cart,
	displayedStoredValue,
	displayedMembershipRemaining,
	onUpdateQuantity,
	onRemove,
	onUpdatePaymentMethod,
	onUpdateEvent,
}: CartTableProps): ReactElement | null {
	if (cart.length === 0) return null;

	// 정액권/정기권 사용 금액 계산 (이미 선택된 항목들의 합계)
	const usedStoredValue = cart
		.filter((item) => item.paymentMethod === "stored_value")
		.reduce((sum, item) => sum + item.finalPrice, 0);

	const usedMembershipCount = cart.filter(
		(item) => item.paymentMethod === "membership",
	).length;

	// 잔여 가용 금액/회차
	const availableStoredValue = displayedStoredValue - usedStoredValue;
	const availableMembershipCount =
		displayedMembershipRemaining - usedMembershipCount;

	return (
		<div className="border-t border-neutral-200 px-6 py-4">
			<h3 className="mb-3 text-sm font-bold text-neutral-700">선택한 항목</h3>
			<div className="overflow-hidden rounded-lg bg-neutral-50">
				<table className="w-full table-fixed">
					<thead>
						<tr className="border-b border-neutral-200 text-left text-sm font-semibold text-neutral-600">
							<th className="w-[200px] px-4 py-3">항목</th>
							<th className="w-[250px] px-4 py-3">이벤트</th>
							<th className="px-4 py-3">결제수단</th>
							<th className="w-[90px] px-4 py-3 text-right">할인</th>
							<th className="w-[100px] px-4 py-3 text-right">금액</th>
							<th className="w-[40px] px-2 py-3"></th>
						</tr>
					</thead>
					<tbody>
						{cart.map((item, idx) => {
							const applicableEvents = getApplicableEvents(item.id);
							const isTopup = item.type === "topup";

							// 정액권 버튼 활성화 조건: 잔액이 있거나 이미 이 항목에서 사용 중
							const canUseStoredValue =
								!isTopup &&
								(availableStoredValue >= item.finalPrice ||
									item.paymentMethod === "stored_value");

							// 정기권 버튼 활성화 조건: 정기권 대상 항목 + 회차 남음 또는 이미 사용 중
							const canUseMembership =
								!isTopup &&
								item.membershipEligible === true &&
								(availableMembershipCount > 0 ||
									item.paymentMethod === "membership");

							return (
								<tr
									key={item.id}
									className={
										idx !== cart.length - 1 ? "border-b border-neutral-100" : ""
									}
								>
									{/* 항목명 + 수량 */}
									<td className="px-4 py-3">
										<div className="flex items-center gap-2">
											<div
												className="h-6 w-1 flex-shrink-0 rounded-full"
												style={{ backgroundColor: getCategoryColor(item.id) }}
											/>
											<span className="min-w-0 flex-1 truncate text-sm text-neutral-700">
												{item.name}
											</span>
											<div className="ml-3 flex flex-shrink-0 items-center gap-1">
												<button
													onClick={() => {
														onUpdateQuantity(item.id, -1);
													}}
													className="flex h-5 w-5 items-center justify-center rounded bg-neutral-200 text-xs text-neutral-600 hover:bg-neutral-300"
												>
													-
												</button>
												<span className="w-4 text-center text-xs font-medium">
													{item.quantity}
												</span>
												<button
													onClick={() => {
														onUpdateQuantity(item.id, 1);
													}}
													className="flex h-5 w-5 items-center justify-center rounded bg-neutral-200 text-xs text-neutral-600 hover:bg-neutral-300"
												>
													+
												</button>
											</div>
										</div>
									</td>

									{/* 이벤트 드롭다운 */}
									<td className="px-4 py-3">
										{isTopup ? (
											<span className="text-sm text-neutral-400">-</span>
										) : (
											<select
												value={item.eventId ?? ""}
												onChange={(e) => {
													onUpdateEvent(item.id, e.target.value || undefined);
												}}
												className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm focus:border-[#0073ea] focus:outline-none"
											>
												<option value="">없음</option>
												{applicableEvents.map((event) => (
													<option key={event.id} value={event.id}>
														{event.name}
													</option>
												))}
											</select>
										)}
									</td>

									{/* 결제수단 버튼 */}
									<td className="px-4 py-3">
										{isTopup ? (
											<span className="text-sm text-neutral-400">-</span>
										) : (
											<div className="flex flex-wrap gap-2">
												{itemPaymentMethods.map((method) => {
													const isSelected = item.paymentMethod === method.id;
													const isStoredValue = method.id === "stored_value";
													const isMembership = method.id === "membership";

													// 정액권/정기권은 조건부 표시 (early return)
													if (isStoredValue && displayedStoredValue <= 0)
														return null;
													if (isMembership && item.membershipEligible !== true)
														return null;
													if (isMembership && displayedMembershipRemaining <= 0)
														return null;

													const disabled =
														(isStoredValue && !canUseStoredValue) ||
														(isMembership && !canUseMembership);

													return (
														<button
															key={method.id}
															onClick={() => {
																onUpdatePaymentMethod(
																	item.id,
																	method.id as ItemPaymentMethod,
																);
															}}
															disabled={disabled}
															className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
																isSelected
																	? "text-white"
																	: "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
															} ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
															style={
																isSelected
																	? { backgroundColor: method.color }
																	: {}
															}
														>
															{method.label}
														</button>
													);
												})}
											</div>
										)}
									</td>

									{/* 할인액 */}
									<td className="px-4 py-3 text-right">
										{item.discountAmount > 0 ? (
											<span className="text-sm font-medium text-[#e2445c]">
												-{item.discountAmount.toLocaleString()}
											</span>
										) : (
											<span className="text-sm text-neutral-400">-</span>
										)}
									</td>

									{/* 최종 금액 */}
									<td className="px-4 py-3 text-right">
										{item.paymentMethod === "membership" ? (
											<span className="text-sm font-semibold text-[#e2445c]">
												1회
											</span>
										) : (
											<span className="text-sm font-semibold text-neutral-700">
												{item.finalPrice.toLocaleString()}원
											</span>
										)}
									</td>

									{/* 삭제 버튼 */}
									<td className="px-2 py-3">
										<button
											onClick={() => {
												onRemove(item.id);
											}}
											className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-red-50 hover:text-[#e2445c]"
										>
											<span className="material-symbols-outlined text-sm">
												close
											</span>
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
