import { useState } from "react";
import type { Customer } from "../../contexts/CustomerContext";
import { getCustomerTier, getDaysSinceLastVisit, tierConfig } from "../../contexts/CustomerContext";
import { type CustomerStats, useSales } from "../../contexts/SaleContext";
import type { SaleRecord } from "../sale/types";

interface CustomerDetailModalProps {
	customer: Customer;
	onClose: () => void;
}

type TabType = "info" | "history" | "analysis";

const statusConfig = {
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
} as const;

export default function CustomerDetailModal({ customer, onClose }: CustomerDetailModalProps) {
	const [activeTab, setActiveTab] = useState<TabType>("info");
	const { getSalesByCustomerId, getCustomerStats } = useSales();

	const sales = getSalesByCustomerId(customer.id);
	const stats = getCustomerStats(customer.id);
	const tier = getCustomerTier(customer.totalSpent);
	const tierInfo = tierConfig[tier];

	const formatDate = (dateStr: string): string => {
		return new Date(dateStr).toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatCurrency = (amount: number): string => {
		return `${amount.toLocaleString()}원`;
	};

	const daysSinceLastVisit = getDaysSinceLastVisit(customer.lastVisitDate);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-neutral-200 p-6">
					<div className="flex items-center gap-4">
						<div className="bg-primary-100 text-primary-600 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold">
							{customer.initials}
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h2 className="text-xl font-bold text-neutral-800">{customer.name}</h2>
								<span
									className={`rounded-full px-2.5 py-1 text-xs font-bold ${tierInfo.bgColor} ${tierInfo.color}`}
								>
									{tierInfo.label}
								</span>
							</div>
							<p className="mt-1 text-neutral-500">{customer.phone}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-neutral-200">
					<button
						onClick={() => {
							setActiveTab("info");
						}}
						className={`flex-1 py-3 text-sm font-bold transition-colors ${
							activeTab === "info"
								? "border-primary-500 text-primary-600 border-b-2"
								: "text-neutral-500 hover:text-neutral-700"
						}`}
					>
						기본정보
					</button>
					<button
						onClick={() => {
							setActiveTab("history");
						}}
						className={`flex-1 py-3 text-sm font-bold transition-colors ${
							activeTab === "history"
								? "border-primary-500 text-primary-600 border-b-2"
								: "text-neutral-500 hover:text-neutral-700"
						}`}
					>
						방문이력 ({sales.length})
					</button>
					<button
						onClick={() => {
							setActiveTab("analysis");
						}}
						className={`flex-1 py-3 text-sm font-bold transition-colors ${
							activeTab === "analysis"
								? "border-primary-500 text-primary-600 border-b-2"
								: "text-neutral-500 hover:text-neutral-700"
						}`}
					>
						분석
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{activeTab === "info" && (
						<InfoTab customer={customer} stats={stats} daysSinceLastVisit={daysSinceLastVisit} />
					)}
					{activeTab === "history" && (
						<HistoryTab sales={sales} formatDate={formatDate} formatCurrency={formatCurrency} />
					)}
					{activeTab === "analysis" && (
						<AnalysisTab stats={stats} formatCurrency={formatCurrency} />
					)}
				</div>

				{/* Footer */}
				<div className="flex justify-end border-t border-neutral-200 bg-neutral-50 p-4">
					<button
						onClick={onClose}
						className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
					>
						닫기
					</button>
				</div>
			</div>
		</div>
	);
}

