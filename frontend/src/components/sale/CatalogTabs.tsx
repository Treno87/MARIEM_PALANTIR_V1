import type { ReactElement } from "react";
import { useState } from "react";
import type {
	ActiveTab,
	CartItem,
	MembershipOption,
	ProductCategory,
	ServiceCategory,
	StoredValueOption,
} from "./types";

interface CatalogTabsProps {
	serviceCategories: ServiceCategory[];
	productCategories: ProductCategory[];
	storedValueOptions: StoredValueOption[];
	membershipOptions: MembershipOption[];
	onAddToCart: (item: CartItem) => void;
	onShowAddModal: (type: string) => void;
}

export function CatalogTabs({
	serviceCategories,
	productCategories,
	storedValueOptions,
	membershipOptions,
	onAddToCart,
	onShowAddModal,
}: CatalogTabsProps): ReactElement {
	const [activeTab, setActiveTab] = useState<ActiveTab>("service");
	const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>("cat1");
	const [selectedProductCategory, setSelectedProductCategory] = useState<string>("pcat1");
	const [selectedProductBrand, setSelectedProductBrand] = useState<string | null>(null);

	const handleAddService = (
		item: {
			id: string;
			name: string;
			price: number;
			membershipEligible?: boolean;
		},
		categoryName: string,
	): void => {
		onAddToCart({
			id: item.id,
			name: item.name,
			price: item.price,
			quantity: 1,
			type: "service",
			category: categoryName,
			paymentMethod: "card",
			discountAmount: 0,
			finalPrice: item.price,
			membershipEligible: item.membershipEligible,
		});
	};

	const handleAddProduct = (item: { id: string; name: string; price: number }): void => {
		onAddToCart({
			id: item.id,
			name: item.name,
			price: item.price,
			quantity: 1,
			type: "product",
			paymentMethod: "card",
			discountAmount: 0,
			finalPrice: item.price,
		});
	};

	const handleAddStoredValue = (option: StoredValueOption): void => {
		onAddToCart({
			id: option.id,
			name: option.name,
			price: option.price,
			quantity: 1,
			type: "topup",
			topupType: "stored_value",
			topupValue: option.value,
			paymentMethod: "card",
			discountAmount: 0,
			finalPrice: option.price,
		});
	};

	const handleAddMembership = (option: MembershipOption): void => {
		onAddToCart({
			id: option.id,
			name: option.name,
			price: option.price,
			quantity: 1,
			type: "topup",
			topupType: "membership",
			topupValue: option.count,
			paymentMethod: "card",
			discountAmount: 0,
			finalPrice: option.price,
		});
	};

	return (
		<>
			{/* 탭 헤더 */}
			<div className="border-b border-neutral-200">
				<div className="flex">
					<button
						onClick={() => {
							setActiveTab("service");
						}}
						className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
							activeTab === "service"
								? "border-[#0073ea] text-[#0073ea]"
								: "border-transparent text-neutral-500 hover:text-neutral-700"
						}`}
					>
						시술
					</button>
					<button
						onClick={() => {
							setActiveTab("product");
						}}
						className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
							activeTab === "product"
								? "border-[#0073ea] text-[#0073ea]"
								: "border-transparent text-neutral-500 hover:text-neutral-700"
						}`}
					>
						상품
					</button>
					<button
						onClick={() => {
							setActiveTab("membership");
						}}
						className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
							activeTab === "membership"
								? "border-[#a25ddc] text-[#a25ddc]"
								: "border-transparent text-neutral-500 hover:text-neutral-700"
						}`}
					>
						멤버쉽
					</button>
				</div>
			</div>

			{/* 시술 탭 */}
			{activeTab === "service" && (
				<div className="p-6">
					<div className="mb-4 flex flex-wrap gap-2">
						{serviceCategories.map((category) => (
							<button
								key={category.id}
								onClick={() => {
									setSelectedServiceCategory(category.id);
								}}
								className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
									selectedServiceCategory === category.id
										? "text-white"
										: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
								}`}
								style={
									selectedServiceCategory === category.id ? { backgroundColor: category.color } : {}
								}
							>
								{category.name}
							</button>
						))}
						<button
							onClick={() => {
								onShowAddModal("serviceCategory");
							}}
							className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
						>
							<span className="material-symbols-outlined text-sm">add</span>
						</button>
					</div>

					{(() => {
						const category = serviceCategories.find((c) => c.id === selectedServiceCategory);
						if (!category) return null;
						return (
							<div className="flex flex-wrap gap-2">
								{category.items.map((item) => (
									<button
										key={item.id}
										onClick={() => {
											handleAddService(item, category.name);
										}}
										className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 transition-colors hover:border-neutral-300 hover:bg-neutral-100"
									>
										<span className="text-sm text-neutral-700">{item.name}</span>
										<span className="ml-2 text-sm font-semibold" style={{ color: category.color }}>
											{item.price.toLocaleString()}원
										</span>
									</button>
								))}
								<button
									onClick={() => {
										onShowAddModal("serviceItem");
									}}
									className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
								>
									<span className="material-symbols-outlined text-sm">add</span>
								</button>
							</div>
						);
					})()}
				</div>
			)}

			{/* 상품 탭 */}
			{activeTab === "product" && (
				<div className="p-6">
					<div className="mb-4 flex flex-wrap gap-2">
						{productCategories.map((category) => (
							<button
								key={category.id}
								onClick={() => {
									setSelectedProductCategory(category.id);
									setSelectedProductBrand(null);
								}}
								className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
									selectedProductCategory === category.id
										? "text-white"
										: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
								}`}
								style={
									selectedProductCategory === category.id ? { backgroundColor: category.color } : {}
								}
							>
								{category.name}
							</button>
						))}
						<button
							onClick={() => {
								onShowAddModal("productCategory");
							}}
							className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
						>
							<span className="material-symbols-outlined text-sm">add</span>
						</button>
					</div>

					<div className="mb-4 flex flex-wrap gap-2">
						{productCategories
							.find((c) => c.id === selectedProductCategory)
							?.brands.map((brand) => (
								<button
									key={brand.id}
									onClick={() => {
										setSelectedProductBrand(brand.id);
									}}
									className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
										selectedProductBrand === brand.id
											? "bg-neutral-800 text-white"
											: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
									}`}
								>
									{brand.name}
								</button>
							))}
						<button
							onClick={() => {
								onShowAddModal("brand");
							}}
							className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
						>
							<span className="material-symbols-outlined text-sm">add</span>
						</button>
					</div>

					{(() => {
						const category = productCategories.find((c) => c.id === selectedProductCategory);
						const brand = category?.brands.find((b) => b.id === selectedProductBrand);
						if (!brand) return null;
						return (
							<div className="flex flex-wrap gap-2">
								{brand.items.map((item) => (
									<button
										key={item.id}
										onClick={() => {
											handleAddProduct(item);
										}}
										className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 transition-colors hover:border-neutral-300 hover:bg-neutral-100"
									>
										<span className="text-sm text-neutral-700">{item.name}</span>
										<span className="ml-2 text-sm font-semibold" style={{ color: category?.color }}>
											{item.price.toLocaleString()}원
										</span>
									</button>
								))}
								<button
									onClick={() => {
										onShowAddModal("productItem");
									}}
									className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
								>
									<span className="material-symbols-outlined text-sm">add</span>
								</button>
							</div>
						);
					})()}
				</div>
			)}

			{/* 멤버쉽 탭 */}
			{activeTab === "membership" && (
				<div className="p-6">
					<div className="mb-6">
						<h4 className="mb-3 text-sm font-semibold text-neutral-600">정액권 충전</h4>
						<div className="flex flex-wrap gap-2">
							{storedValueOptions.map((option) => (
								<button
									key={option.id}
									onClick={() => {
										handleAddStoredValue(option);
									}}
									className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 transition-colors hover:border-neutral-300 hover:bg-neutral-100"
								>
									<span className="text-sm text-neutral-700">{option.name}</span>
									<span className="ml-2 text-sm font-semibold text-[#00c875]">
										{option.price.toLocaleString()}원
									</span>
								</button>
							))}
						</div>
					</div>

					<div>
						<h4 className="mb-3 text-sm font-semibold text-neutral-600">정기권 충전</h4>
						<div className="flex flex-wrap gap-2">
							{membershipOptions.map((option) => (
								<button
									key={option.id}
									onClick={() => {
										handleAddMembership(option);
									}}
									className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 transition-colors hover:border-neutral-300 hover:bg-neutral-100"
								>
									<span className="text-sm text-neutral-700">{option.name}</span>
									<span className="ml-2 text-sm font-semibold text-[#a25ddc]">
										{option.price.toLocaleString()}원
									</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
