import type { ReactElement } from "react";
import { useState } from "react";
import { type Customer, useCustomers } from "../../contexts/CustomerContext";
import { useMarketingTable } from "../../hooks/useMarketingTable";
import { copyPhoneNumbers, downloadCSV } from "../../utils/exportCustomers";
import CampaignModal from "./CampaignModal";
import MarketingDashboard from "./MarketingDashboard";
import MarketingTable from "./MarketingTable";
import SegmentTabs from "./SegmentTabs";

interface ConvertedCustomer {
	id: number;
	name: string;
	phone: string;
	status: "active" | "inactive";
	first_visit_at: string | undefined;
	created_at: string;
	updated_at: string;
	visitDates: string[];
	storedValueBalance: number | undefined;
	storedValueInitial: number | undefined;
	birth_date: string | undefined;
}

// CustomerContext의 Customer를 훅에서 사용할 수 있는 형태로 변환
function convertCustomer(customer: Customer): ConvertedCustomer {
	// 방문 날짜 배열 생성 (lastVisitDate가 있으면 그것만 포함)
	const visitDates: string[] = [];
	if (customer.lastVisitDate !== undefined && customer.lastVisitDate !== "") {
		visitDates.push(customer.lastVisitDate);
	}
	// firstVisitDate가 있고 lastVisitDate와 다르면 추가
	if (
		customer.firstVisitDate !== undefined &&
		customer.firstVisitDate !== "" &&
		customer.firstVisitDate !== customer.lastVisitDate
	) {
		visitDates.push(customer.firstVisitDate);
	}

	return {
		id: Number(customer.id),
		name: customer.name,
		phone: customer.phone,
		status: customer.status,
		first_visit_at: customer.firstVisitDate,
		created_at: customer.createdAt,
		updated_at: customer.createdAt,
		visitDates,
		storedValueBalance: customer.storedValue,
		storedValueInitial: customer.storedValueInitial,
		birth_date: customer.birthDate,
	};
}

export default function MarketingPage(): ReactElement {
	const { customers } = useCustomers();
	const [noteModalOpen, setNoteModalOpen] = useState(false);
	const [noteTargetId, setNoteTargetId] = useState<number | null>(null);
	const [noteText, setNoteText] = useState("");
	const [campaignModalOpen, setCampaignModalOpen] = useState(false);

	// 고객 데이터 변환
	const convertedCustomers = customers.map(convertCustomer);

	const {
		selectedSegment,
		selectedIds,
		filteredCustomers,
		counts,
		setSelectedSegment,
		toggleSelect,
		toggleSelectAll,
		markContacted,
		addNote,
		clearSelection,
	} = useMarketingTable(convertedCustomers);

	const handleAddNote = (id: number): void => {
		setNoteTargetId(id);
		setNoteText("");
		setNoteModalOpen(true);
	};

	const handleSaveNote = (): void => {
		if (noteTargetId !== null && noteText.trim()) {
			addNote(noteTargetId, noteText.trim());
		}
		setNoteModalOpen(false);
		setNoteTargetId(null);
		setNoteText("");
	};

	const handleBulkContact = (): void => {
		for (const id of selectedIds) {
			markContacted(id);
		}
		clearSelection();
	};

	const handleCopyPhones = (): void => {
		const selectedCustomers = filteredCustomers.filter((c) => selectedIds.has(c.id));
		const targetCustomers = selectedCustomers.length > 0 ? selectedCustomers : filteredCustomers;
		void copyPhoneNumbers(targetCustomers);
	};

	const handleDownloadCSV = (): void => {
		const selectedCustomers = filteredCustomers.filter((c) => selectedIds.has(c.id));
		const targetCustomers = selectedCustomers.length > 0 ? selectedCustomers : filteredCustomers;
		const dateStr = new Date().toISOString().split("T")[0] ?? "export";
		const filename = `marketing_${selectedSegment}_${dateStr}.csv`;
		downloadCSV(targetCustomers, filename);
	};

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">마케팅 관리</h1>
					<p className="mt-1 text-neutral-500">세그먼트별 타겟 마케팅을 진행합니다</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={handleCopyPhones}
						className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
					>
						<span className="material-symbols-outlined">content_copy</span>
						전화번호 복사
					</button>
					<button
						onClick={handleDownloadCSV}
						className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
					>
						<span className="material-symbols-outlined">download</span>
						CSV 다운로드
					</button>
					<button
						onClick={() => {
							setCampaignModalOpen(true);
						}}
						className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
					>
						<span className="material-symbols-outlined">campaign</span>
						캠페인 발송
					</button>
					<button
						disabled={selectedIds.size === 0}
						onClick={handleBulkContact}
						className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span className="material-symbols-outlined">check_circle</span>
						연락 완료 ({selectedIds.size})
					</button>
				</div>
			</div>

			{/* Dashboard */}
			<div className="mb-6">
				<MarketingDashboard counts={counts} />
			</div>

			{/* Segment Tabs */}
			<div className="mb-6">
				<SegmentTabs
					selectedSegment={selectedSegment}
					onSelectSegment={setSelectedSegment}
					counts={counts}
				/>
			</div>

			{/* Customer Table */}
			<MarketingTable
				customers={filteredCustomers}
				selectedIds={selectedIds}
				onToggleSelect={toggleSelect}
				onToggleSelectAll={toggleSelectAll}
				onMarkContacted={markContacted}
				onAddNote={handleAddNote}
			/>

			{/* Campaign Modal */}
			<CampaignModal
				isOpen={campaignModalOpen}
				onClose={() => {
					setCampaignModalOpen(false);
				}}
				customers={
					selectedIds.size > 0
						? filteredCustomers.filter((c) => selectedIds.has(c.id))
						: filteredCustomers
				}
				segment={selectedSegment}
			/>

			{/* Note Modal */}
			{noteModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
						<h3 className="mb-4 text-lg font-bold text-neutral-800">메모 추가</h3>
						<textarea
							value={noteText}
							onChange={(e) => {
								setNoteText(e.target.value);
							}}
							placeholder="마케팅 활동 메모를 입력하세요..."
							className="focus:ring-primary-500 mb-4 h-32 w-full resize-none rounded-lg border border-neutral-200 p-3 focus:ring-2 focus:outline-none"
						/>
						<div className="flex justify-end gap-2">
							<button
								onClick={() => {
									setNoteModalOpen(false);
								}}
								className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
							>
								취소
							</button>
							<button
								onClick={handleSaveNote}
								className="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
							>
								저장
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