// 기본정보 탭
function InfoTab({
	customer,
	stats,
	daysSinceLastVisit,
}: {
	customer: Customer;
	stats: CustomerStats;
	daysSinceLastVisit: number | null;
}) {
	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-4 gap-4">
				<div className="rounded-xl bg-blue-50 p-4 text-center">
					<p className="text-sm text-blue-600">총 결제액</p>
					<p className="mt-1 text-xl font-bold text-blue-700">
						{customer.totalSpent.toLocaleString()}원
					</p>
				</div>
				<div className="rounded-xl bg-green-50 p-4 text-center">
					<p className="text-sm text-green-600">평균 객단가</p>
					<p className="mt-1 text-xl font-bold text-green-700">
						{stats.avgSpentPerVisit.toLocaleString()}원
					</p>
				</div>
				<div className="rounded-xl bg-purple-50 p-4 text-center">
					<p className="text-sm text-purple-600">방문 횟수</p>
					<p className="mt-1 text-xl font-bold text-purple-700">{customer.visitCount}회</p>
				</div>
				<div className="rounded-xl bg-orange-50 p-4 text-center">
					<p className="text-sm text-orange-600">마지막 방문</p>
					<p className="mt-1 text-xl font-bold text-orange-700">
						{daysSinceLastVisit !== null ? `${String(daysSinceLastVisit)}일 전` : "-"}
					</p>
				</div>
			</div>

			{/* Customer Details */}
			<div className="rounded-xl border border-neutral-200 p-4">
				<h3 className="mb-4 font-bold text-neutral-800">고객 정보</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-neutral-500">전화번호</p>
						<p className="font-medium text-neutral-800">{customer.phone}</p>
					</div>
					<div>
						<p className="text-sm text-neutral-500">성별</p>
						<p className="font-medium text-neutral-800">
							{customer.gender === "male" ? "남성" : customer.gender === "female" ? "여성" : "-"}
						</p>
					</div>
					<div>
						<p className="text-sm text-neutral-500">생년월일</p>
						<p className="font-medium text-neutral-800">
							{customer.birthDate ? new Date(customer.birthDate).toLocaleDateString("ko-KR") : "-"}
						</p>
					</div>
					<div>
						<p className="text-sm text-neutral-500">첫 방문일</p>
						<p className="font-medium text-neutral-800">
							{customer.firstVisitDate
								? new Date(customer.firstVisitDate).toLocaleDateString("ko-KR")
								: "-"}
						</p>
					</div>
				</div>
			</div>

			{/* Stored Value & Membership */}
			<div className="grid grid-cols-2 gap-4">
				<div className="rounded-xl border border-neutral-200 p-4">
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-orange-500">
							account_balance_wallet
						</span>
						<h3 className="font-bold text-neutral-800">정액권 잔액</h3>
					</div>
					<p className="mt-2 text-2xl font-bold text-orange-600">
						{customer.storedValue ? `${customer.storedValue.toLocaleString()}원` : "-"}
					</p>
				</div>
				<div className="rounded-xl border border-neutral-200 p-4">
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-purple-500">card_membership</span>
						<h3 className="font-bold text-neutral-800">정기권</h3>
					</div>
					{customer.membership ? (
						<div className="mt-2">
							<p className="font-medium text-neutral-800">{customer.membership.name}</p>
							<p className="text-sm text-neutral-500">
								잔여 {customer.membership.total - customer.membership.used}/
								{customer.membership.total}회
							</p>
						</div>
					) : (
						<p className="mt-2 text-neutral-400">-</p>
					)}
				</div>
			</div>

			{/* Memo */}
			{customer.memo && (
				<div className="rounded-xl border border-neutral-200 p-4">
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-neutral-500">note</span>
						<h3 className="font-bold text-neutral-800">메모</h3>
					</div>
					<p className="mt-2 text-neutral-600">{customer.memo}</p>
				</div>
			)}
		</div>
	);
}

