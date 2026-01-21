import type { ReactElement } from "react";
import {
	type CustomerWithSegments,
	type MarketingStatus,
	SEGMENT_INFO,
} from "../../types/marketing";

interface MarketingTableProps {
	customers: CustomerWithSegments[];
	selectedIds: Set<number>;
	onToggleSelect: (id: number) => void;
	onToggleSelectAll: () => void;
	onMarkContacted: (id: number) => void;
	onAddNote: (id: number) => void;
}

const statusConfig: Record<MarketingStatus, { label: string; bgColor: string; textColor: string }> =
	{
		pending: {
			label: "미연락",
			bgColor: "bg-yellow-100",
			textColor: "text-yellow-700",
		},
		contacted: {
			label: "연락완료",
			bgColor: "bg-green-100",
			textColor: "text-green-700",
		},
		ignored: {
			label: "무시",
			bgColor: "bg-neutral-200",
			textColor: "text-neutral-600",
		},
	};

export default function MarketingTable({
	customers,
	selectedIds,
	onToggleSelect,
	onToggleSelectAll,
	onMarkContacted,
	onAddNote,
}: MarketingTableProps): ReactElement {
	const allSelected = customers.length > 0 && selectedIds.size === customers.length;

	return (
		<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
			<table className="w-full">
				<thead>
					<tr className="border-b border-neutral-200 bg-neutral-50">
						<th className="px-4 py-4">
							<input
								type="checkbox"
								checked={allSelected}
								onChange={onToggleSelectAll}
								className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded"
							/>
						</th>
						<th className="px-4 py-4 text-left text-sm font-bold text-neutral-600">고객</th>
						<th className="px-4 py-4 text-left text-sm font-bold text-neutral-600">연락처</th>
						<th className="px-4 py-4 text-left text-sm font-bold text-neutral-600">세그먼트</th>
						<th className="px-4 py-4 text-center text-sm font-bold text-neutral-600">
							마지막 방문
						</th>
						<th className="px-4 py-4 text-center text-sm font-bold text-neutral-600">상태</th>
						<th className="px-4 py-4 text-center text-sm font-bold text-neutral-600">액션</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-neutral-100">
					{customers.map((customer) => (
						<tr
							key={customer.id}
							className={`transition-colors hover:bg-neutral-50 ${
								selectedIds.has(customer.id) ? "bg-primary-50" : ""
							}`}
						>
							<td className="px-4 py-4">
								<input
									type="checkbox"
									checked={selectedIds.has(customer.id)}
									onChange={() => {
										onToggleSelect(customer.id);
									}}
									className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded"
								/>
							</td>
							<td className="px-4 py-4">
								<div className="flex items-center gap-3">
									<div className="bg-primary-100 text-primary-600 flex h-10 w-10 items-center justify-center rounded-full font-bold">
										{customer.name.slice(0, 2)}
									</div>
									<div>
										<p className="font-medium text-neutral-800">{customer.name}</p>
										{customer.marketingNote && (
											<p className="mt-0.5 max-w-[200px] truncate text-xs text-neutral-400">
												{customer.marketingNote}
											</p>
										)}
									</div>
								</div>
							</td>
							<td className="px-4 py-4 text-neutral-600">{customer.phone}</td>
							<td className="px-4 py-4">
								<div className="flex flex-wrap gap-1">
									{customer.segments.map((segment) => {
										const info = SEGMENT_INFO[segment];
										return (
											<span
												key={segment}
												className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
												title={info.description}
											>
												<span className="material-symbols-outlined text-sm">{info.icon}</span>
												{info.label}
											</span>
										);
									})}
								</div>
							</td>
							<td className="px-4 py-4 text-center">
								{customer.daysSinceLastVisit !== undefined ? (
									<span
										className={`font-medium ${
											customer.daysSinceLastVisit > 90
												? "text-red-500"
												: customer.daysSinceLastVisit > 60
													? "text-orange-500"
													: "text-neutral-600"
										}`}
									>
										{customer.daysSinceLastVisit}일 전
									</span>
								) : (
									<span className="text-neutral-400">-</span>
								)}
							</td>
							<td className="px-4 py-4 text-center">
								<span
									className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig[customer.marketingStatus].bgColor} ${statusConfig[customer.marketingStatus].textColor}`}
								>
									{statusConfig[customer.marketingStatus].label}
								</span>
							</td>
							<td className="px-4 py-4">
								<div className="flex items-center justify-center gap-1">
									<button
										onClick={() => {
											onMarkContacted(customer.id);
										}}
										className={`rounded-lg p-2 transition-colors ${
											customer.marketingStatus === "contacted"
												? "text-green-500"
												: "text-neutral-400 hover:bg-green-50 hover:text-green-500"
										}`}
										title="연락 완료"
									>
										<span className="material-symbols-outlined text-xl">check_circle</span>
									</button>
									<button
										onClick={() => {
											onAddNote(customer.id);
										}}
										className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
										title="메모 추가"
									>
										<span className="material-symbols-outlined text-xl">edit_note</span>
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{customers.length === 0 && (
				<div className="py-16 text-center">
					<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">campaign</span>
					<p className="text-neutral-400">해당 세그먼트에 고객이 없습니다</p>
				</div>
			)}
		</div>
	);
}
