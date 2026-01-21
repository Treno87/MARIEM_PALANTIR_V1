import type { ReactElement } from "react";
import type { SegmentCounts } from "../../types/marketing";

interface MarketingDashboardProps {
	counts: SegmentCounts;
}

interface DashboardCard {
	label: string;
	value: number;
	icon: string;
	color: string;
	bgColor: string;
}

export default function MarketingDashboard({ counts }: MarketingDashboardProps): ReactElement {
	const cards: DashboardCard[] = [
		{
			label: "액션 필요",
			value: counts.action_needed,
			icon: "notifications_active",
			color: "text-red-600",
			bgColor: "bg-red-50",
		},
		{
			label: "휴면 위험",
			value: counts.churn_risk,
			icon: "warning",
			color: "text-orange-600",
			bgColor: "bg-orange-50",
		},
		{
			label: "생일 임박",
			value: counts.birthday_upcoming,
			icon: "cake",
			color: "text-pink-600",
			bgColor: "bg-pink-50",
		},
		{
			label: "정액권 부족",
			value: counts.low_balance,
			icon: "account_balance_wallet",
			color: "text-amber-600",
			bgColor: "bg-amber-50",
		},
	];

	return (
		<div className="grid grid-cols-4 gap-4">
			{cards.map((card) => (
				<div
					key={card.label}
					className={`rounded-xl border border-neutral-200 p-4 ${card.bgColor}`}
				>
					<div className="flex items-center gap-3">
						<span className={`material-symbols-outlined text-2xl ${card.color}`}>{card.icon}</span>
						<div>
							<p className="text-sm text-neutral-500">{card.label}</p>
							<p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
