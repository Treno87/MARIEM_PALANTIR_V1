import { useCallback, useRef, useState } from "react";
import type { MessageLength, MessageTone, SegmentType } from "../types/marketing";

interface CustomerInfo {
	name: string;
	daysSinceLastVisit?: number;
	lastService?: string;
	preferredServices?: string[];
	storedValueBalance?: number;
	birthdayDaysLeft?: number;
	visitCount?: number;
}

interface UseAIMessageGeneratorReturn {
	isGenerating: boolean;
	generatedMessage: string;
	error: string | null;
	tone: MessageTone;
	length: MessageLength;
	includePromotion: boolean;
	setTone: (tone: MessageTone) => void;
	setLength: (length: MessageLength) => void;
	setIncludePromotion: (include: boolean) => void;
	generateMessage: (customer: CustomerInfo, segment: SegmentType) => void;
	regenerate: () => void;
	clearMessage: () => void;
}

// 세그먼트별 메시지 템플릿
const SEGMENT_TEMPLATES: Record<
	SegmentType,
	{
		greetings: string[];
		bodies: string[];
		promotions: string[];
	}
> = {
	all: {
		greetings: ["{name}님, 안녕하세요!", "{name}님, 반갑습니다!", "안녕하세요, {name}님!"],
		bodies: ["항상 저희 매장을 이용해 주셔서 감사합니다.", "오늘도 좋은 하루 보내고 계신가요?"],
		promotions: ["방문 시 특별 혜택을 준비했습니다.", "이번 달 특별 이벤트가 진행 중입니다."],
	},
	churn_risk: {
		greetings: [
			"{name}님, 안녕하세요!",
			"{name}님, 오랜만에 인사드립니다!",
			"안녕하세요, {name}님! 잘 지내고 계신가요?",
		],
		bodies: [
			"마지막 방문 후 {days}일이 지났네요. 그동안 잘 지내셨나요?",
			"요즘 바쁘신가 봐요. 마지막 방문이 {days}일 전이네요.",
			"벌써 {days}일이나 됐네요. 오랜만에 뵙고 싶습니다.",
		],
		promotions: [
			"재방문 고객님께 20% 할인 혜택을 드립니다.",
			"오랜만에 방문하시면 특별 서비스를 준비해 드릴게요.",
			"이번 달 특별 이벤트로 헤드스파 무료 혜택을 드립니다!",
		],
	},
	birthday_upcoming: {
		greetings: [
			"{name}님, 생일을 진심으로 축하드립니다!",
			"곧 특별한 날이 다가오네요, {name}님!",
			"{name}님, 미리 생일 축하드려요!",
		],
		bodies: [
			"생일을 맞아 더욱 빛나는 모습으로 변신해보세요.",
			"특별한 날을 위해 새로운 스타일을 추천드려요.",
			"생일 기념 스페셜 케어로 자신에게 선물해보세요.",
		],
		promotions: [
			"생일 고객님께 30% 할인 쿠폰을 드립니다.",
			"생일 주간 방문 시 디저트 서비스와 함께 특별 혜택이 있어요.",
			"생일 기념 시술 예약 시 무료 헤어 에센스를 선물로 드립니다.",
		],
	},
	low_balance: {
		greetings: ["{name}님, 안녕하세요!", "안녕하세요, {name}님!", "{name}님, 반갑습니다!"],
		bodies: [
			"정액권 잔액이 {balance}원 남았습니다. 편하실 때 충전해 주세요.",
			"정액권 잔액 안내드려요. 현재 {balance}원 남아있습니다.",
			"잔액이 {balance}원 남았어요. 충전하시면 더 편하게 이용하실 수 있어요.",
		],
		promotions: [
			"지금 충전하시면 10% 추가 금액을 드립니다.",
			"이번 주 충전 시 보너스 포인트 2배 적립!",
			"30만원 이상 충전 시 15% 추가 혜택을 드려요.",
		],
	},
	new_unsettled: {
		greetings: [
			"{name}님, 첫 방문 감사했습니다!",
			"안녕하세요, {name}님! 지난번 방문은 만족스러우셨나요?",
			"{name}님, 다시 인사드려요!",
		],
		bodies: [
			"첫 만남이 좋은 인연이 되길 바랍니다. 두 번째 방문도 기다리고 있어요.",
			"저희 매장이 마음에 드셨다면 다시 찾아주세요.",
			"다음에도 더 좋은 서비스로 보답하겠습니다.",
		],
		promotions: [
			"두 번째 방문 시 15% 할인을 드립니다.",
			"재방문 고객님께 특별 서비스를 준비했어요.",
			"이번 달 내 재방문 시 추가 혜택이 있습니다.",
		],
	},
	vip_declining: {
		greetings: [
			"{name}님, 안녕하세요. 저희 소중한 VIP 고객님!",
			"안녕하세요, {name}님! 항상 감사드립니다.",
			"{name}님, 오랜 단골 고객님께 인사드립니다.",
		],
		bodies: [
			"요즘 바쁘신가 봐요. 저희가 항상 기다리고 있답니다.",
			"VIP 고객님을 위한 특별한 케어를 준비했어요.",
			"항상 저희를 찾아주셔서 감사합니다. 더 좋은 서비스로 보답하겠습니다.",
		],
		promotions: [
			"VIP 전용 프리미엄 케어 50% 특별 할인을 드립니다.",
			"VIP 고객님께만 드리는 스페셜 패키지가 있어요.",
			"이번 달 VIP 감사 이벤트로 무료 업그레이드를 제공합니다.",
		],
	},
};