// 방문이력 탭
function HistoryTab({
	sales,
	formatDate,
	formatCurrency,
}: {
	sales: SaleRecord[];
	formatDate: (dateStr: string) => string;
	formatCurrency: (amount: number) => string;
}) {
	if (sales.length === 0) {
		return (
			<div className="py-16 text-center">
				<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">
					receipt_long
				</span>
				<p className="text-neutral-400">방문 이력이 없습니다</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{sales.map((sale) => (
				<div
					key={sale.id}
					className={`rounded-xl border border-neutral-200 p-4 ${
						sale.status === "voided" ? "opacity-60" : ""
					}`}
				>
					<div className="flex items-start justify-between">
						<div>
							<div className="flex items-center gap-2">
								<p className="font-medium text-neutral-800">{formatDate(sale.saleDate)}</p>
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-bold ${
										statusConfig[sale.status].bgColor
									} ${statusConfig[sale.status].color}`}
								>
									{statusConfig[sale.status].label}
								</span>
							</div>
							<div className="mt-2 flex flex-wrap gap-2">
								{sale.items.map((item, idx) => (
									<span
										key={idx}
										className={`rounded-full px-2.5 py-1 text-xs font-medium ${
											item.type === "service"
												? "bg-blue-100 text-blue-700"
												: item.type === "product"
													? "bg-green-100 text-green-700"
													: "bg-purple-100 text-purple-700"
										}`}
									>
										{item.name}
										{item.quantity > 1 && ` x${String(item.quantity)}`}
									</span>
								))}
							</div>
						</div>
						<div className="text-right">
							<p className="text-lg font-bold text-neutral-800">{formatCurrency(sale.total)}</p>
							{sale.discountAmount > 0 && (
								<p className="text-sm text-red-500">-{formatCurrency(sale.discountAmount)}</p>
							)}
							<div className="mt-1 flex flex-wrap justify-end gap-1">
								{sale.payments.map((payment, idx) => (
									<span
										key={idx}
										className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600"
									>
										{payment.method}
									</span>
								))}
							</div>
						</div>
					</div>
					{sale.note && <p className="mt-2 text-sm text-neutral-500">{sale.note}</p>}
					<div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
						<span className="h-3 w-3 rounded-full" style={{ backgroundColor: sale.staff.color }} />
						{sale.staff.name}
					</div>
				</div>
			))}
		</div>
	);
}

// 분석 탭
function AnalysisTab({
	stats,
	formatCurrency,
}: {
	stats: CustomerStats;
	formatCurrency: (amount: number) => string;
}) {
	const totalServiceCount = stats.topServices.reduce((sum, s) => sum + s.count, 0);

	return (
		<div className="space-y-6">
			{/* Key Metrics */}
			<div className="grid grid-cols-3 gap-4">
				<div className="rounded-xl bg-neutral-50 p-4 text-center">
					<p className="text-sm text-neutral-500">총 결제액</p>
					<p className="mt-1 text-xl font-bold text-neutral-800">
						{formatCurrency(stats.totalSpent)}
					</p>
				</div>
				<div className="rounded-xl bg-neutral-50 p-4 text-center">
					<p className="text-sm text-neutral-500">평균 객단가</p>
					<p className="mt-1 text-xl font-bold text-neutral-800">
						{formatCurrency(stats.avgSpentPerVisit)}
					</p>
				</div>
				<div className="rounded-xl bg-neutral-50 p-4 text-center">
					<p className="text-sm text-neutral-500">선호 결제수단</p>
					<p className="mt-1 text-xl font-bold text-neutral-800">
						{stats.preferredPaymentMethod ?? "-"}
					</p>
				</div>
			</div>

			{/* Top Services */}
			<div className="rounded-xl border border-neutral-200 p-4">
				<h3 className="mb-4 font-bold text-neutral-800">주요 이용 서비스</h3>
				{stats.topServices.length === 0 ? (
					<p className="text-neutral-400">이용 내역이 없습니다</p>
				) : (
					<div className="space-y-3">
						{stats.topServices.map((service, idx) => {
							const percentage =
								totalServiceCount > 0 ? Math.round((service.count / totalServiceCount) * 100) : 0;
							return (
								<div key={idx}>
									<div className="mb-1 flex items-center justify-between">
										<span className="font-medium text-neutral-700">{service.name}</span>
										<span className="text-sm text-neutral-500">
											{service.count}회 ({percentage}%)
										</span>
									</div>
									<div className="h-2 overflow-hidden rounded-full bg-neutral-100">
										<div
											className="bg-primary-500 h-full rounded-full transition-all"
											style={{ width: `${String(percentage)}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Visit Period */}
			<div className="rounded-xl border border-neutral-200 p-4">
				<h3 className="mb-4 font-bold text-neutral-800">방문 기간</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-neutral-500">첫 방문</p>
						<p className="font-medium text-neutral-800">
							{stats.firstVisitDate
								? new Date(stats.firstVisitDate).toLocaleDateString("ko-KR")
								: "-"}
						</p>
					</div>
					<div>
						<p className="text-sm text-neutral-500">마지막 방문</p>
						<p className="font-medium text-neutral-800">
							{stats.lastVisitDate
								? new Date(stats.lastVisitDate).toLocaleDateString("ko-KR")
								: "-"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
