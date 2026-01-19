import { useState } from "react";
import { mockDesigners } from "../sale/constants";
import type { CustomerType, SaleRecord, SaleStatus } from "../sale/types";

// Mock 거래 데이터
const mockSales: SaleRecord[] = [
	{
		id: "sale-001",
		saleDate: "2026-01-19",
		customer: {
			id: "1",
			name: "김민지",
			phone: "010-1234-5678",
			type: "returning",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "여자커트",
				quantity: 1,
				unitPrice: 30000,
				lineTotal: 30000,
				type: "service",
			},
			{
				name: "뉴트리티브 샴푸",
				quantity: 1,
				unitPrice: 42000,
				lineTotal: 42000,
				type: "product",
			},
		],
		subtotal: 72000,
		discountAmount: 7200,
		total: 64800,
		payments: [{ method: "카드", amount: 64800 }],
		status: "completed",
		createdAt: "2026-01-19T10:30:00",
	},
	{
		id: "sale-002",
		saleDate: "2026-01-19",
		customer: { id: "2", name: "이서연", phone: "010-2345-6789", type: "new" },
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "디지털펌",
				quantity: 1,
				unitPrice: 130000,
				lineTotal: 130000,
				type: "service",
			},
		],
		subtotal: 130000,
		discountAmount: 0,
		total: 130000,
		payments: [
			{ method: "카드", amount: 100000 },
			{ method: "현금", amount: 30000 },
		],
		status: "completed",
		createdAt: "2026-01-19T14:15:00",
	},
	{
		id: "sale-003",
		saleDate: "2026-01-18",
		customer: {
			id: "3",
			name: "박지우",
			phone: "010-3456-7890",
			type: "substitute",
		},
		staff: { id: "1", name: "김정희", color: "#00c875" },
		items: [
			{
				name: "남자커트",
				quantity: 1,
				unitPrice: 25000,
				lineTotal: 25000,
				type: "service",
			},
		],
		subtotal: 25000,
		discountAmount: 0,
		total: 25000,
		payments: [{ method: "정기권", amount: 25000 }],
		status: "completed",
		note: "정기권 3회 사용",
		createdAt: "2026-01-18T11:00:00",
	},
	{
		id: "sale-004",
		saleDate: "2026-01-18",
		customer: { id: "4", name: "최유나", phone: "010-4567-8901", type: "new" },
		staff: { id: "3", name: "이하늘", color: "#a25ddc" },
		items: [
			{
				name: "전체염색",
				quantity: 1,
				unitPrice: 80000,
				lineTotal: 80000,
				type: "service",
			},
			{
				name: "모발클리닉",
				quantity: 1,
				unitPrice: 40000,
				lineTotal: 40000,
				type: "service",
			},
		],
		subtotal: 120000,
		discountAmount: 12000,
		total: 108000,
		payments: [{ method: "카드", amount: 108000 }],
		status: "voided",
		note: "고객 요청으로 취소",
		createdAt: "2026-01-18T16:30:00",
	},
	{
		id: "sale-005",
		saleDate: "2026-01-17",
		customer: {
			id: "5",
			name: "정수현",
			phone: "010-5678-9012",
			type: "returning",
		},
		staff: { id: "2", name: "박수민", color: "#fdab3d" },
		items: [
			{
				name: "정액권 30만원",
				quantity: 1,
				unitPrice: 300000,
				lineTotal: 300000,
				type: "topup",
			},
		],
		subtotal: 300000,
		discountAmount: 0,
		total: 300000,
		payments: [{ method: "계좌이체", amount: 300000 }],
		status: "completed",
		createdAt: "2026-01-17T09:45:00",
	},
];

const statusConfig: Record<
	SaleStatus,
	{ label: string; color: string; bgColor: string }
> = {
	completed: {
		label: "완료",
		color: "text-green-700",
		bgColor: "bg-green-100",
	},
	voided: { label: "취소", color: "text-red-700", bgColor: "bg-red-100" },
	refunded: {
		label: "환불",
		color: "text-orange-700",
		bgColor: "bg-orange-100",
	},
};

const customerTypeConfig: Record<
	CustomerType,
	{ label: string; color: string; bgColor: string }
