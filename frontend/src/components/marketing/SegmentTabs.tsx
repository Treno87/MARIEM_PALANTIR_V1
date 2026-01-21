import type { ReactElement } from "react";
import { SEGMENT_INFO, type SegmentCounts, type SegmentType } from "../../types/marketing";

interface SegmentTabsProps {
	selectedSegment: SegmentType;
	onSelectSegment: (segment: SegmentType) => void;
	counts: SegmentCounts;
}

const tabOrder: SegmentType[] = [
	"all",
	"churn_risk",
	"birthday_upcoming",
	"low_balance",
	"new_unsettled",
	"vip_declining",
];

export default function SegmentTabs({
	selectedSegment,
	onSelectSegment,
	counts,
}: SegmentTabsProps): ReactElement {
	return (
		<div className="flex flex-wrap gap-2">
			{tabOrder.map((segmentType) => {
				const info = SEGMENT_INFO[segmentType];
				const count = counts[segmentType];
				const isSelected = selectedSegment === segmentType;

				return (
					<button
						key={segmentType}
						onClick={() => {
							onSelectSegment(segmentType);
						}}
						className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
							isSelected
								? "bg-primary-500 text-white"
								: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
						}`}
					>
						<span className="material-symbols-outlined text-lg">{info.icon}</span>
						<span>{info.label}</span>
						<span
							className={`rounded-full px-2 py-0.5 text-xs font-bold ${
								isSelected ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
							}`}
						>
							{count}
						</span>
					</button>
				);
			})}
		</div>
	);
}
