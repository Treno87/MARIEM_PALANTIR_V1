import { useState } from "react";

interface Customer {
	id: string;
	name: string;
	phone: string;
	initials: string;
	memo?: string;
	storedValue?: number;
	membership?: {
		name: string;
		used: number;
		total: number;
	};
}

interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	type: "service" | "product";
	category?: string;
}

interface Payment {
	method: string;
	amount: number;
}

// Mock data
const initialCustomers: Customer[] = [
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

function getInitials(name: string): string {
	const chars = name.trim().split("");
	if (chars.length < 2) return name.slice(0, 2).toUpperCase();
	return (chars[0] + chars[chars.length - 1]).toUpperCase();
}

const mockDesigners = [
	{ id: "1", name: "김정희", color: "#00c875" },
	{ id: "2", name: "박수민", color: "#fdab3d" },
	{ id: "3", name: "이하늘", color: "#a25ddc" },
];

// 시술 - 카테고리별 색상
const serviceCategories = [
	{
		id: "cat1",
		name: "커트",
		color: "#00c875",
		items: [
			{ id: "s1", name: "남자커트", price: 25000 },
			{ id: "s2", name: "여자커트", price: 30000 },
			{ id: "s3", name: "디자인커트", price: 40000 },
			{ id: "s4", name: "앞머리커트", price: 10000 },
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

// 상품
const productCategories = [
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

const paymentMethods = [
	{ id: "card", label: "카드", color: "#0073ea" },
	{ id: "cash", label: "현금", color: "#00c875" },
	{ id: "transfer", label: "계좌이체", color: "#fdab3d" },
];

export default function SalePage() {
	const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
	const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
	const [selectedDesigner, setSelectedDesigner] = useState<string>("1");
	const [cart, setCart] = useState<CartItem[]>([]);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [discountType, setDiscountType] = useState<"percent" | "amount">(
		"percent",
	);
	const [discountValue, setDiscountValue] = useState<number>(0);
	const [customerSearch, setCustomerSearch] = useState("");
	const [showCustomerSearch, setShowCustomerSearch] = useState(false);
	const [activeTab, setActiveTab] = useState<"service" | "product">("service");
	const [selectedServiceCategory, setSelectedServiceCategory] =
		useState<string>("cat1");
	const [selectedProductCategory, setSelectedProductCategory] =
		useState<string>("pcat1");
	const [selectedProductBrand, setSelectedProductBrand] = useState<
		string | null
	>(null);
	const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
	const [newCustomerForm, setNewCustomerForm] = useState({
		name: "",
		phone: "",
		memo: "",
	});
	const [showAddModal, setShowAddModal] = useState<string | null>(null);
	const [addForm, setAddForm] = useState({ name: "", price: "" });
	const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
	const [paymentAmount, setPaymentAmount] = useState<number>(0);

	const subtotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	const discountAmount =
		discountType === "percent"
			? Math.round(subtotal * (discountValue / 100))
			: discountValue;
	const total = subtotal - discountAmount;
	const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
	const remaining = total - paidAmount;

	const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
	const filteredCustomers = customers.filter(
		(c) => c.name.includes(customerSearch) || c.phone.includes(customerSearch),
	);

	// 정액권/정기권 사용량 계산
	const usedStoredValue = payments
		.filter((p) => p.method === "stored_value")
		.reduce((sum, p) => sum + p.amount, 0);
	const usedMembershipCount = payments.filter(
		(p) => p.method === "membership",
	).length;

	// 차감된 잔액/잔여횟수
	const displayedStoredValue = selectedCustomerData?.storedValue
		? selectedCustomerData.storedValue - usedStoredValue
		: 0;
	const displayedMembershipUsed = selectedCustomerData?.membership
		? selectedCustomerData.membership.used + usedMembershipCount
		: 0;

	const addToCart = (
		item: { id: string; name: string; price: number },
		type: "service" | "product",
		category?: string,
	) => {
		const existingIndex = cart.findIndex((c) => c.id === item.id);
		if (existingIndex >= 0) {
			const updated = [...cart];
			updated[existingIndex].quantity += 1;
			setCart(updated);
		} else {
			setCart([...cart, { ...item, quantity: 1, type, category }]);
		}
	};

	const updateQuantity = (id: string, delta: number) => {
		const updated = cart
			.map((item) =>
				item.id === id ? { ...item, quantity: item.quantity + delta } : item,
			)
			.filter((item) => item.quantity > 0);
		setCart(updated);
	};

	const removeFromCart = (id: string) => {
		setCart(cart.filter((item) => item.id !== id));
	};

	const openPaymentModal = (method: string) => {
		if (remaining <= 0) return;
		setShowPaymentModal(method);
		setPaymentAmount(remaining);
	};

	const confirmPayment = () => {
		if (!showPaymentModal || paymentAmount <= 0) return;

		const method = showPaymentModal;
		const storedValueLimit = selectedCustomerData?.storedValue ?? 0;
		const amount =
			method === "stored_value" && storedValueLimit > 0
				? Math.min(paymentAmount, storedValueLimit)
				: paymentAmount;

		setPayments([...payments, { method, amount }]);
		setShowPaymentModal(null);
		setPaymentAmount(0);
	};

	const removePayment = (index: number) => {
		setPayments(payments.filter((_, i) => i !== index));
	};

	const handleSave = () => {
		if (!selectedCustomer || cart.length === 0 || remaining !== 0) {
			alert("고객, 시술/상품, 결제를 모두 입력해주세요.");
			return;
		}
		console.log({
			customer_id: selectedCustomer,
			designer_id: selectedDesigner,
			items: cart,
			discount: { type: discountType, value: discountValue },
			payments,
			total,
		});
		alert("거래가 저장되었습니다.");
	};

	const handleReset = () => {
		setSelectedCustomer(null);
		setCart([]);
		setPayments([]);
		setDiscountValue(0);
		setCustomerSearch("");
	};

	const handleNewCustomerSubmit = () => {
		if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) {
			alert("이름과 전화번호를 입력해주세요.");
			return;
		}
		const newCustomer: Customer = {
			id: `new-${Date.now()}`,
			name: newCustomerForm.name.trim(),
			phone: newCustomerForm.phone.trim(),
			initials: getInitials(newCustomerForm.name.trim()),
			memo: newCustomerForm.memo.trim() || undefined,
		};
		setCustomers([...customers, newCustomer]);
		setSelectedCustomer(newCustomer.id);
		setShowNewCustomerModal(false);
		setShowCustomerSearch(false);
		setNewCustomerForm({ name: "", phone: "", memo: "" });
	};

	const getCategoryColor = (itemId: string) => {
		for (const cat of serviceCategories) {
			if (cat.items.find((i) => i.id === itemId)) return cat.color;
		}
		for (const cat of productCategories) {
			for (const brand of cat.brands) {
				if (brand.items.find((i) => i.id === itemId)) return cat.color;
			}
		}
		return "#6b7280";
	};

	return (
		<div className="flex flex-col h-full bg-white">
			{/* Header */}
			<header className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
				<h1 className="text-xl font-bold text-neutral-800">거래 입력</h1>
				<button
					onClick={handleReset}
					className="text-sm text-neutral-500 hover:text-neutral-700"
				>
					초기화
				</button>
			</header>

			<main className="flex-1 overflow-y-auto pb-48">
				{/* 고객/디자이너/정액권 - 테이블 헤더 스타일 */}
				<div className="border-b border-neutral-200">
					<table className="w-full">
						<thead>
							<tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
								<th className="px-6 py-3 w-48">고객</th>
								<th className="px-6 py-3 w-[140px]">정액권</th>
								<th className="px-6 py-3 w-[140px]">정기권</th>
								<th className="px-6 py-3">담당</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-neutral-100">
								{/* 고객 */}
								<td className="px-6 py-3">
									<div className="relative">
										{selectedCustomerData ? (
											<div className="flex items-center gap-2">
												<div className="w-8 h-8 rounded-full bg-[#a25ddc] flex items-center justify-center text-white text-xs font-bold">
													{selectedCustomerData.initials}
												</div>
												<div>
													<p className="text-sm font-medium text-neutral-800">
														{selectedCustomerData.name}
													</p>
													<p className="text-xs text-neutral-400">
														{selectedCustomerData.phone}
													</p>
												</div>
												<button
													onClick={() => setSelectedCustomer(null)}
													className="ml-2 text-neutral-400 hover:text-neutral-600"
												>
													<span className="material-symbols-outlined text-sm">
														close
													</span>
												</button>
											</div>
										) : (
											<button
												onClick={() => setShowCustomerSearch(true)}
												className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600"
											>
												<span className="material-symbols-outlined text-lg">
													person_add
												</span>
												<span className="text-sm">고객 선택</span>
											</button>
										)}
										{showCustomerSearch && (
											<div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border border-neutral-200 shadow-lg z-20">
												<div className="p-2 border-b border-neutral-100">
													<input
														type="text"
														placeholder="검색..."
														value={customerSearch}
														onChange={(e) => setCustomerSearch(e.target.value)}
														className="w-full px-3 py-2 text-sm bg-neutral-50 rounded-md focus:outline-none"
														autoFocus
													/>
												</div>
												<button
													onClick={() => setShowNewCustomerModal(true)}
													className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#0073ea] hover:bg-neutral-50"
												>
													<span className="material-symbols-outlined text-base">
														add
													</span>
													신규 고객 등록
												</button>
												<div className="max-h-40 overflow-y-auto">
													{filteredCustomers.map((customer) => (
														<button
															key={customer.id}
															onClick={() => {
																setSelectedCustomer(customer.id);
																setShowCustomerSearch(false);
																setCustomerSearch("");
															}}
															className="w-full flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 text-left"
														>
															<div className="w-6 h-6 rounded-full bg-[#a25ddc] flex items-center justify-center text-white text-[10px] font-bold">
																{customer.initials}
															</div>
															<span className="text-sm">{customer.name}</span>
														</button>
													))}
												</div>
												<button
													onClick={() => setShowCustomerSearch(false)}
													className="w-full py-2 text-xs text-neutral-400 hover:bg-neutral-50 border-t border-neutral-100"
												>
													닫기
												</button>
											</div>
										)}
									</div>
								</td>
								{/* 정액권 */}
								<td className="px-6 py-3">
									{selectedCustomerData?.storedValue ? (
										<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white whitespace-nowrap bg-[#00c875]">
											{displayedStoredValue.toLocaleString()}원
										</span>
									) : (
										<span className="text-neutral-300">-</span>
									)}
								</td>
								{/* 정기권 */}
								<td className="px-6 py-3">
									{selectedCustomerData?.membership ? (
										<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white whitespace-nowrap bg-[#fdab3d]">
											{displayedMembershipUsed}/
											{selectedCustomerData.membership.total}회
										</span>
									) : (
										<span className="text-neutral-300">-</span>
									)}
								</td>
								{/* 담당 디자이너 */}
								<td className="px-6 py-3">
									<div className="flex items-center gap-2">
										{mockDesigners.map((designer) => (
											<button
												key={designer.id}
												onClick={() => setSelectedDesigner(designer.id)}
												className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
													selectedDesigner === designer.id
														? "text-white"
														: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
												}`}
												style={
													selectedDesigner === designer.id
														? { backgroundColor: designer.color }
														: {}
												}
											>
												{designer.name}
											</button>
										))}
										<button
											onClick={() => setShowAddModal("designer")}
											className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
										>
											<span className="material-symbols-outlined text-base">
												add
											</span>
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* 시술/상품 탭 */}
				<div className="border-b border-neutral-200">
					<div className="flex">
						<button
							onClick={() => setActiveTab("service")}
							className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
								activeTab === "service"
									? "border-[#0073ea] text-[#0073ea]"
									: "border-transparent text-neutral-500 hover:text-neutral-700"
							}`}
						>
							시술
						</button>
						<button
							onClick={() => setActiveTab("product")}
							className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
								activeTab === "product"
									? "border-[#0073ea] text-[#0073ea]"
									: "border-transparent text-neutral-500 hover:text-neutral-700"
							}`}
						>
							상품
						</button>
					</div>
				</div>

				{/* 시술 - 카테고리 한 행, 세부메뉴 아래 행 */}
				{activeTab === "service" && (
					<div className="p-6">
						{/* 카테고리 선택 (가로 한 행) */}
						<div className="flex gap-2 mb-4 flex-wrap">
							{serviceCategories.map((category) => (
								<button
									key={category.id}
									onClick={() => setSelectedServiceCategory(category.id)}
									className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
										selectedServiceCategory === category.id
											? "text-white"
											: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
									}`}
									style={
										selectedServiceCategory === category.id
											? { backgroundColor: category.color }
											: {}
									}
								>
									{category.name}
								</button>
							))}
							<button
								onClick={() => setShowAddModal("serviceCategory")}
								className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
							>
								<span className="material-symbols-outlined text-sm">add</span>
							</button>
						</div>

						{/* 세부 시술 항목들 (아래 행) */}
						{(() => {
							const category = serviceCategories.find(
								(c) => c.id === selectedServiceCategory,
							);
							if (!category) return null;
							return (
								<div className="flex flex-wrap gap-2">
									{category.items.map((item) => (
										<button
											key={item.id}
											onClick={() => addToCart(item, "service", category.name)}
											className="px-4 py-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200 hover:border-neutral-300"
										>
											<span className="text-sm text-neutral-700">
												{item.name}
											</span>
											<span
												className="ml-2 text-sm font-semibold"
												style={{ color: category.color }}
											>
												{item.price.toLocaleString()}원
											</span>
										</button>
									))}
									<button
										onClick={() => setShowAddModal("serviceItem")}
										className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
									>
										<span className="material-symbols-outlined text-sm">
											add
										</span>
									</button>
								</div>
							);
						})()}
					</div>
				)}

				{/* 상품 - 카테고리/브랜드/항목 각각 한 행 */}
				{activeTab === "product" && (
					<div className="p-6">
						{/* 카테고리 선택 (첫 번째 행) */}
						<div className="flex gap-2 mb-4 flex-wrap">
							{productCategories.map((category) => (
								<button
									key={category.id}
									onClick={() => {
										setSelectedProductCategory(category.id);
										setSelectedProductBrand(null);
									}}
									className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
										selectedProductCategory === category.id
											? "text-white"
											: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
									}`}
									style={
										selectedProductCategory === category.id
											? { backgroundColor: category.color }
											: {}
									}
								>
									{category.name}
								</button>
							))}
							<button
								onClick={() => setShowAddModal("productCategory")}
								className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
							>
								<span className="material-symbols-outlined text-sm">add</span>
							</button>
						</div>

						{/* 브랜드 선택 (두 번째 행) */}
						<div className="flex gap-2 mb-4 flex-wrap">
							{productCategories
								.find((c) => c.id === selectedProductCategory)
								?.brands.map((brand) => (
									<button
										key={brand.id}
										onClick={() => setSelectedProductBrand(brand.id)}
										className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
											selectedProductBrand === brand.id
												? "bg-neutral-800 text-white"
												: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
										}`}
									>
										{brand.name}
									</button>
								))}
							<button
								onClick={() => setShowAddModal("brand")}
								className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
							>
								<span className="material-symbols-outlined text-sm">add</span>
							</button>
						</div>

						{/* 상품 항목들 (세 번째 행) */}
						{(() => {
							const category = productCategories.find(
								(c) => c.id === selectedProductCategory,
							);
							const brand = category?.brands.find(
								(b) => b.id === selectedProductBrand,
							);
							if (!brand) return null;
							return (
								<div className="flex flex-wrap gap-2">
									{brand.items.map((item) => (
										<button
											key={item.id}
											onClick={() => addToCart(item, "product")}
											className="px-4 py-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200 hover:border-neutral-300"
										>
											<span className="text-sm text-neutral-700">
												{item.name}
											</span>
											<span
												className="ml-2 text-sm font-semibold"
												style={{ color: category?.color }}
											>
												{item.price.toLocaleString()}원
											</span>
										</button>
									))}
									<button
										onClick={() => setShowAddModal("productItem")}
										className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
									>
										<span className="material-symbols-outlined text-sm">
											add
										</span>
									</button>
								</div>
							);
						})()}
					</div>
				)}

				{/* 선택한 항목 (장바구니) */}
				{cart.length > 0 && (
					<div className="px-6 py-4 border-t border-neutral-200">
						<h3 className="text-sm font-bold text-neutral-700 mb-3">
							선택한 항목
						</h3>
						<div className="bg-neutral-50 rounded-lg overflow-hidden">
							<table className="w-full">
								<thead>
									<tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
										<th className="px-4 py-2">항목</th>
										<th className="px-4 py-2 w-24 text-center">수량</th>
										<th className="px-4 py-2 w-28 text-right">금액</th>
										<th className="px-4 py-2 w-10"></th>
									</tr>
								</thead>
								<tbody>
									{cart.map((item, idx) => (
										<tr
											key={item.id}
											className={
												idx !== cart.length - 1
													? "border-b border-neutral-100"
													: ""
											}
										>
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<div
														className="w-1 h-6 rounded-full"
														style={{
															backgroundColor: getCategoryColor(item.id),
														}}
													/>
													<span className="text-sm text-neutral-700">
														{item.name}
													</span>
												</div>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center justify-center gap-2">
													<button
														onClick={() => updateQuantity(item.id, -1)}
														className="w-6 h-6 rounded bg-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-300"
													>
														<span className="material-symbols-outlined text-sm">
															remove
														</span>
													</button>
													<span className="w-6 text-center text-sm font-medium">
														{item.quantity}
													</span>
													<button
														onClick={() => updateQuantity(item.id, 1)}
														className="w-6 h-6 rounded bg-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-300"
													>
														<span className="material-symbols-outlined text-sm">
															add
														</span>
													</button>
												</div>
											</td>
											<td className="px-4 py-3 text-right">
												<span className="text-sm font-semibold text-neutral-700">
													{(item.price * item.quantity).toLocaleString()}원
												</span>
											</td>
											<td className="px-4 py-3">
												<button
													onClick={() => removeFromCart(item.id)}
													className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-[#e2445c] hover:bg-red-50"
												>
													<span className="material-symbols-outlined text-sm">
														delete
													</span>
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* 할인 */}
				{cart.length > 0 && (
					<div className="px-6 py-4 border-t border-neutral-200">
						<h3 className="text-sm font-bold text-neutral-700 mb-3">할인</h3>
						<div className="flex items-center gap-3">
							<div className="flex bg-neutral-100 rounded-lg p-1">
								<button
									onClick={() => setDiscountType("percent")}
									className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
										discountType === "percent"
											? "bg-white text-neutral-800 shadow-sm"
											: "text-neutral-500"
									}`}
								>
									%
								</button>
								<button
									onClick={() => setDiscountType("amount")}
									className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
										discountType === "amount"
											? "bg-white text-neutral-800 shadow-sm"
											: "text-neutral-500"
									}`}
								>
									원
								</button>
							</div>
							<input
								type="number"
								value={discountValue || ""}
								onChange={(e) => setDiscountValue(Number(e.target.value))}
								placeholder="0"
								className="w-24 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-right focus:outline-none focus:border-[#0073ea]"
							/>
							{discountAmount > 0 && (
								<span className="text-sm text-[#e2445c] font-medium">
									-{discountAmount.toLocaleString()}원
								</span>
							)}
						</div>
					</div>
				)}

				{/* 결제 수단 */}
				{cart.length > 0 && (
					<div className="px-6 py-4 border-t border-neutral-200">
						<h3 className="text-sm font-bold text-neutral-700 mb-3">
							결제 수단
						</h3>
						<div className="flex gap-2 flex-wrap mb-3">
							{paymentMethods.map((method) => (
								<button
									key={method.id}
									onClick={() => openPaymentModal(method.id)}
									disabled={remaining <= 0}
									className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
									style={{ backgroundColor: method.color }}
								>
									{method.label}
								</button>
							))}
							{selectedCustomerData?.storedValue &&
								displayedStoredValue > 0 && (
									<button
										onClick={() => openPaymentModal("stored_value")}
										disabled={remaining <= 0}
										className="px-4 py-2 rounded-lg text-sm font-medium bg-[#a25ddc] text-white transition-opacity disabled:opacity-40"
									>
										정액권
									</button>
								)}
							{selectedCustomerData?.membership &&
								displayedMembershipUsed <
									selectedCustomerData.membership.total && (
									<button
										onClick={() => openPaymentModal("membership")}
										disabled={remaining <= 0}
										className="px-4 py-2 rounded-lg text-sm font-medium bg-[#e2445c] text-white transition-opacity disabled:opacity-40"
									>
										정기권
									</button>
								)}
						</div>

						{/* 결제 내역 */}
						{payments.length > 0 && (
							<div className="space-y-2">
								{payments.map((payment, index) => {
									const method = paymentMethods.find(
										(m) => m.id === payment.method,
									);
									const isStoredValue = payment.method === "stored_value";
									const isMembership = payment.method === "membership";
									const color = isStoredValue
										? "#a25ddc"
										: isMembership
											? "#e2445c"
											: method?.color || "#6b7280";

									return (
										<div
											key={index}
											className="flex items-center justify-between px-4 py-2 bg-neutral-50 rounded-lg"
										>
											<div className="flex items-center gap-2">
												<div
													className="w-2 h-2 rounded-full"
													style={{ backgroundColor: color }}
												/>
												<span className="text-sm font-medium">
													{isStoredValue
														? "정액권"
														: isMembership
															? "정기권"
															: method?.label}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-sm font-semibold">
													{isMembership
														? "1회 사용"
														: `${payment.amount.toLocaleString()}원`}
												</span>
												<button
													onClick={() => removePayment(index)}
													className="text-neutral-400 hover:text-[#e2445c]"
												>
													<span className="material-symbols-outlined text-sm">
														close
													</span>
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="fixed bottom-0 right-0 w-[calc(100%-280px)] bg-white border-t border-neutral-200 px-6 py-4 z-40">
				<div className="flex items-center justify-between mb-4">
					<div className="space-y-1">
						<div className="flex items-center gap-4 text-sm">
							<span className="text-neutral-500">소계</span>
							<span className="font-medium">{subtotal.toLocaleString()}원</span>
						</div>
						{discountAmount > 0 && (
							<div className="flex items-center gap-4 text-sm">
								<span className="text-neutral-500">할인</span>
								<span className="font-medium text-[#e2445c]">
									-{discountAmount.toLocaleString()}원
								</span>
							</div>
						)}
					</div>
					<div className="text-right">
						<p className="text-xs text-neutral-500 mb-1">총 결제금액</p>
						<p className="text-2xl font-bold text-[#0073ea]">
							{total.toLocaleString()}원
						</p>
						{remaining > 0 && payments.length > 0 && (
							<p className="text-xs text-[#fdab3d]">
								남은 금액: {remaining.toLocaleString()}원
							</p>
						)}
					</div>
				</div>
				<button
					onClick={handleSave}
					disabled={!selectedCustomer || cart.length === 0 || remaining !== 0}
					className="w-full py-3 rounded-lg font-semibold text-white bg-[#0073ea] hover:bg-[#0060c2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				>
					거래 저장
				</button>
			</footer>

			{/* 신규 고객 등록 모달 */}
			{showNewCustomerModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => setShowNewCustomerModal(false)}
					/>
					<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
							<h3 className="text-lg font-bold">신규 고객 등록</h3>
							<button
								onClick={() => setShowNewCustomerModal(false)}
								className="text-neutral-400 hover:text-neutral-600"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">
									이름 *
								</label>
								<input
									type="text"
									value={newCustomerForm.name}
									onChange={(e) =>
										setNewCustomerForm({
											...newCustomerForm,
											name: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#0073ea]"
									autoFocus
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">
									전화번호 *
								</label>
								<input
									type="tel"
									value={newCustomerForm.phone}
									onChange={(e) =>
										setNewCustomerForm({
											...newCustomerForm,
											phone: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#0073ea]"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">
									메모
								</label>
								<textarea
									value={newCustomerForm.memo}
									onChange={(e) =>
										setNewCustomerForm({
											...newCustomerForm,
											memo: e.target.value,
										})
									}
									rows={2}
									className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#0073ea] resize-none"
								/>
							</div>
						</div>
						<div className="flex gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
							<button
								onClick={() => setShowNewCustomerModal(false)}
								className="flex-1 py-2 rounded-lg font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50"
							>
								취소
							</button>
							<button
								onClick={handleNewCustomerSubmit}
								className="flex-1 py-2 rounded-lg font-medium text-white bg-[#0073ea] hover:bg-[#0060c2]"
							>
								등록
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 항목 추가 모달 */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => {
							setShowAddModal(null);
							setAddForm({ name: "", price: "" });
						}}
					/>
					<div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
							<h3 className="text-lg font-bold">
								{showAddModal === "designer" && "디자이너 추가"}
								{showAddModal === "serviceCategory" && "시술 카테고리 추가"}
								{showAddModal === "serviceItem" && "시술 추가"}
								{showAddModal === "productCategory" && "상품 카테고리 추가"}
								{showAddModal === "brand" && "브랜드 추가"}
								{showAddModal === "productItem" && "상품 추가"}
							</h3>
							<button
								onClick={() => {
									setShowAddModal(null);
									setAddForm({ name: "", price: "" });
								}}
								className="text-neutral-400 hover:text-neutral-600"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">
									이름 *
								</label>
								<input
									type="text"
									value={addForm.name}
									onChange={(e) =>
										setAddForm({ ...addForm, name: e.target.value })
									}
									className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#0073ea]"
									autoFocus
								/>
							</div>
							{showAddModal === "serviceItem" && (
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-1">
										가격 *
									</label>
									<input
										type="number"
										value={addForm.price}
										onChange={(e) =>
											setAddForm({ ...addForm, price: e.target.value })
										}
										className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#0073ea]"
									/>
								</div>
							)}
						</div>
						<div className="flex gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
							<button
								onClick={() => {
									setShowAddModal(null);
									setAddForm({ name: "", price: "" });
								}}
								className="flex-1 py-2 rounded-lg font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50"
							>
								취소
							</button>
							<button
								onClick={() => {
									console.log("추가:", showAddModal, addForm);
									alert(`${addForm.name} 추가됨 (MVP: 실제 저장은 미구현)`);
									setShowAddModal(null);
									setAddForm({ name: "", price: "" });
								}}
								disabled={!addForm.name.trim()}
								className="flex-1 py-2 rounded-lg font-medium text-white bg-[#0073ea] hover:bg-[#0060c2] disabled:opacity-40"
							>
								추가
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 결제 금액 입력 모달 */}
			{showPaymentModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => {
							setShowPaymentModal(null);
							setPaymentAmount(0);
						}}
					/>
					<div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
							<h3 className="text-lg font-bold">
								{showPaymentModal === "card" && "카드 결제"}
								{showPaymentModal === "cash" && "현금 결제"}
								{showPaymentModal === "transfer" && "계좌이체"}
								{showPaymentModal === "stored_value" && "정액권 사용"}
								{showPaymentModal === "membership" && "정기권 사용"}
							</h3>
							<button
								onClick={() => {
									setShowPaymentModal(null);
									setPaymentAmount(0);
								}}
								className="text-neutral-400 hover:text-neutral-600"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="p-6">
							<div className="mb-4">
								<label className="block text-sm font-medium text-neutral-700 mb-1">
									결제 금액
								</label>
								<div className="relative">
									<input
										type="number"
										value={paymentAmount || ""}
										onChange={(e) => setPaymentAmount(Number(e.target.value))}
										max={remaining}
										className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-lg font-semibold text-right focus:outline-none focus:border-[#0073ea]"
										autoFocus
									/>
									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
										원
									</span>
								</div>
							</div>
							<div className="flex justify-between text-sm text-neutral-500 mb-2">
								<span>남은 금액</span>
								<span className="font-medium">
									{remaining.toLocaleString()}원
								</span>
							</div>
							<button
								onClick={() => setPaymentAmount(remaining)}
								className="w-full py-2 text-sm text-[#0073ea] hover:bg-blue-50 rounded-lg mb-4"
							>
								전액 입력
							</button>
						</div>
						<div className="flex gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
							<button
								onClick={() => {
									setShowPaymentModal(null);
									setPaymentAmount(0);
								}}
								className="flex-1 py-2 rounded-lg font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50"
							>
								취소
							</button>
							<button
								onClick={confirmPayment}
								disabled={paymentAmount <= 0 || paymentAmount > remaining}
								className="flex-1 py-2 rounded-lg font-medium text-white bg-[#0073ea] hover:bg-[#0060c2] disabled:opacity-40"
							>
								결제 추가
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