> = {
	new: { label: "신규", color: "text-green-700", bgColor: "bg-green-100" },
	returning: { label: "재방", color: "text-pink-700", bgColor: "bg-pink-100" },
	substitute: {
		label: "대체",
		color: "text-orange-700",
		bgColor: "bg-orange-100",
	},
};

export default function SalesPage() {
	const [sales, setSales] = useState<SaleRecord[]>(mockSales);
	const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// 필터 상태
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [staffFilter, setStaffFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState<SaleStatus | "">("");
	const [customerTypeFilter, setCustomerTypeFilter] = useState<
		CustomerType | ""
	>("");

	// 필터링된 거래 목록
	const filteredSales = sales.filter((sale) => {
		if (startDate && sale.saleDate < startDate) return false;
		if (endDate && sale.saleDate > endDate) return false;
		if (staffFilter && sale.staff.id !== staffFilter) return false;
		if (statusFilter && sale.status !== statusFilter) return false;
		if (customerTypeFilter && sale.customer.type !== customerTypeFilter)
			return false;
		return true;
	});

	// 합계 계산
	const completedSales = filteredSales.filter((s) => s.status === "completed");
	const totalAmount = completedSales.reduce((sum, s) => sum + s.total, 0);
	const totalCount = completedSales.length;

	const openDetail = (sale: SaleRecord) => {
		setSelectedSale(sale);
		setIsDetailOpen(true);
	};

	const closeDetail = () => {
		setIsDetailOpen(false);
		setSelectedSale(null);
	};

	const handleVoid = (saleId: string) => {
		if (confirm("이 거래를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
			setSales((prev) =>
				prev.map((sale) =>
					sale.id === saleId
						? { ...sale, status: "voided" as SaleStatus }
						: sale,
				),
			);
			closeDetail();
		}
	};

	const clearFilters = () => {
		setStartDate("");
		setEndDate("");
		setStaffFilter("");
		setStatusFilter("");
		setCustomerTypeFilter("");
	};

	const hasActiveFilters =
		startDate || endDate || staffFilter || statusFilter || customerTypeFilter;

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleTimeString("ko-KR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="flex-1 p-8 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">거래 내역</h1>
					<p className="text-neutral-500 mt-1">
						완료된 거래를 조회하고 관리합니다
					</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div className="bg-white rounded-2xl border border-neutral-200 p-6">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
							<span className="material-symbols-outlined text-blue-600">
								receipt_long
							</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">총 거래 건수</p>
							<p className="text-2xl font-bold text-neutral-800">
								{totalCount}건
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-neutral-200 p-6">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
							<span className="material-symbols-outlined text-green-600">
								payments
							</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">총 매출액</p>
							<p className="text-2xl font-bold text-neutral-800">
								{totalAmount.toLocaleString()}원
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-neutral-200 p-6">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
							<span className="material-symbols-outlined text-purple-600">
								trending_up
							</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">평균 객단가</p>
							<p className="text-2xl font-bold text-neutral-800">
								{totalCount > 0
									? Math.round(totalAmount / totalCount).toLocaleString()
									: 0}
								원
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-6">
				<div className="flex flex-wrap items-center gap-4">
					{/* 기간 선택 */}
					<div className="flex items-center gap-2">
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
						<span className="text-neutral-400">~</span>
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>

					{/* 상태 드롭다운 */}
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as SaleStatus | "")}
						className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					>
						<option value="">상태</option>
						<option value="completed">완료</option>
						<option value="voided">취소</option>
						<option value="refunded">환불</option>
					</select>

					{/* 고객구분 드롭다운 */}
					<select
						value={customerTypeFilter}
						onChange={(e) =>
							setCustomerTypeFilter(e.target.value as CustomerType | "")
						}
						className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
					>
						<option value="">고객구분</option>
						<option value="new">신규</option>
						<option value="returning">재방</option>
						<option value="substitute">대체</option>
					</select>

					{/* 구분선 */}
					<div className="h-6 w-px bg-neutral-200" />

					{/* 담당자 버튼 */}
					<div className="flex items-center gap-2">
						<button
							onClick={() => setStaffFilter("")}
							className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
								staffFilter === ""
									? "bg-neutral-800 text-white"
									: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
							}`}
						>
							전체
						</button>
						{mockDesigners.map((staff) => (
							<button
								key={staff.id}
								onClick={() => setStaffFilter(staff.id)}
								className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
									staffFilter === staff.id
										? "text-white"
										: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
								}`}
								style={
									staffFilter === staff.id
										? { backgroundColor: staff.color }
										: undefined
								}
							>
								<span
									className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
									style={{ backgroundColor: staff.color }}
								>
									{staff.name.charAt(0)}
								</span>
								{staff.name}
							</button>
						))}
					</div>

					{/* 필터 초기화 */}
					{hasActiveFilters && (
						<button
							onClick={clearFilters}
							className="ml-auto px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1"
						>
							<span className="material-symbols-outlined text-base">close</span>
							초기화
						</button>
					)}
				</div>
			</div>

			{/* Sales Table */}
			<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-neutral-50 border-b border-neutral-200">
								<th className="text-left px-6 py-4 text-sm font-bold text-neutral-600">
									거래일
								</th>
								<th className="text-left px-6 py-4 text-sm font-bold text-neutral-600">
									고객
								</th>
								<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
									고객구분
								</th>
								<th className="text-left px-6 py-4 text-sm font-bold text-neutral-600">
									담당자
								</th>
								<th className="text-left px-6 py-4 text-sm font-bold text-neutral-600">
									항목
								</th>
								<th className="text-right px-6 py-4 text-sm font-bold text-neutral-600">
									금액
								</th>
								<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
									상태
								</th>
								<th className="text-center px-6 py-4 text-sm font-bold text-neutral-600">
									상세
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100">
							{filteredSales.map((sale) => (
								<tr
									key={sale.id}
									className={`hover:bg-neutral-50 transition-colors ${
										sale.status === "voided" ? "opacity-60" : ""
									}`}
								>
									<td className="px-6 py-4">
										<div>
											<p className="font-medium text-neutral-800">
												{formatDate(sale.saleDate)}
											</p>
											<p className="text-sm text-neutral-500">
												{formatTime(sale.createdAt)}
											</p>
										</div>
									</td>
									<td className="px-6 py-4">
										<div>
											<p className="font-medium text-neutral-800">
												{sale.customer.name}
											</p>
											<p className="text-sm text-neutral-500">
												{sale.customer.phone}
											</p>
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										<span
											className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${customerTypeConfig[sale.customer.type].bgColor} ${customerTypeConfig[sale.customer.type].color}`}
										>
											{customerTypeConfig[sale.customer.type].label}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<span
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: sale.staff.color }}
											/>
											<span className="font-medium text-neutral-800">
												{sale.staff.name}
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-sm text-neutral-600">
											{sale.items.length === 1 ? (
												(sale.items[0]?.name ?? "-")
											) : (
												<>
													{sale.items[0]?.name ?? "-"}
													<span className="text-neutral-400">
														{" "}
														외 {sale.items.length - 1}건
													</span>
												</>
											)}
										</div>
									</td>
									<td className="px-6 py-4 text-right">
										<div>
											<p className="font-bold text-neutral-800">
												{sale.total.toLocaleString()}원
											</p>
											{sale.discountAmount > 0 && (
												<p className="text-sm text-red-500">
													-{sale.discountAmount.toLocaleString()}원
												</p>
											)}
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										<span
											className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
												statusConfig[sale.status].bgColor
											} ${statusConfig[sale.status].color}`}
										>
											{statusConfig[sale.status].label}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<button
											onClick={() => openDetail(sale)}
											className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
										>
											<span className="material-symbols-outlined">
												visibility
											</span>
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{filteredSales.length === 0 && (
					<div className="p-12 text-center">
						<span className="material-symbols-outlined text-5xl text-neutral-300 mb-4">
							receipt_long
						</span>
						<p className="text-neutral-400">거래 내역이 없습니다</p>
					</div>
				)}
			</div>

			{/* Detail Modal */}
			{isDetailOpen && selectedSale && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
						{/* Header */}
						<div className="p-6 border-b border-neutral-200 flex items-center justify-between">
							<div>
								<h2 className="text-xl font-bold text-neutral-800">
									거래 상세
								</h2>
								<p className="text-sm text-neutral-500 mt-1">
									{formatDate(selectedSale.saleDate)}{" "}
									{formatTime(selectedSale.createdAt)}
								</p>
							</div>
							<span
								className={`px-3 py-1.5 rounded-full text-sm font-bold ${
									statusConfig[selectedSale.status].bgColor
								} ${statusConfig[selectedSale.status].color}`}
							>
								{statusConfig[selectedSale.status].label}
							</span>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto p-6 space-y-6">
							{/* Customer & Staff */}
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-neutral-50 rounded-xl p-4">
									<p className="text-sm text-neutral-500 mb-1">고객</p>
									<p className="font-bold text-neutral-800">
										{selectedSale.customer.name}
									</p>
									<p className="text-sm text-neutral-500">
										{selectedSale.customer.phone}
									</p>
								</div>
								<div className="bg-neutral-50 rounded-xl p-4">
									<p className="text-sm text-neutral-500 mb-1">담당자</p>
									<div className="flex items-center gap-2">
										<span
											className="w-4 h-4 rounded-full"
											style={{ backgroundColor: selectedSale.staff.color }}
										/>
										<span className="font-bold text-neutral-800">
											{selectedSale.staff.name}
										</span>
									</div>
								</div>
							</div>

							{/* Items */}
							<div>
								<h3 className="font-bold text-neutral-800 mb-3">거래 항목</h3>
								<div className="bg-neutral-50 rounded-xl overflow-hidden">
									<table className="w-full">
										<thead>
											<tr className="border-b border-neutral-200">
												<th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
													항목
												</th>
												<th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
													수량
												</th>
												<th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
													단가
												</th>
												<th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
													금액
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-neutral-200">
											{selectedSale.items.map((item, idx) => (
												<tr key={idx}>
													<td className="px-4 py-3">
														<div className="flex items-center gap-2">
															<span
																className={`px-1.5 py-0.5 text-xs rounded ${
																	item.type === "service"
																		? "bg-blue-100 text-blue-700"
																		: item.type === "product"
																			? "bg-green-100 text-green-700"
																			: "bg-purple-100 text-purple-700"
																}`}
															>
																{item.type === "service"
																	? "시술"
																	: item.type === "product"
																		? "상품"
																		: "충전"}
															</span>
															<span className="font-medium">{item.name}</span>
														</div>
													</td>
													<td className="px-4 py-3 text-center">
														{item.quantity}
													</td>
													<td className="px-4 py-3 text-right">
														{item.unitPrice.toLocaleString()}원
													</td>
													<td className="px-4 py-3 text-right font-medium">
														{item.lineTotal.toLocaleString()}원
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Summary */}
							<div className="bg-neutral-50 rounded-xl p-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-neutral-500">소계</span>
										<span>{selectedSale.subtotal.toLocaleString()}원</span>
									</div>
									{selectedSale.discountAmount > 0 && (
										<div className="flex justify-between text-sm text-red-500">
											<span>할인</span>
											<span>
												-{selectedSale.discountAmount.toLocaleString()}원
											</span>
										</div>
									)}
									<div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200">
										<span>총 결제금액</span>
										<span className="text-primary-500">
											{selectedSale.total.toLocaleString()}원
										</span>
									</div>
								</div>
							</div>

							{/* Payments */}
							<div>
								<h3 className="font-bold text-neutral-800 mb-3">결제 내역</h3>
								<div className="space-y-2">
									{selectedSale.payments.map((payment, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3"
										>
											<span className="font-medium">{payment.method}</span>
											<span className="font-bold">
												{payment.amount.toLocaleString()}원
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Note */}
							{selectedSale.note && (
								<div>
									<h3 className="font-bold text-neutral-800 mb-2">메모</h3>
									<p className="text-neutral-600 bg-neutral-50 rounded-xl px-4 py-3">
										{selectedSale.note}
									</p>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-3 justify-end">
							<button
								onClick={closeDetail}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								닫기
							</button>
							{selectedSale.status === "completed" && (
								<button
									onClick={() => handleVoid(selectedSale.id)}
									className="px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
								>
									<span className="material-symbols-outlined text-lg">
										cancel
									</span>
									거래 취소
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
