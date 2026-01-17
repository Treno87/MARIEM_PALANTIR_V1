import { useState } from "react";

interface Customer {
	id: string;
	name: string;
	phone: string;
	initials: string;
	memo?: string;
}

interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	type: "service" | "product";
}

interface Payment {
	method: string;
	amount: number;
}

// Mock data - 실제로는 API에서 가져옴
const initialCustomers: Customer[] = [
	{ id: "1", name: "김민지", phone: "010-1234-5678", initials: "MJ" },
	{ id: "2", name: "이서연", phone: "010-2345-6789", initials: "SY" },
	{ id: "3", name: "박지우", phone: "010-3456-7890", initials: "JW" },
];

function getInitials(name: string): string {
	const chars = name.trim().split("");
	if (chars.length < 2) return name.slice(0, 2).toUpperCase();

	return (chars[0] + chars[chars.length - 1]).toUpperCase();
}

const mockDesigners = [
	{ id: "1", name: "김정희" },
	{ id: "2", name: "박수민" },
	{ id: "3", name: "이하늘" },
];

// 시술 카테고리 및 하위 메뉴
const serviceCategories = [
	{
		id: "cat1",
		name: "커트",
		icon: "content_cut",
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
		icon: "palette",
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
		icon: "waves",
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
		icon: "spa",
		items: [
			{ id: "s13", name: "두피클리닉", price: 50000 },
			{ id: "s14", name: "모발클리닉", price: 40000 },
			{ id: "s15", name: "단백질케어", price: 60000 },
		],
	},
	{
		id: "cat5",
		name: "드라이",
		icon: "air",
		items: [
			{ id: "s16", name: "일반드라이", price: 15000 },
			{ id: "s17", name: "셋팅드라이", price: 25000 },
		],
	},
];

// 상품 카테고리
const productCategories = [
	{
		id: "pcat1",
		name: "헤어케어",
		icon: "local_pharmacy",
		items: [
			{ id: "p1", name: "샴푸", price: 35000 },
			{ id: "p2", name: "트리트먼트", price: 45000 },
			{ id: "p3", name: "헤어에센스", price: 28000 },
		],
	},
	{
		id: "pcat2",
		name: "스타일링",
		icon: "style",
		items: [
			{ id: "p4", name: "헤어왁스", price: 22000 },
			{ id: "p5", name: "헤어스프레이", price: 18000 },
			{ id: "p6", name: "헤어오일", price: 32000 },
		],
	},
];

