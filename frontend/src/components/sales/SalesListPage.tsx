import { type ReactElement, useState } from "react";
import { useSales } from "../../contexts/SaleContext";

const statusConfig = {
	completed: {
		label: "완료",
		bgColor: "bg-green-100",
		textColor: "text-green-700",
	},
	voided: { label: "취소", bgColor: "bg-red-100", textColor: "text-red-700" },
	refunded: {
		label: "환불",
		bgColor: "bg-orange-100",
		textColor: "text-orange-700",
	},
} as const;

export default function SalesListPage(): ReactElement {
	const { sales, voidSale, getSalesByDate } = useSales();
	const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
	const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

	const filteredSales = getSalesByDate(selectedDate);
	const selectedSale = selectedSaleId !== null ? sales.find((s) => s.id === selectedSaleId) : null;

	const totalAmount = filteredSales
		.filter((s) => s.status === "completed")
		.reduce((sum, s) => sum + s.total, 0);

	const handleVoid = (id: string): void => {
		if (confirm("이 거래를 취소하시겠습니까?")) {
			voidSale(id);
		}
	};

	const formatTime = (dateString: string): string => {
		return new Date(dateString).toLocaleTimeString("ko-KR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatCurrency = (amount: number): string => {
		return amount.toLocaleString() + "원";
	};

	const getInitials = (name: string): string => {
		return name.slice(0, 2);
	};

	return (
		<div className="flex h-full flex-col bg-neutral-50 p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-neutral-800">거래 내역</h1>
				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2">
						<span className="text-sm text-neutral-600">날짜</span>
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => {
								setSelectedDate(e.target.value);
							}}
							aria-label="날짜"
							className="focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
						/>
					</label>
				</div>
			</div>

			{/* Summary */}
			<div className="mb-6 grid grid-cols-3 gap-4">
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">거래 건수</p>
					<p className="text-2xl font-bold text-neutral-800">{filteredSales.length}건</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">총 매출</p>
					<p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
				</div>
				<div className="rounded-xl border border-neutral-200 bg-white p-4">
					<p className="text-sm text-neutral-500">취소 건수</p>
					<p className="text-2xl font-bold text-red-600">
						{filteredSales.filter((s) => s.status === "voided").length}건
					</p>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white">
				<table className="w-full">
					<thead>
						<tr className="border-b border-neutral-200 bg-neutral-50">
							<th className="px-4 py-3 text-left text-sm font-bold text-neutral-600">시간</th>
							<th className="px-4 py-3 text-left text-sm font-bold text-neutral-600">고객</th>
							<th className="px-4 py-3 text-left text-sm font-bold text-neutral-600">담당</th>
							<th className="px-4 py-3 text-left text-sm font-bold text-neutral-600">항목</th>
							<th className="px-4 py-3 text-right text-sm font-bold text-neutral-600">금액</th>
							<th className="px-4 py-3 text-center text-sm font-bold text-neutral-600">상태</th>
							<th className="px-4 py-3 text-center text-sm font-bold text-neutral-600">관리</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{filteredSales.map((sale) => (
							<tr
								key={sale.id}
								onClick={() => {
									setSelectedSaleId(sale.id);
								}}
								className={`cursor-pointer transition-colors hover:bg-neutral-50 ${
									sale.status === "voided" ? "opacity-60" : ""
								}`}
							>
								<td className="px-4 py-3 text-neutral-600">{formatTime(sale.createdAt)}</td>
								<td className="px-4 py-3">
									<div className="flex items-center gap-2">
										<div
											className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
											style={{ backgroundColor: "#a25ddc" }}
										>
											{getInitials(sale.customer.name)}
										</div>
										<span className="font-medium text-neutral-800">{sale.customer.name}</span>
									</div>
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center gap-2">
										<span
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: sale.staff.color }}
										/>
										<span className="text-neutral-600">{sale.staff.name}</span>
									</div>
								</td>
								<td className="px-4 py-3">
									<div className="flex flex-wrap gap-1">
										{sale.items.slice(0, 3).map((item, idx) => (
											<span
												key={idx}
												className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
											>
												{item.name}
												{item.quantity > 1 && ` x${String(item.quantity)}`}
											</span>
										))}
										{sale.items.length > 3 && (
											<span className="text-xs text-neutral-400">+{sale.items.length - 3}</span>
										)}
									</div>
								</td>
								<td className="px-4 py-3 text-right font-medium text-neutral-800">
									{formatCurrency(sale.total)}
								</td>
								<td className="px-4 py-3 text-center">
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig[sale.status].bgColor} ${statusConfig[sale.status].textColor}`}
									>
										{statusConfig[sale.status].label}
									</span>
								</td>
								<td className="px-4 py-3 text-center">
									{sale.status === "completed" && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleVoid(sale.id);
											}}
											className="rounded-lg px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
										>
											취소
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{filteredSales.length === 0 && (
					<div className="py-16 text-center">
						<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">
							receipt_long
						</span>
						<p className="text-neutral-400">해당 날짜의 거래 내역이 없습니다</p>
					</div>
				)}
			</div>

			{/* Detail Modal */}
			{selectedSale !== null && selectedSale !== undefined && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white">
						<div className="flex items-center justify-between border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">거래 상세</h2>
							<button
								onClick={() => {
									setSelectedSaleId(null);
								}}
								className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="space-y-4 p-6">
							{/* 기본 정보 */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-neutral-500">날짜/시간</p>
									<p className="font-medium text-neutral-800">
										{new Date(selectedSale.createdAt).toLocaleString("ko-KR")}
									</p>
								</div>
								<div>
									<p className="text-sm text-neutral-500">담당</p>
									<p className="font-medium text-neutral-800">{selectedSale.staff.name}</p>
								</div>
								<div>
									<p className="text-sm text-neutral-500">고객</p>
									<p className="font-medium text-neutral-800">{selectedSale.customer.name}</p>
								</div>
								<div>
									<p className="text-sm text-neutral-500">상태</p>
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig[selectedSale.status].bgColor} ${statusConfig[selectedSale.status].textColor}`}
									>
										{statusConfig[selectedSale.status].label}
									</span>
								</div>
							</div>

							{/* 항목 */}
							<div>
								<p className="mb-2 text-sm font-bold text-neutral-700">항목</p>
								<div className="space-y-2">
									{selectedSale.items.map((item, idx) => (
										<div key={idx} className="flex justify-between text-sm">
											<span className="text-neutral-600">
												{item.name} x{item.quantity}
											</span>
											<span className="font-medium text-neutral-800">
												{formatCurrency(item.unitPrice * item.quantity)}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* 결제 내역 */}
							<div>
								<p className="mb-2 text-sm font-bold text-neutral-700">결제 내역</p>
								<div className="space-y-2">
									{selectedSale.payments.map((payment, idx) => (
										<div key={idx} className="flex justify-between text-sm">
											<span className="text-neutral-600">{payment.method}</span>
											<span className="font-medium text-neutral-800">
												{formatCurrency(payment.amount)}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* 합계 */}
							<div className="border-t border-neutral-200 pt-4">
								<div className="flex justify-between">
									<span className="font-bold text-neutral-800">총 결제금액</span>
									<span className="text-primary-600 text-xl font-bold">
										{formatCurrency(selectedSale.total)}
									</span>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 p-6">
							<button
								onClick={() => {
									setSelectedSaleId(null);
								}}
								className="rounded-xl px-5 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								닫기
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