// 톤별 변환
const TONE_MODIFIERS: Record<
	MessageTone,
	{
		endings: string[];
		emojis: boolean;
	}
> = {
	formal: {
		endings: ["드립니다.", "주세요.", "바랍니다.", "감사합니다."],
		emojis: false,
	},
	friendly: {
		endings: ["드려요.", "주세요.", "있어요.", "기다릴게요."],
		emojis: true,
	},
	casual: {
		endings: ["요!", "해요~", "있어요!", "기다릴게요~"],
		emojis: true,
	},
};

// 랜덤 요소 선택
function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)] as T;
}

// 메시지 생성 함수
function generateMessageContent(
	customer: CustomerInfo,
	segment: SegmentType,
	tone: MessageTone,
	length: MessageLength,
	includePromotion: boolean,
): string {
	const template = SEGMENT_TEMPLATES[segment];
	const toneConfig = TONE_MODIFIERS[tone];

	// 인사말
	let greeting = pickRandom(template.greetings);
	greeting = greeting.replace("{name}", customer.name);

	// 본문
	let body = pickRandom(template.bodies);
	body = body.replace("{name}", customer.name);
	if (customer.daysSinceLastVisit !== undefined) {
		body = body.replace("{days}", String(customer.daysSinceLastVisit));
	}
	if (customer.storedValueBalance !== undefined) {
		body = body.replace("{balance}", customer.storedValueBalance.toLocaleString());
	}

	// 프로모션
	let promotion = "";
	if (includePromotion) {
		promotion = " " + pickRandom(template.promotions);
	}

	// 마무리
	let closing = "";
	if (tone === "friendly" && toneConfig.emojis) {
		closing = " 😊";
	} else if (tone === "casual" && toneConfig.emojis) {
		closing = " 🌸";
	}

	// 길이에 따른 조정
	let message = "";
	switch (length) {
		case "short":
			// 인사 + 핵심만
			message = `${greeting} ${body.split(".")[0] ?? ""}.${closing}`;
			break;
		case "medium":
			// 인사 + 본문 + 프로모션
			message = `${greeting}\n\n${body}${promotion}${closing}`;
			break;
		case "long": {
			// 인사 + 본문 + 추가 내용 + 프로모션 + 마무리
			const additionalBody =
				segment === "churn_risk"
					? "\n\n요즘 트렌드에 맞는 새로운 스타일도 준비되어 있어요."
					: "\n\n항상 최선을 다해 모시겠습니다.";
			const closingPhrase = "\n\n편하신 시간에 연락 주시거나 방문해 주세요. 기다리겠습니다!";
			message = `${greeting}\n\n${body}${additionalBody}${promotion}${closingPhrase}${closing}`;
			break;
		}
	}

	return message.trim();
}

export function useAIMessageGenerator(): UseAIMessageGeneratorReturn {
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedMessage, setGeneratedMessage] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [tone, setTone] = useState<MessageTone>("friendly");
	const [length, setLength] = useState<MessageLength>("medium");
	const [includePromotion, setIncludePromotion] = useState(true);

	// 마지막 요청 정보 저장 (재생성용)
	const lastRequestRef = useRef<{
		customer: CustomerInfo;
		segment: SegmentType;
	} | null>(null);

	const generateMessage = useCallback(
		(customer: CustomerInfo, segment: SegmentType) => {
			setIsGenerating(true);
			setError(null);
			lastRequestRef.current = { customer, segment };

			// 실제 AI API 호출 시뮬레이션 (지연 추가)
			setTimeout(() => {
				try {
					const message = generateMessageContent(customer, segment, tone, length, includePromotion);
					setGeneratedMessage(message);
				} catch {
					setError("메시지 생성 중 오류가 발생했습니다.");
				} finally {
					setIsGenerating(false);
				}
			}, 100); // 100ms 지연으로 비동기 시뮬레이션
		},
		[tone, length, includePromotion],
	);

	const regenerate = useCallback(() => {
		if (lastRequestRef.current !== null) {
			const { customer, segment } = lastRequestRef.current;
			generateMessage(customer, segment);
		}
	}, [generateMessage]);

	const clearMessage = useCallback(() => {
		setGeneratedMessage("");
		setError(null);
	}, []);

	return {
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
	};
}
