import type {
	Customer,
	Designer,
	DiscountEvent,
	MembershipOption,
	PaymentMethod,
	ProductCategory,
	ServiceCategory,
	StoredValueOption,
} from "./types";

export const initialCustomers: Customer[] = [
	{
		id: "1",
		name: "김민지",
		phone: "010-1234-5678",
		initials: "MJ",
		storedValue: 150000,
		membership: { name: "펌 정기권", used: 2, total: 10 },
	},
	{
		id: "2",
		name: "이서연",
		phone: "010-2345-6789",
		initials: "SY",
		storedValue: 50000,
	},
	{
		id: "3",
		name: "박지우",
		phone: "010-3456-7890",
		initials: "JW",
		membership: { name: "커트 회원권", used: 5, total: 12 },
	},
];

export const mockDesigners: Designer[] = [
	{ id: "1", name: "김정희", color: "#00c875" },
	{ id: "2", name: "박수민", color: "#fdab3d" },
	{ id: "3", name: "이하늘", color: "#a25ddc" },
];

export const serviceCategories: ServiceCategory[] = [
	{
		id: "cat1",
		name: "커트",
		color: "#00c875",
		items: [
			{ id: "s1", name: "남자커트", price: 25000, membershipEligible: true },
			{ id: "s2", name: "여자커트", price: 30000, membershipEligible: true },
			{ id: "s3", name: "디자인커트", price: 40000, membershipEligible: true },
			{ id: "s4", name: "앞머리커트", price: 10000, membershipEligible: true },
		],
	},
	{
		id: "cat2",
		name: "염색",
		color: "#fdab3d",
		items: [
			{ id: "s5", name: "전체염색", price: 80000 },
			{ id: "s6", name: "뿌리염색", price: 50000 },
			{ id: "s7", name: "새치염색", price: 60000 },
			{ id: "s8", name: "탈색", price: 70000 },
		],
	},
	{
		id: "cat3",
		name: "펌",
		color: "#e2445c",
		items: [
			{ id: "s9", name: "일반펌", price: 100000 },
			{ id: "s10", name: "디지털펌", price: 130000 },
			{ id: "s11", name: "볼륨펌", price: 120000 },
			{ id: "s12", name: "매직셋팅", price: 150000 },
		],
	},
	{
		id: "cat4",
		name: "클리닉",
		color: "#a25ddc",
		items: [
			{ id: "s13", name: "두피클리닉", price: 50000 },
			{ id: "s14", name: "모발클리닉", price: 40000 },
			{ id: "s15", name: "단백질케어", price: 60000 },
		],
	},
	{
		id: "cat5",
		name: "드라이",
		color: "#0073ea",
		items: [
			{ id: "s16", name: "일반드라이", price: 15000 },
			{ id: "s17", name: "셋팅드라이", price: 25000 },
		],
	},
];

export const productCategories: ProductCategory[] = [
	{
		id: "pcat1",
		name: "헤어케어",
		color: "#00c875",
		brands: [
			{
				id: "brand1",
				name: "케라스타즈",
				items: [
					{ id: "p1", name: "뉴트리티브 샴푸", price: 42000 },
					{ id: "p2", name: "뉴트리티브 마스크", price: 58000 },
					{ id: "p3", name: "엘릭서 얼팀", price: 65000 },
				],
			},
			{
				id: "brand2",
				name: "로레알",
				items: [
					{ id: "p4", name: "프로케라틴 샴푸", price: 28000 },
					{ id: "p5", name: "프로케라틴 트리트먼트", price: 35000 },
				],
			},
			{
				id: "brand3",
				name: "모로칸오일",
				items: [
					{ id: "p6", name: "트리트먼트 오일", price: 52000 },
					{ id: "p7", name: "하이드레이팅 샴푸", price: 38000 },
				],
			},
		],
	},
	{
		id: "pcat2",
		name: "스타일링",
		color: "#fdab3d",
		brands: [
			{
				id: "brand4",
				name: "우에무라",
				items: [
					{ id: "p8", name: "텍스처 웨이브 왁스", price: 32000 },
					{ id: "p9", name: "홀드 팩터 스프레이", price: 28000 },
				],
			},
			{
				id: "brand5",
				name: "아베다",
				items: [
					{ id: "p10", name: "컨트롤 페이스트", price: 38000 },
					{ id: "p11", name: "에어 컨트롤 스프레이", price: 35000 },
				],
			},
		],
	},
];

export const paymentMethods: PaymentMethod[] = [
	{ id: "card", label: "카드", color: "#0073ea" },
	{ id: "cash", label: "현금", color: "#00c875" },
	{ id: "transfer", label: "계좌이체", color: "#fdab3d" },
];

export const storedValueOptions: StoredValueOption[] = [
	{ id: "sv1", name: "정액권 10만원", price: 100000, value: 100000 },
	{ id: "sv2", name: "정액권 30만원", price: 300000, value: 300000 },
	{ id: "sv3", name: "정액권 50만원", price: 500000, value: 500000 },
	{ id: "sv4", name: "정액권 100만원", price: 1000000, value: 1000000 },
];

export const membershipOptions: MembershipOption[] = [
	{ id: "mb1", name: "커트 10회권", price: 200000, count: 10 },
	{ id: "mb2", name: "커트 20회권", price: 380000, count: 20 },
	{ id: "mb3", name: "펌 5회권", price: 450000, count: 5 },
	{ id: "mb4", name: "펌 10회권", price: 850000, count: 10 },
];

// 할인 이벤트
export const discountEvents: DiscountEvent[] = [
	{ id: "ev1", name: "여름특가", discountType: "percent", discountValue: 10 },
	{ id: "ev2", name: "신규고객", discountType: "percent", discountValue: 20 },
	{ id: "ev3", name: "단골할인", discountType: "amount", discountValue: 5000 },
	{
		id: "ev4",
		name: "펌+염색 세트",
		discountType: "percent",
		discountValue: 15,
		applicableTo: ["s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12"],
	},
	{ id: "ev5", name: "평일특가", discountType: "percent", discountValue: 5 },
];

// 항목별 결제수단 버튼 설정
export const itemPaymentMethods = [
	{ id: "card", label: "카드", color: "#0073ea" },
	{ id: "cash", label: "현금", color: "#00c875" },
	{ id: "transfer", label: "이체", color: "#fdab3d" },
	{ id: "stored_value", label: "정액권", color: "#a25ddc" },
	{ id: "membership", label: "정기권", color: "#e2445c" },
] as const;
