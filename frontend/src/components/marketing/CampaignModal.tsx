import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import type { CustomerWithSegments, MessageTemplate, SegmentType } from "../../types/marketing";
import { copyPhoneNumbers, downloadCSV } from "../../utils/exportCustomers";
import AIMessageGenerator from "./AIMessageGenerator";
import { getTemplatesBySegment, replaceVariables } from "./MessageTemplates";

type MessageTab = "template" | "ai";

interface CampaignModalProps {
	isOpen: boolean;
	onClose: () => void;
	customers: CustomerWithSegments[];
	segment: SegmentType;
}

export default function CampaignModal({
	isOpen,
	onClose,
	customers,
	segment,
}: CampaignModalProps): ReactElement | null {
	const [activeTab, setActiveTab] = useState<MessageTab>("template");
	const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
	const [customMessage, setCustomMessage] = useState("");
	const [aiGeneratedMessage, setAiGeneratedMessage] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);
	const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(0);

	const templates = useMemo(() => getTemplatesBySegment(segment), [segment]);

	const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

	// 선택된 고객
	const selectedCustomer = customers.length > 0 ? customers[selectedCustomerIndex] : null;

	// 선택된 템플릿 또는 커스텀 메시지 미리보기
	const previewMessage = useMemo(() => {
		// AI 탭에서는 AI 생성 메시지 사용
		if (activeTab === "ai") {
			return aiGeneratedMessage;
		}

		if (customMessage !== "") {
			return customMessage;
		}
		if (selectedTemplate === undefined || customers.length === 0) {
			return "";
		}

		const firstCustomer = customers[0];
		const variables: Record<string, string> = {
			"{고객명}": firstCustomer.name,
			"{경과일}": String(firstCustomer.daysSinceLastVisit ?? 0),
			"{잔액}":
				firstCustomer.storedValueBalance !== undefined
					? firstCustomer.storedValueBalance.toLocaleString()
					: "0",
		};

		return replaceVariables(selectedTemplate.content, variables);
	}, [activeTab, aiGeneratedMessage, selectedTemplate, customMessage, customers]);

	const handleSelectTemplate = (template: MessageTemplate): void => {
		setSelectedTemplateId(template.id);
		setCustomMessage("");
	};

	const handleCopyPhones = (): void => {
		void copyPhoneNumbers(customers).then(() => {
			setCopySuccess(true);
			setTimeout(() => {
				setCopySuccess(false);
			}, 2000);
		});
	};

	const handleDownloadCSV = (): void => {
		const dateStr = new Date().toISOString().split("T")[0] ?? "export";
		downloadCSV(customers, `campaign_${segment}_${dateStr}.csv`);
	};

	const handleCopyMessage = (): void => {
		if (previewMessage !== "") {
			void navigator.clipboard.writeText(previewMessage).then(() => {
				setCopySuccess(true);
				setTimeout(() => {
					setCopySuccess(false);
				}, 2000);
			});
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h3 className="text-xl font-bold text-neutral-800">캠페인 발송 준비</h3>
						<p className="mt-1 text-sm text-neutral-500">{customers.length}명 대상 메시지 발송</p>
					</div>
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{/* Tab Navigation */}
				<div className="mb-6 flex gap-2 border-b border-neutral-200">
					<button
						onClick={() => {
							setActiveTab("template");
						}}
						className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === "template"
								? "border-primary-500 text-primary-600"
								: "border-transparent text-neutral-500 hover:text-neutral-700"
						}`}
					>
						<span className="material-symbols-outlined text-lg">description</span>
						템플릿 선택
					</button>
					<button
						onClick={() => {
							setActiveTab("ai");
						}}
						className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === "ai"
								? "border-primary-500 text-primary-600"
								: "border-transparent text-neutral-500 hover:text-neutral-700"
						}`}
					>
						<span className="material-symbols-outlined text-lg">auto_awesome</span>
						AI 생성
					</button>
				</div>

				{/* Template Tab Content */}
				{activeTab === "template" && (
					<>
						{/* Template Selection */}
						<div className="mb-6">
							<label className="mb-2 block text-sm font-bold text-neutral-700">
								메시지 템플릿 선택
							</label>
							<div className="grid grid-cols-2 gap-2">
								{templates.map((template) => (
									<button
										key={template.id}
										onClick={() => {
											handleSelectTemplate(template);
										}}
										className={`rounded-lg border p-3 text-left transition-colors ${
											selectedTemplateId === template.id
												? "border-primary-500 bg-primary-50"
												: "border-neutral-200 hover:border-neutral-300"
										}`}
									>
										<p className="text-sm font-medium text-neutral-800">{template.name}</p>
										<p className="mt-1 line-clamp-2 text-xs text-neutral-500">{template.content}</p>
									</button>
								))}
							</div>
						</div>

						{/* Custom Message */}
						<div className="mb-6">
							<label className="mb-2 block text-sm font-bold text-neutral-700">
								직접 메시지 작성 (선택)
							</label>
							<textarea
								value={customMessage}
								onChange={(e) => {
									setCustomMessage(e.target.value);
									setSelectedTemplateId("");
								}}
								placeholder="직접 메시지를 작성하세요. {고객명}, {경과일}, {잔액} 변수를 사용할 수 있습니다."
								className="focus:ring-primary-500 h-24 w-full resize-none rounded-lg border border-neutral-200 p-3 text-sm focus:ring-2 focus:outline-none"
							/>
						</div>
					</>
				)}

				{/* AI Tab Content */}
				{activeTab === "ai" && (
					<div className="mb-6">
						{/* Customer Selector for AI */}
						{customers.length > 1 && (
							<div className="mb-4">
								<label className="mb-2 block text-sm font-bold text-neutral-700">
									메시지 대상 고객 선택
								</label>
								<select
									value={selectedCustomerIndex}
									onChange={(e) => {
										setSelectedCustomerIndex(Number(e.target.value));
									}}
									className="focus:ring-primary-500 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
								>
									{customers.map((customer, index) => (
										<option key={customer.id} value={index}>
											{customer.name} ({customer.phone})
										</option>
									))}
								</select>
							</div>
						)}

						{/* AI Message Generator */}
						<AIMessageGenerator
							customer={selectedCustomer}
							segment={segment}
							onMessageGenerated={setAiGeneratedMessage}
						/>
					</div>
				)}

				{/* Preview */}
				{previewMessage !== "" && (
					<div className="mb-6">
						<div className="mb-2 flex items-center justify-between">
							<label className="block text-sm font-bold text-neutral-700">메시지 미리보기</label>
							<button
								onClick={handleCopyMessage}
								className="text-primary-500 hover:text-primary-600 text-xs font-medium"
							>
								{copySuccess ? "복사됨!" : "메시지 복사"}
							</button>
						</div>
						<div className="rounded-lg bg-neutral-100 p-4">
							<p className="text-sm whitespace-pre-wrap text-neutral-700">{previewMessage}</p>
						</div>
						<p className="mt-2 text-xs text-neutral-400">
							* 실제 발송 시 각 고객의 정보로 변수가 치환됩니다.
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center justify-between border-t border-neutral-200 pt-6">
					<div className="flex items-center gap-2">
						<button
							onClick={handleCopyPhones}
							className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
						>
							<span className="material-symbols-outlined text-lg">content_copy</span>
							전화번호 복사
						</button>
						<button
							onClick={handleDownloadCSV}
							className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
						>
							<span className="material-symbols-outlined text-lg">download</span>
							CSV 다운로드
						</button>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={onClose}
							className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
						>
							닫기
						</button>
						<button
							disabled={previewMessage === ""}
							className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
						>
							<span className="material-symbols-outlined text-lg">send</span>
							발송 준비 완료
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
