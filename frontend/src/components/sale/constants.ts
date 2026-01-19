import type {
	Customer,
	DiscountEvent,
	Gender,
	MembershipOption,
	PaymentMethod,
	ProductCategory,
	ServiceCategory,
	Staff,
	StaffPermissions,
	StaffRole,
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

// 직급 설정
export const staffRoleConfig: Record<StaffRole, { label: string; order: number }> = {
	owner: { label: "원장", order: 1 },
	manager: { label: "실장", order: 2 },
	designer: { label: "디자이너", order: 3 },
	intern: { label: "인턴", order: 4 },
	staff: { label: "스탭", order: 5 },
};

export const staffRoleOptions: { value: StaffRole; label: string }[] = [
	{ value: "owner", label: "원장" },
	{ value: "manager", label: "실장" },
	{ value: "designer", label: "디자이너" },
	{ value: "intern", label: "인턴" },
	{ value: "staff", label: "스탭" },
];

// 성별 옵션
export const genderOptions: { value: Gender; label: string }[] = [
	{ value: "unspecified", label: "미지정" },
	{ value: "male", label: "남성" },
	{ value: "female", label: "여성" },
	{ value: "other", label: "기타" },
];

// 권한 설정
export const permissionConfig: Record<
	keyof StaffPermissions,
	{ label: string; description: string }
> = {
	sales: { label: "거래 관리", description: "거래 등록, 수정, 취소, 환불" },
	customers: { label: "고객 관리", description: "고객 등록, 수정, 삭제, 조회" },
	reports: {
		label: "매출/정산",
		description: "매출 취합, 정산 금액 조회, 리포트 출력",
	},
	settings: {
		label: "마스터 설정",
		description: "서비스/상품/직원 관리, 시스템 설정 변경",
	},
};

// 직급별 기본 권한
export const defaultPermissionsByRole: Record<StaffRole, StaffPermissions> = {
	owner: { sales: true, customers: true, reports: true, settings: true },
	manager: { sales: true, customers: true, reports: true, settings: false },
	designer: { sales: true, customers: true, reports: false, settings: false },
	intern: { sales: true, customers: false, reports: false, settings: false },
	staff: { sales: false, customers: false, reports: false, settings: false },
};

// 확장된 직원 목록
export const mockStaff: Staff[] = [
	{
		id: "1",
		name: "김정희",
		role: "owner",
		phone: "010-1111-2222",
		color: "#00c875",
		joinDate: "2020-03-01",
		employmentStatus: "active",
		showInSales: true,
		displayOrder: 1,
	},
	{
		id: "2",
		name: "박수민",
		role: "designer",
		phone: "010-3333-4444",
		color: "#fdab3d",
		joinDate: "2022-06-15",
		employmentStatus: "active",
		showInSales: true,
		displayOrder: 2,
	},
	{
		id: "3",
		name: "이하늘",
		role: "designer",
		phone: "010-5555-6666",
		color: "#a25ddc",
		joinDate: "2023-01-10",
		employmentStatus: "active",
		showInSales: true,
		displayOrder: 3,
	},
	{
		id: "4",
		name: "최민서",
		role: "intern",
		phone: "010-7777-8888",
		color: "#e2445c",
		joinDate: "2025-11-01",
		employmentStatus: "active",
		showInSales: false,
		displayOrder: 4,
	},
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
	{
		id: "cat6",
		name: "패키지",
		color: "#ff7eb3",
		items: [
			{ id: "s18", name: "커트+염색", price: 100000 },
			{ id: "s19", name: "커트+펌", price: 120000 },
			{ id: "s20", name: "염색+펌", price: 170000 },
			{ id: "s21", name: "풀케어(커트+염색+펌)", price: 200000 },
		],
	},
	{
		id: "cat7",
		name: "추가금",
		color: "#6b7280",
		items: [
			{ id: "s22", name: "긴머리추가", price: 10000 },
			{ id: "s23", name: "특수약제", price: 20000 },
			{ id: "s24", name: "시간외추가", price: 15000 },
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
	{ id: "transfer", label: "계좌이체", color: "#fdab3d" },
	{ id: "npay", label: "Npay", color: "#1ec800" },
	{ id: "stored_value", label: "정액권", color: "#a25ddc" },
	{ id: "membership", label: "정기권", color: "#e2445c" },
	{ id: "other", label: "기타", color: "#6b7280" },
] as const;

// 결제수단 ID → 한글 라벨 매핑 (itemPaymentMethods에서 파생)
export const PAYMENT_METHOD_LABELS: Record<string, string> = Object.fromEntries(
	itemPaymentMethods.map((m) => [m.id, m.label]),
);
