import { type ReactElement, useMemo, useState } from "react";
import { useSales } from "../../contexts/SaleContext";
import { formatCurrency } from "../../utils/format";

// 정렬 관련 타입
type SalesSortKey = "date" | "customer" | "staff" | "total" | "status";
type SortDirection = "asc" | "desc";

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

// 시술별 색상 설정
const serviceColorConfig: Record<string, { bg: string; text: string }> = {
	// 커트 계열 - 파란색
	여자커트: { bg: "bg-blue-100", text: "text-blue-700" },
	남자커트: { bg: "bg-blue-100", text: "text-blue-700" },
	// 펌 계열 - 보라색
	디지털펌: { bg: "bg-purple-100", text: "text-purple-700" },
	매직: { bg: "bg-purple-100", text: "text-purple-700" },
	남자펌: { bg: "bg-purple-100", text: "text-purple-700" },
	// 염색 계열 - 핑크색
	전체염색: { bg: "bg-pink-100", text: "text-pink-700" },
	뿌리염색: { bg: "bg-pink-100", text: "text-pink-700" },
	// 케어 계열 - 초록색
	클리닉: { bg: "bg-emerald-100", text: "text-emerald-700" },
	두피케어: { bg: "bg-emerald-100", text: "text-emerald-700" },
	// 스타일링 - 하늘색
	스타일링: { bg: "bg-sky-100", text: "text-sky-700" },
	// 충전 - 노란색
	"정액권 30만원": { bg: "bg-amber-100", text: "text-amber-700" },
};

// 제품 기본 색상 - 주황색
const productColor = { bg: "bg-orange-100", text: "text-orange-700" };
// 기본 색상 - 회색
const defaultColor = { bg: "bg-neutral-100", text: "text-neutral-600" };

const getServiceColor = (name: string, type: string): { bg: string; text: string } => {
	if (type === "product") return productColor;
	if (type === "topup") return { bg: "bg-amber-100", text: "text-amber-700" };
	return serviceColorConfig[name] ?? defaultColor;
};

// 이번 달 시작일 계산
function getMonthStartDate(): string {
	const today = new Date();
	return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
}

// 오늘 날짜
function getTodayDate(): string {
	return new Date().toISOString().split("T")[0];
}

export default function SalesListPage(): ReactElement {
	const { sales, voidSale, getSalesByDateRange } = useSales();
	const [startDate, setStartDate] = useState<string>(getMonthStartDate());
	const [endDate, setEndDate] = useState<string>(getTodayDate());
	const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
	const [sortKey, setSortKey] = useState<SalesSortKey>("date");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const filteredSales = getSalesByDateRange(startDate, endDate);

	// 정렬된 거래 목록
	const sortedSales = useMemo(() => {
		return [...filteredSales].sort((a, b) => {
			let comparison = 0;
			switch (sortKey) {
				case "date":
					comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
				case "customer":
					comparison = a.customer.name.localeCompare(b.customer.name, "ko");
					break;
				case "staff":
					comparison = a.staff.name.localeCompare(b.staff.name, "ko");
					break;
				case "total":
					comparison = a.total - b.total;
					break;
				case "status":
					comparison = a.status.localeCompare(b.status);
					break;
			}
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filteredSales, sortKey, sortDirection]);

	const handleSort = (key: SalesSortKey): void => {
		if (sortKey === key) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDirection("asc");
		}
	};

	const getSortIcon = (key: SalesSortKey): string => {
		if (sortKey !== key) return "unfold_more";
		return sortDirection === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
	};
	const selectedSale = selectedSaleId !== null ? sales.find((s) => s.id === selectedSaleId) : null;

	const totalAmount = filteredSales
		.filter((s) => s.status === "completed")
		.reduce((sum, s) => sum + s.total, 0);

	const handleVoid = (id: string): void => {
		if (confirm("이 거래를 취소하시겠습니까?")) {
			voidSale(id);
		}
	};

	const formatDateTime = (dateString: string): string => {
		const date = new Date(dateString);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		return `${String(month)}/${String(day)} ${hours}:${minutes}`;
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
						<span className="text-sm text-neutral-600">시작</span>
						<input
							type="date"
							value={startDate}
							onChange={(e) => {
								setStartDate(e.target.value);
							}}
							aria-label="시작 날짜"
							className="focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:outline-none"
						/>
					</label>
					<span className="text-neutral-400">~</span>
					<label className="flex items-center gap-2">
						<span className="text-sm text-neutral-600">종료</span>
						<input
							type="date"
							value={endDate}
							onChange={(e) => {
								setEndDate(e.target.value);
							}}
							aria-label="종료 날짜"
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
							<th
								onClick={() => {
									handleSort("date");
								}}
								className="cursor-pointer px-4 py-3 text-left text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center gap-1">
									날짜/시간
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("date")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("customer");
								}}
								className="cursor-pointer px-4 py-3 text-left text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center gap-1">
									고객
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("customer")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("staff");
								}}
								className="cursor-pointer px-4 py-3 text-left text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center gap-1">
									담당
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("staff")}
									</span>
								</div>
							</th>
							<th className="px-4 py-3 text-left text-sm font-bold text-neutral-600">항목</th>
							<th
								onClick={() => {
									handleSort("total");
								}}
								className="cursor-pointer px-4 py-3 text-right text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center justify-end gap-1">
									금액
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("total")}
									</span>
								</div>
							</th>
							<th
								onClick={() => {
									handleSort("status");
								}}
								className="cursor-pointer px-4 py-3 text-center text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								<div className="flex items-center justify-center gap-1">
									상태
									<span className="material-symbols-outlined text-base text-neutral-400">
										{getSortIcon("status")}
									</span>
								</div>
							</th>
							<th className="px-4 py-3 text-center text-sm font-bold text-neutral-600">관리</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-100">
						{sortedSales.map((sale) => (
							<tr
								key={sale.id}
								onClick={() => {
									setSelectedSaleId(sale.id);
								}}
								className={`cursor-pointer transition-colors hover:bg-neutral-50 ${
									sale.status === "voided" ? "opacity-60" : ""
								}`}
							>
								<td className="px-4 py-3 text-neutral-600">{formatDateTime(sale.createdAt)}</td>
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
										{sale.items.slice(0, 3).map((item, idx) => {
											const color = getServiceColor(item.name, item.type);
											return (
												<span
													key={idx}
													className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}
												>
													{item.name}
													{item.quantity > 1 && ` x${String(item.quantity)}`}
												</span>
											);
										})}
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
