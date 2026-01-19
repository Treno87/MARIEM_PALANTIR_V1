import { useState } from "react";
import { useStaff } from "../../contexts/StaffContext";
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

const statusConfig: Record<SaleStatus, { label: string; color: string; bgColor: string }> = {
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

const customerTypeConfig: Record<CustomerType, { label: string; color: string; bgColor: string }> =
	{
		new: { label: "신규", color: "text-green-700", bgColor: "bg-green-100" },
		returning: { label: "재방", color: "text-pink-700", bgColor: "bg-pink-100" },
		substitute: {
			label: "대체",
			color: "text-orange-700",
			bgColor: "bg-orange-100",
		},
	};

export default function SalesPage() {
	const { salesStaff } = useStaff();
	const [sales, setSales] = useState<SaleRecord[]>(mockSales);
	const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// 필터 상태
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [staffFilter, setStaffFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState<SaleStatus | "">("");
	const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerType | "">("");

	// 필터링된 거래 목록
	const filteredSales = sales.filter((sale) => {
		if (startDate && sale.saleDate < startDate) return false;
		if (endDate && sale.saleDate > endDate) return false;
		if (staffFilter && sale.staff.id !== staffFilter) return false;
		if (statusFilter && sale.status !== statusFilter) return false;
		if (customerTypeFilter && sale.customer.type !== customerTypeFilter) return false;
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
					sale.id === saleId ? { ...sale, status: "voided" as SaleStatus } : sale,
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
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">거래 내역</h1>
					<p className="mt-1 text-neutral-500">완료된 거래를 조회하고 관리합니다</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rounded-2xl border border-neutral-200 bg-white p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
							<span className="material-symbols-outlined text-blue-600">receipt_long</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">총 거래 건수</p>
							<p className="text-2xl font-bold text-neutral-800">{totalCount}건</p>
						</div>
					</div>
				</div>
				<div className="rounded-2xl border border-neutral-200 bg-white p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
							<span className="material-symbols-outlined text-green-600">payments</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">총 매출액</p>
							<p className="text-2xl font-bold text-neutral-800">
								{totalAmount.toLocaleString()}원
							</p>
						</div>
					</div>
				</div>
				<div className="rounded-2xl border border-neutral-200 bg-white p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
							<span className="material-symbols-outlined text-purple-600">trending_up</span>
						</div>
						<div>
							<p className="text-sm text-neutral-500">평균 객단가</p>
							<p className="text-2xl font-bold text-neutral-800">
								{totalCount > 0 ? Math.round(totalAmount / totalCount).toLocaleString() : 0}원
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
				<div className="flex flex-wrap items-center gap-4">
					{/* 기간 선택 */}
					<div className="flex items-center gap-2">
						<input
							type="date"
							value={startDate}
							onChange={(e) => {
								setStartDate(e.target.value);
							}}
							className="focus:ring-primary-500 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
						/>
						<span className="text-neutral-400">~</span>
						<input
							type="date"
							value={endDate}
							onChange={(e) => {
								setEndDate(e.target.value);
							}}
							className="focus:ring-primary-500 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
						/>
					</div>

					{/* 상태 드롭다운 */}
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value as SaleStatus | "");
						}}
						className="focus:ring-primary-500 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
					>
						<option value="">상태</option>
						<option value="completed">완료</option>
						<option value="voided">취소</option>
						<option value="refunded">환불</option>
					</select>

					{/* 고객구분 드롭다운 */}
					<select
						value={customerTypeFilter}
						onChange={(e) => {
							setCustomerTypeFilter(e.target.value as CustomerType | "");
						}}
						className="focus:ring-primary-500 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
							onClick={() => {
								setStaffFilter("");
							}}
							className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
								staffFilter === ""
									? "bg-neutral-800 text-white"
									: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
							}`}
						>
							전체
						</button>
						{salesStaff.map((staff) => (
							<button
								key={staff.id}
								onClick={() => {
									setStaffFilter(staff.id);
								}}
								className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
									staffFilter === staff.id
										? "text-white"
										: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
								}`}
								style={staffFilter === staff.id ? { backgroundColor: staff.color } : undefined}
							>
								<span
									className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
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
							className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
						>
							<span className="material-symbols-outlined text-base">close</span>
							초기화
						</button>
					)}
				</div>
			</div>

			{/* Sales Table */}
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-neutral-200 bg-neutral-50">
								<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">거래일</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">고객</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">
									고객구분
								</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">담당자</th>
								<th className="px-6 py-4 text-left text-sm font-bold text-neutral-600">항목</th>
								<th className="px-6 py-4 text-right text-sm font-bold text-neutral-600">금액</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">상태</th>
								<th className="px-6 py-4 text-center text-sm font-bold text-neutral-600">상세</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100">
							{filteredSales.map((sale) => (
								<tr
									key={sale.id}
									className={`transition-colors hover:bg-neutral-50 ${
										sale.status === "voided" ? "opacity-60" : ""
									}`}
								>
									<td className="px-6 py-4">
										<div>
											<p className="font-medium text-neutral-800">{formatDate(sale.saleDate)}</p>
											<p className="text-sm text-neutral-500">{formatTime(sale.createdAt)}</p>
										</div>
									</td>
									<td className="px-6 py-4">
										<div>
											<p className="font-medium text-neutral-800">{sale.customer.name}</p>
											<p className="text-sm text-neutral-500">{sale.customer.phone}</p>
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										<span
											className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${customerTypeConfig[sale.customer.type].bgColor} ${customerTypeConfig[sale.customer.type].color}`}
										>
											{customerTypeConfig[sale.customer.type].label}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<span
												className="h-3 w-3 rounded-full"
												style={{ backgroundColor: sale.staff.color }}
											/>
											<span className="font-medium text-neutral-800">{sale.staff.name}</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-sm text-neutral-600">
											{sale.items.length === 1 ? (
												(sale.items[0]?.name ?? "-")
											) : (
												<>
													{sale.items[0]?.name ?? "-"}
													<span className="text-neutral-400"> 외 {sale.items.length - 1}건</span>
												</>
											)}
										</div>
									</td>
									<td className="px-6 py-4 text-right">
										<div>
											<p className="font-bold text-neutral-800">{sale.total.toLocaleString()}원</p>
											{sale.discountAmount > 0 && (
												<p className="text-sm text-red-500">
													-{sale.discountAmount.toLocaleString()}원
												</p>
											)}
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										<span
											className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
												statusConfig[sale.status].bgColor
											} ${statusConfig[sale.status].color}`}
										>
											{statusConfig[sale.status].label}
										</span>
									</td>
									<td className="px-6 py-4 text-center">
										<button
											onClick={() => {
												openDetail(sale);
											}}
											className="hover:text-primary-500 hover:bg-primary-50 rounded-lg p-2 text-neutral-400 transition-colors"
										>
											<span className="material-symbols-outlined">visibility</span>
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{filteredSales.length === 0 && (
					<div className="p-12 text-center">
						<span className="material-symbols-outlined mb-4 text-5xl text-neutral-300">
							receipt_long
						</span>
						<p className="text-neutral-400">거래 내역이 없습니다</p>
					</div>
				)}
			</div>

			{/* Detail Modal */}
			{isDetailOpen && selectedSale && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white">
						{/* Header */}
						<div className="flex items-center justify-between border-b border-neutral-200 p-6">
							<div>
								<h2 className="text-xl font-bold text-neutral-800">거래 상세</h2>
								<p className="mt-1 text-sm text-neutral-500">
									{formatDate(selectedSale.saleDate)} {formatTime(selectedSale.createdAt)}
								</p>
							</div>
							<span
								className={`rounded-full px-3 py-1.5 text-sm font-bold ${
									statusConfig[selectedSale.status].bgColor
								} ${statusConfig[selectedSale.status].color}`}
							>
								{statusConfig[selectedSale.status].label}
							</span>
						</div>

						{/* Content */}
						<div className="flex-1 space-y-6 overflow-y-auto p-6">
							{/* Customer & Staff */}
							<div className="grid grid-cols-2 gap-4">
								<div className="rounded-xl bg-neutral-50 p-4">
									<p className="mb-1 text-sm text-neutral-500">고객</p>
									<p className="font-bold text-neutral-800">{selectedSale.customer.name}</p>
									<p className="text-sm text-neutral-500">{selectedSale.customer.phone}</p>
								</div>
								<div className="rounded-xl bg-neutral-50 p-4">
									<p className="mb-1 text-sm text-neutral-500">담당자</p>
									<div className="flex items-center gap-2">
										<span
											className="h-4 w-4 rounded-full"
											style={{ backgroundColor: selectedSale.staff.color }}
										/>
										<span className="font-bold text-neutral-800">{selectedSale.staff.name}</span>
									</div>
								</div>
							</div>

							{/* Items */}
							<div>
								<h3 className="mb-3 font-bold text-neutral-800">거래 항목</h3>
								<div className="overflow-hidden rounded-xl bg-neutral-50">
									<table className="w-full">
										<thead>
											<tr className="border-b border-neutral-200">
												<th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
													항목
												</th>
												<th className="px-4 py-3 text-center text-sm font-medium text-neutral-600">
													수량
												</th>
												<th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">
													단가
												</th>
												<th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">
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
																className={`rounded px-1.5 py-0.5 text-xs ${
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
													<td className="px-4 py-3 text-center">{item.quantity}</td>
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
							<div className="rounded-xl bg-neutral-50 p-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-neutral-500">소계</span>
										<span>{selectedSale.subtotal.toLocaleString()}원</span>
									</div>
									{selectedSale.discountAmount > 0 && (
										<div className="flex justify-between text-sm text-red-500">
											<span>할인</span>
											<span>-{selectedSale.discountAmount.toLocaleString()}원</span>
										</div>
									)}
									<div className="flex justify-between border-t border-neutral-200 pt-2 text-lg font-bold">
										<span>총 결제금액</span>
										<span className="text-primary-500">
											{selectedSale.total.toLocaleString()}원
										</span>
									</div>
								</div>
							</div>

							{/* Payments */}
							<div>
								<h3 className="mb-3 font-bold text-neutral-800">결제 내역</h3>
								<div className="space-y-2">
									{selectedSale.payments.map((payment, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3"
										>
											<span className="font-medium">{payment.method}</span>
											<span className="font-bold">{payment.amount.toLocaleString()}원</span>
										</div>
									))}
								</div>
							</div>

							{/* Note */}
							{selectedSale.note && (
								<div>
									<h3 className="mb-2 font-bold text-neutral-800">메모</h3>
									<p className="rounded-xl bg-neutral-50 px-4 py-3 text-neutral-600">
										{selectedSale.note}
									</p>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 p-6">
							<button
								onClick={closeDetail}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								닫기
							</button>
							{selectedSale.status === "completed" && (
								<button
									onClick={() => {
										handleVoid(selectedSale.id);
									}}
									className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white transition-colors hover:bg-red-600"
								>
									<span className="material-symbols-outlined text-lg">cancel</span>
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