const paymentMethods = [
	{ id: "card", label: "카드", icon: "credit_card" },
	{ id: "cash", label: "현금", icon: "payments" },
	{ id: "transfer", label: "계좌이체", icon: "account_balance" },
	{ id: "stored_value", label: "정액권", icon: "card_giftcard" },
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

	// 카테고리 선택
	const [selectedServiceCategory, setSelectedServiceCategory] =
		useState<string>("cat1");
	const [selectedProductCategory, setSelectedProductCategory] =
		useState<string>("pcat1");

	// 신규 고객 등록 모달
	const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
	const [newCustomerForm, setNewCustomerForm] = useState({
		name: "",
		phone: "",
		memo: "",
	});

	// 장바구니 소계
	const subtotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	// 할인 금액
	const discountAmount =
		discountType === "percent"
			? Math.round(subtotal * (discountValue / 100))
			: discountValue;

	// 총 결제 금액
	const total = subtotal - discountAmount;

	// 결제된 금액
	const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);

	// 잔액
	const remaining = total - paidAmount;

	// 상품/시술 추가
	const addToCart = (
		item: { id: string; name: string; price: number },
		type: "service" | "product",
	) => {
		const existingIndex = cart.findIndex((c) => c.id === item.id);
		if (existingIndex >= 0) {
			const updated = [...cart];
			updated[existingIndex].quantity += 1;
			setCart(updated);
		} else {
			setCart([...cart, { ...item, quantity: 1, type }]);
		}
	};

	// 장바구니 아이템 수량 변경
	const updateQuantity = (id: string, delta: number) => {
		const updated = cart
			.map((item) =>
				item.id === id ? { ...item, quantity: item.quantity + delta } : item,
			)
			.filter((item) => item.quantity > 0);
		setCart(updated);
	};

	// 결제 추가
	const addPayment = (method: string) => {
		if (remaining <= 0) return;
		setPayments([...payments, { method, amount: remaining }]);
	};

	// 결제 삭제
	const removePayment = (index: number) => {
		setPayments(payments.filter((_, i) => i !== index));
	};

	// 거래 저장
	const handleSave = () => {
		if (!selectedCustomer || cart.length === 0 || remaining !== 0) {
			alert("고객, 시술/상품, 결제를 모두 입력해주세요.");
			return;
		}
		// TODO: API 호출
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

	// 초기화
	const handleReset = () => {
		setSelectedCustomer(null);
		setCart([]);
		setPayments([]);
		setDiscountValue(0);
		setCustomerSearch("");
	};

	const filteredCustomers = customers.filter(
		(c) => c.name.includes(customerSearch) || c.phone.includes(customerSearch),
	);

	const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);

	// 신규 고객 등록
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

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<header className="sticky top-0 z-30 bg-neutral-50/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-neutral-200">
				<div className="flex items-center gap-3">
					<span className="material-symbols-outlined text-neutral-800">
						point_of_sale
					</span>
					<h1 className="text-lg font-extrabold tracking-tight">거래 입력</h1>
				</div>
				<button
					onClick={handleReset}
					className="text-primary-500 font-bold text-sm hover:text-primary-600 transition-colors"
				>
					초기화
				</button>
			</header>

			{/* Main Content */}
			<main className="flex-1 overflow-y-auto p-6 pb-48">
				{/* 고객 + 디자이너 선택 */}
				<section className="mb-6">
					<div className="flex gap-4 items-end">
						{/* 고객 선택 */}
						<div className="w-56 relative">
							<h2 className="text-sm font-bold text-neutral-800 mb-3">고객</h2>
							{selectedCustomerData ? (
								<div className="bg-white rounded-xl p-3 border border-neutral-200 soft-ui-shadow flex items-center gap-3 h-14">
									<div className="w-9 h-9 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-600 font-bold text-sm">
										{selectedCustomerData.initials}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-bold text-sm truncate">
											{selectedCustomerData.name}
										</p>
										<p className="text-xs text-neutral-500 truncate">
											{selectedCustomerData.phone}
										</p>
									</div>
									<button
										onClick={() => setSelectedCustomer(null)}
										className="text-neutral-400 hover:text-neutral-600 shrink-0"
									>
										<span className="material-symbols-outlined text-xl">
											close
										</span>
									</button>
								</div>
							) : (
								<>
									<div
										className="bg-white rounded-xl p-3 border border-neutral-200 soft-ui-shadow flex items-center gap-3 cursor-pointer hover:border-primary-300 transition-colors h-14"
										onClick={() => setShowCustomerSearch(true)}
									>
										<div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
											<span className="material-symbols-outlined text-xl">
												person_add
											</span>
										</div>
										<div className="flex-1">
											<p className="text-sm text-neutral-500">
												고객을 선택하세요
											</p>
										</div>
										<span className="material-symbols-outlined text-neutral-400 text-xl">
											search
										</span>
									</div>

									{showCustomerSearch && (
										<div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg z-20 overflow-hidden">
											<div className="p-3 border-b border-neutral-100">
												<input
													type="text"
													placeholder="이름 또는 전화번호 검색..."
													value={customerSearch}
													onChange={(e) => setCustomerSearch(e.target.value)}
													className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
													autoFocus
												/>
											</div>
											{/* 신규 고객 등록 버튼 */}
											<button
												onClick={() => setShowNewCustomerModal(true)}
												className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary-500/5 hover:bg-primary-500/10 transition-colors border-b border-neutral-100"
											>
												<div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500">
													<span className="material-symbols-outlined text-base">
														person_add
													</span>
												</div>
												<p className="font-bold text-sm text-primary-500">
													신규 고객 등록
												</p>
											</button>

											<div className="max-h-40 overflow-y-auto">
												{filteredCustomers.length > 0 ? (
													filteredCustomers.map((customer) => (
														<button
															key={customer.id}
															onClick={() => {
																setSelectedCustomer(customer.id);
																setShowCustomerSearch(false);
																setCustomerSearch("");
															}}
															className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
														>
															<div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-600 font-bold text-xs">
																{customer.initials}
															</div>
															<div className="text-left">
																<p className="font-bold text-sm">
																	{customer.name}
																</p>
																<p className="text-xs text-neutral-500">
																	{customer.phone}
																</p>
															</div>
														</button>
													))
												) : (
													<div className="px-4 py-4 text-center text-neutral-400 text-sm">
														검색 결과가 없습니다
													</div>
												)}
											</div>
											<button
												onClick={() => setShowCustomerSearch(false)}
												className="w-full py-2 text-xs text-neutral-500 hover:bg-neutral-50 border-t border-neutral-100"
											>
												닫기
											</button>
										</div>
									)}
								</>
							)}
						</div>

						{/* 디자이너 선택 */}
						<div className="flex-1">
							<h2 className="text-sm font-bold text-neutral-800 mb-3">
								담당 디자이너
							</h2>
							<div className="flex gap-2 h-14 items-center">
								{mockDesigners.map((designer) => (
									<button
										key={designer.id}
										onClick={() => setSelectedDesigner(designer.id)}
										className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
											selectedDesigner === designer.id
												? "bg-primary-500 text-white"
												: "bg-white border border-neutral-200 hover:border-primary-300"
										}`}
									>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
												selectedDesigner === designer.id
													? "bg-white/20 text-white"
													: "bg-neutral-100 text-neutral-600"
											}`}
										>
											{designer.name.slice(0, 1)}
										</div>
										<span className="text-sm font-bold">{designer.name}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* 시술 선택 */}
				<section className="mb-6">
					<h2 className="text-sm font-bold text-neutral-800 mb-3">시술</h2>
					{/* 카테고리 탭 */}
					<div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar">
						{serviceCategories.map((category) => (
							<button
								key={category.id}
								onClick={() => setSelectedServiceCategory(category.id)}
								className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
									selectedServiceCategory === category.id
										? "bg-primary-500 text-white"
										: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
								}`}
							>
								<span className="material-symbols-outlined text-base">
									{category.icon}
								</span>
								{category.name}
							</button>
						))}
					</div>
					{/* 하위 메뉴 */}
					<div className="bg-white rounded-xl border border-neutral-200 soft-ui-shadow p-3">
						<div className="flex gap-2 flex-wrap">
							{serviceCategories
								.find((cat) => cat.id === selectedServiceCategory)
								?.items.map((item) => (
									<button
										key={item.id}
										onClick={() => addToCart(item, "service")}
										className="flex items-center justify-between gap-4 px-4 py-2.5 bg-neutral-50 hover:bg-primary-500/10 border border-neutral-200 hover:border-primary-300 rounded-xl transition-all"
									>
										<span className="text-sm font-bold">{item.name}</span>
										<span className="text-sm text-primary-500 font-bold">
											{item.price.toLocaleString()}원
										</span>
									</button>
								))}
						</div>
					</div>
				</section>

				{/* 상품 선택 */}
				<section className="mb-6">
					<h2 className="text-sm font-bold text-neutral-800 mb-3">상품</h2>
					{/* 카테고리 탭 */}
					<div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar">
						{productCategories.map((category) => (
							<button
								key={category.id}
								onClick={() => setSelectedProductCategory(category.id)}
								className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
									selectedProductCategory === category.id
										? "bg-accent-500 text-white"
										: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
								}`}
							>
								<span className="material-symbols-outlined text-base">
									{category.icon}
								</span>
								{category.name}
							</button>
						))}
					</div>
					{/* 하위 메뉴 */}
					<div className="bg-white rounded-xl border border-neutral-200 soft-ui-shadow p-3">
						<div className="flex gap-2 flex-wrap">
							{productCategories
								.find((cat) => cat.id === selectedProductCategory)
								?.items.map((item) => (
									<button
										key={item.id}
										onClick={() => addToCart(item, "product")}
										className="flex items-center justify-between gap-4 px-4 py-2.5 bg-neutral-50 hover:bg-accent-500/10 border border-neutral-200 hover:border-accent-400 rounded-xl transition-all"
									>
										<span className="text-sm font-bold">{item.name}</span>
										<span className="text-sm text-accent-600 font-bold">
											{item.price.toLocaleString()}원
										</span>
									</button>
								))}
						</div>
					</div>
				</section>

				{/* 장바구니 */}
				{cart.length > 0 && (
					<section className="mb-6">
						<h2 className="text-sm font-bold text-neutral-800 mb-3">
							선택한 항목
						</h2>
						<div className="bg-white rounded-xl border border-neutral-200 soft-ui-shadow overflow-hidden">
							{cart.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 last:border-b-0"
								>
									<div className="flex items-center gap-3">
										<span
											className={`material-symbols-outlined text-sm ${
												item.type === "service"
													? "text-primary-500"
													: "text-accent-500"
											}`}
										>
											{item.type === "service" ? "content_cut" : "shopping_bag"}
										</span>
										<span className="font-bold text-sm">{item.name}</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<button
												onClick={() => updateQuantity(item.id, -1)}
												className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
											>
												<span className="material-symbols-outlined text-sm">
													remove
												</span>
											</button>
											<span className="w-6 text-center font-bold text-sm">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQuantity(item.id, 1)}
												className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
											>
												<span className="material-symbols-outlined text-sm">
													add
												</span>
											</button>
										</div>
										<span className="text-sm font-bold w-20 text-right">
											{(item.price * item.quantity).toLocaleString()}원
										</span>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{/* 할인 */}
				{cart.length > 0 && (
					<section className="mb-6">
						<h2 className="text-sm font-bold text-neutral-800 mb-3">할인</h2>
						<div className="bg-white rounded-xl border border-neutral-200 soft-ui-shadow p-4">
							<div className="flex gap-2 mb-3">
								<button
									onClick={() => setDiscountType("percent")}
									className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
										discountType === "percent"
											? "bg-primary-500 text-white"
											: "bg-neutral-100 text-neutral-600"
									}`}
								>
									%
								</button>
								<button
									onClick={() => setDiscountType("amount")}
									className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
										discountType === "amount"
											? "bg-primary-500 text-white"
											: "bg-neutral-100 text-neutral-600"
									}`}
								>
									원
								</button>
							</div>
							<div className="flex items-center gap-2">
								<input
									type="number"
									value={discountValue || ""}
									onChange={(e) => setDiscountValue(Number(e.target.value))}
									placeholder="0"
									className="flex-1 px-3 py-2 bg-neutral-50 rounded-lg text-right font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
								/>
								<span className="text-sm text-neutral-500 w-8">
									{discountType === "percent" ? "%" : "원"}
								</span>
							</div>
							{discountAmount > 0 && (
								<p className="text-xs text-red-500 mt-2 text-right">
									-{discountAmount.toLocaleString()}원 할인
								</p>
							)}
						</div>
					</section>
				)}

				{/* 결제 수단 */}
				{cart.length > 0 && (
					<section className="mb-6">
						<h2 className="text-sm font-bold text-neutral-800 mb-3">
							결제 수단
						</h2>
						<div className="grid grid-cols-4 gap-2 mb-4">
							{paymentMethods.map((method) => (
								<button
									key={method.id}
									onClick={() => addPayment(method.id)}
									disabled={remaining <= 0}
									className="bg-white border border-neutral-200 rounded-xl p-3 soft-ui-shadow hover:border-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<span className="material-symbols-outlined text-primary-500 mb-1">
										{method.icon}
									</span>
									<p className="text-xs font-bold">{method.label}</p>
								</button>
							))}
						</div>

						{/* 결제 내역 */}
						{payments.length > 0 && (
							<div className="space-y-2">
								{payments.map((payment, index) => {
									const method = paymentMethods.find(
										(m) => m.id === payment.method,
									);
									return (
										<div
											key={index}
											className="bg-primary-500/5 rounded-xl px-4 py-3 flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												<span className="material-symbols-outlined text-primary-500 text-sm">
													{method?.icon}
												</span>
												<span className="text-sm font-bold">
													{method?.label}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-bold">
													{payment.amount.toLocaleString()}원
												</span>
												<button
													onClick={() => removePayment(index)}
													className="text-neutral-400 hover:text-red-500"
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
					</section>
				)}
			</main>

			{/* Footer - 결제 요약 */}
			<footer className="fixed bottom-0 right-0 w-[calc(100%-280px)] bg-white/95 backdrop-blur-xl border-t border-neutral-200 px-6 pt-4 pb-6 z-40">
				<div className="space-y-2 mb-4">
					<div className="flex justify-between text-sm">
						<span className="text-neutral-500">소계</span>
						<span className="font-bold">{subtotal.toLocaleString()}원</span>
					</div>
					{discountAmount > 0 && (
						<div className="flex justify-between text-sm">
							<span className="text-neutral-500">할인</span>
							<span className="font-bold text-red-500">
								-{discountAmount.toLocaleString()}원
							</span>
						</div>
					)}
					<div className="flex justify-between text-lg pt-2 border-t border-neutral-100">
						<span className="font-bold">총 결제금액</span>
						<span className="font-extrabold text-primary-500">
							{total.toLocaleString()}원
						</span>
					</div>
					{remaining > 0 && payments.length > 0 && (
						<div className="flex justify-between text-sm">
							<span className="text-neutral-500">남은 금액</span>
							<span className="font-bold text-accent-500">
								{remaining.toLocaleString()}원
							</span>
						</div>
					)}
				</div>

				<button
					onClick={handleSave}
					disabled={!selectedCustomer || cart.length === 0 || remaining !== 0}
					className="w-full bg-primary-500 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span className="material-symbols-outlined">check_circle</span>
					거래 저장
				</button>
			</footer>

			{/* 신규 고객 등록 모달 */}
			{showNewCustomerModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* 배경 오버레이 */}
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => setShowNewCustomerModal(false)}
					/>

					{/* 모달 */}
					<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
						{/* 모달 헤더 */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
							<h3 className="text-lg font-extrabold">신규 고객 등록</h3>
							<button
								onClick={() => setShowNewCustomerModal(false)}
								className="text-neutral-400 hover:text-neutral-600 transition-colors"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						{/* 모달 본문 */}
						<div className="p-6 space-y-4">
							{/* 이름 */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									이름 <span className="text-red-500">*</span>
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
									placeholder="고객 이름"
									className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300"
									autoFocus
								/>
							</div>

							{/* 전화번호 */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									전화번호 <span className="text-red-500">*</span>
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
									placeholder="010-0000-0000"
									className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300"
								/>
							</div>

							{/* 메모 */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									메모{" "}
									<span className="text-neutral-400 font-normal">(선택)</span>
								</label>
								<textarea
									value={newCustomerForm.memo}
									onChange={(e) =>
										setNewCustomerForm({
											...newCustomerForm,
											memo: e.target.value,
										})
									}
									placeholder="고객에 대한 메모를 입력하세요"
									rows={3}
									className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 resize-none"
								/>
							</div>
						</div>

						{/* 모달 푸터 */}
						<div className="flex gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100">
							<button
								onClick={() => {
									setShowNewCustomerModal(false);
									setNewCustomerForm({ name: "", phone: "", memo: "" });
								}}
								className="flex-1 py-3 rounded-xl font-bold text-sm text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleNewCustomerSubmit}
								className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
							>
								<span className="material-symbols-outlined text-lg">
									person_add
								</span>
								등록
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
