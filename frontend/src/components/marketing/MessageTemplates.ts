/**
 * 세그먼트별 메시지 템플릿
 */

import type { MessageTemplate, SegmentType } from "../../types/marketing";

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
	{
		id: "churn_1",
		name: "휴면 고객 재방문 유도",
		segment: "churn_risk",
		content:
			"{고객명}님, 안녕하세요! 마지막 방문 후 {경과일}일이 지났습니다. 오랜만에 뵙고 싶네요. 재방문 시 특별 할인 혜택을 드립니다. 방문을 기다리겠습니다!",
		variables: ["{고객명}", "{경과일}"],
	},
	{
		id: "churn_2",
		name: "휴면 고객 안부 인사",
		segment: "churn_risk",
		content:
			"{고객명}님, 잘 지내고 계신가요? 저희 매장에서 {고객명}님을 기다리고 있어요. 편하신 시간에 방문해주세요!",
		variables: ["{고객명}"],
	},
	{
		id: "birthday_1",
		name: "생일 축하 메시지",
		segment: "birthday_upcoming",
		content:
			"{고객명}님, 생일을 진심으로 축하드립니다! 생일 기념 특별 할인을 준비했습니다. 예약 시 생일 쿠폰을 사용해주세요!",
		variables: ["{고객명}"],
	},
	{
		id: "birthday_2",
		name: "생일 사전 알림",
		segment: "birthday_upcoming",
		content:
			"{고객명}님, 곧 특별한 날이 다가오네요! 생일 맞이 헤어 스타일링으로 더욱 빛나는 하루 보내세요. 미리 예약하시면 선물이 준비되어 있습니다!",
		variables: ["{고객명}"],
	},
	{
		id: "low_balance_1",
		name: "정액권 잔액 부족 알림",
		segment: "low_balance",
		content:
			"{고객명}님, 정액권 잔액이 {잔액}원 남았습니다. 충전 시 추가 혜택을 드립니다. 편하실 때 방문해주세요!",
		variables: ["{고객명}", "{잔액}"],
	},
	{
		id: "low_balance_2",
		name: "정액권 충전 혜택 안내",
		segment: "low_balance",
		content:
			"{고객명}님, 정액권이 얼마 남지 않았네요! 지금 충전하시면 10% 추가 금액을 드립니다. 이번 달까지만 진행되는 특별 이벤트입니다!",
		variables: ["{고객명}"],
	},
	{
		id: "new_unsettled_1",
		name: "신규 고객 재방문 유도",
		segment: "new_unsettled",
		content:
			"{고객명}님, 첫 방문 감사했습니다! 두 번째 방문 시 특별 할인을 드립니다. 다시 뵙기를 기다리겠습니다!",
		variables: ["{고객명}"],
	},
	{
		id: "new_unsettled_2",
		name: "신규 고객 만족도 확인",
		segment: "new_unsettled",
		content:
			"{고객명}님, 지난번 방문은 만족스러우셨나요? 더 나은 서비스를 위해 의견을 남겨주세요. 재방문 시 특별 선물을 드립니다!",
		variables: ["{고객명}"],
	},
	{
		id: "vip_declining_1",
		name: "VIP 고객 특별 케어",
		segment: "vip_declining",
		content:
			"{고객명}님, 저희 VIP 고객님께 특별한 혜택을 준비했습니다. 바쁘신 와중에도 저희를 찾아주셔서 감사합니다. 편하신 시간에 방문해주세요!",
		variables: ["{고객명}"],
	},
];

/**
 * 세그먼트별 템플릿 필터링
 */
export function getTemplatesBySegment(segment: SegmentType): MessageTemplate[] {
	if (segment === "all") {
		return MESSAGE_TEMPLATES;
	}
	return MESSAGE_TEMPLATES.filter((t) => t.segment === segment);
}

/**
 * 변수 치환
 */
export function replaceVariables(template: string, variables: Record<string, string>): string {
	let result = template;
	for (const [key, value] of Object.entries(variables)) {
		result = result.replace(new RegExp(key, "g"), value);
	}
	return result;
}
