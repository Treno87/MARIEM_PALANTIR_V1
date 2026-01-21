import type { ReactElement } from "react";
import { useEffect } from "react";
import { useAIMessageGenerator } from "../../hooks/useAIMessageGenerator";
import type {
	CustomerWithSegments,
	MessageLength,
	MessageTone,
	SegmentType,
} from "../../types/marketing";

interface AIMessageGeneratorProps {
	customer: CustomerWithSegments | null;
	segment: SegmentType;
	onMessageGenerated?: (message: string) => void;
}

const TONE_OPTIONS: {
	value: MessageTone;
	label: string;
	description: string;
}[] = [
	{ value: "formal", label: "격식체", description: "정중하고 공식적인 톤" },
	{ value: "friendly", label: "친근함", description: "따뜻하고 친근한 톤" },
	{ value: "casual", label: "캐주얼", description: "편안하고 가벼운 톤" },
];

const LENGTH_OPTIONS: {
	value: MessageLength;
	label: string;
	description: string;
}[] = [
	{ value: "short", label: "짧게", description: "핵심만 간단히" },
	{ value: "medium", label: "보통", description: "적당한 길이" },
	{ value: "long", label: "길게", description: "자세한 설명 포함" },
];

export default function AIMessageGenerator({
	customer,
	segment,
	onMessageGenerated,
}: AIMessageGeneratorProps): ReactElement {
	const {
		isGenerating,
		generatedMessage,
		error,
		tone,
		length,
		includePromotion,
		setTone,
		setLength,
		setIncludePromotion,
		generateMessage,
		regenerate,
		clearMessage,
	} = useAIMessageGenerator();

	// 메시지가 생성되면 콜백 호출
	useEffect(() => {
		if (generatedMessage !== "" && onMessageGenerated !== undefined) {
			onMessageGenerated(generatedMessage);
		}
	}, [generatedMessage, onMessageGenerated]);

	const handleGenerate = (): void => {
		if (customer === null) return;

		generateMessage(
			{
				name: customer.name,
				daysSinceLastVisit: customer.daysSinceLastVisit,
				storedValueBalance: customer.storedValueBalance,
				birthdayDaysLeft: customer.birthdayDaysLeft,
			},
			segment,
		);
	};

	const handleCopyMessage = async (): Promise<void> => {
		if (generatedMessage !== "") {
			await navigator.clipboard.writeText(generatedMessage);
		}
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center gap-2">
				<span className="material-symbols-outlined text-primary-500">auto_awesome</span>
				<h4 className="font-bold text-neutral-800">AI 메시지 생성</h4>
				{customer !== null && (
					<span className="text-sm text-neutral-500">- {customer.name}님 대상</span>
				)}
			</div>

			{/* Options */}
			<div className="grid grid-cols-3 gap-4">
				{/* Tone Selection */}
				<div>
					<label className="mb-1.5 block text-xs font-medium text-neutral-600">톤</label>
					<div className="flex flex-col gap-1">
						{TONE_OPTIONS.map((option) => (
							<button
								key={option.value}
								onClick={() => {
									setTone(option.value);
								}}
								className={`rounded-lg border px-3 py-1.5 text-left text-xs transition-colors ${
									tone === option.value
										? "border-primary-500 bg-primary-50 text-primary-700"
										: "border-neutral-200 text-neutral-600 hover:border-neutral-300"
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				{/* Length Selection */}
				<div>
					<label className="mb-1.5 block text-xs font-medium text-neutral-600">길이</label>
					<div className="flex flex-col gap-1">
						{LENGTH_OPTIONS.map((option) => (
							<button
								key={option.value}
								onClick={() => {
									setLength(option.value);
								}}
								className={`rounded-lg border px-3 py-1.5 text-left text-xs transition-colors ${
									length === option.value
										? "border-primary-500 bg-primary-50 text-primary-700"
										: "border-neutral-200 text-neutral-600 hover:border-neutral-300"
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				{/* Promotion Toggle */}
				<div>
					<label className="mb-1.5 block text-xs font-medium text-neutral-600">옵션</label>
					<button
						onClick={() => {
							setIncludePromotion(!includePromotion);
						}}
						className={`flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition-colors ${
							includePromotion
								? "border-primary-500 bg-primary-50 text-primary-700"
								: "border-neutral-200 text-neutral-600 hover:border-neutral-300"
						}`}
					>
						<span className="material-symbols-outlined text-base">
							{includePromotion ? "check_box" : "check_box_outline_blank"}
						</span>
						프로모션 포함
					</button>
				</div>
			</div>

			{/* Generate Button */}
			<div className="flex items-center gap-2">
				<button
					onClick={handleGenerate}
					disabled={customer === null || isGenerating}
					className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isGenerating ? (
						<>
							<span className="material-symbols-outlined animate-spin text-lg">
								progress_activity
							</span>
							생성 중...
						</>
					) : (
						<>
							<span className="material-symbols-outlined text-lg">auto_awesome</span>
							AI 메시지 생성
						</>
					)}
				</button>

				{generatedMessage !== "" && (
					<button
						onClick={regenerate}
						disabled={isGenerating}
						className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span className="material-symbols-outlined text-lg">refresh</span>
						다시 생성
					</button>
				)}
			</div>

			{/* Error */}
			{error !== null && (
				<div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
					<span className="material-symbols-outlined">error</span>
					{error}
				</div>
			)}

			{/* Generated Message Preview */}
			{generatedMessage !== "" && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label className="text-xs font-medium text-neutral-600">생성된 메시지</label>
						<div className="flex items-center gap-2">
							<button
								onClick={() => {
									void handleCopyMessage();
								}}
								className="text-primary-500 hover:text-primary-600 flex items-center gap-1 text-xs font-medium"
							>
								<span className="material-symbols-outlined text-sm">content_copy</span>
								복사
							</button>
							<button
								onClick={clearMessage}
								className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-600"
							>
								<span className="material-symbols-outlined text-sm">close</span>
								지우기
							</button>
						</div>
					</div>
					<div className="rounded-lg bg-neutral-100 p-4">
						<p className="text-sm whitespace-pre-wrap text-neutral-700">{generatedMessage}</p>
					</div>
					<p className="text-xs text-neutral-400">
						* AI가 생성한 메시지입니다. 필요에 따라 수정해서 사용하세요.
					</p>
				</div>
			)}

			{/* Empty State */}
			{customer === null && (
				<div className="flex items-center justify-center rounded-lg border border-dashed border-neutral-300 py-8 text-neutral-400">
					<div className="text-center">
						<span className="material-symbols-outlined mb-2 text-3xl">person_search</span>
						<p className="text-sm">고객을 선택하면 AI 메시지를 생성할 수 있습니다</p>
					</div>
				</div>
			)}
		</div>
	);
}
