import { useState } from "react";
import { productCategories as initialCategories } from "../sale/constants";
import type { ProductBrand, ProductCategory, ProductItem } from "../sale/types";

const DEFAULT_COLOR = "#00c875";
const colorOptions = [
	DEFAULT_COLOR,
	"#fdab3d",
	"#e2445c",
	"#a25ddc",
	"#0073ea",
	"#ff7eb3",
	"#00d2d2",
	"#6b7280",
];

type ModalType = "category" | "brand" | "product" | null;

export default function ProductsPage() {
	const [categories, setCategories] =
		useState<ProductCategory[]>(initialCategories);
	const [selectedCategory, setSelectedCategory] =
		useState<ProductCategory | null>(categories[0] || null);
	const [selectedBrand, setSelectedBrand] = useState<ProductBrand | null>(
		categories[0]?.brands[0] || null,
	);
	const [modalType, setModalType] = useState<ModalType>(null);
	const [editingCategory, setEditingCategory] =
		useState<ProductCategory | null>(null);
	const [editingBrand, setEditingBrand] = useState<ProductBrand | null>(null);
	const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
		null,
	);

	const [categoryForm, setCategoryForm] = useState({
		name: "",
		color: "#00c875",
	});
	const [brandForm, setBrandForm] = useState({ name: "" });
	const [productForm, setProductForm] = useState({ name: "", price: "" });

	// Sync selections with categories
	const currentCategory = categories.find((c) => c.id === selectedCategory?.id);
	const currentBrand = currentCategory?.brands.find(
		(b) => b.id === selectedBrand?.id,
	);

	// Category handlers
	const openAddCategoryModal = () => {
		setEditingCategory(null);
		setCategoryForm({ name: "", color: DEFAULT_COLOR });
		setModalType("category");
	};

	const openEditCategoryModal = (cat: ProductCategory) => {
		setEditingCategory(cat);
		setCategoryForm({ name: cat.name, color: cat.color });
		setModalType("category");
	};

	const handleCategorySubmit = () => {
		if (!categoryForm.name.trim()) return;

		if (editingCategory) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === editingCategory.id
						? { ...c, name: categoryForm.name, color: categoryForm.color }
						: c,
				),
			);
		} else {
			const newCategory: ProductCategory = {
				id: `pcat-${Date.now()}`,
				name: categoryForm.name,
				color: categoryForm.color,
				brands: [],
			};
			setCategories((prev) => [...prev, newCategory]);
			setSelectedCategory(newCategory);
		}
		setModalType(null);
	};

	const handleDeleteCategory = (id: string) => {
		if (
			confirm("카테고리와 모든 브랜드/상품이 삭제됩니다. 계속하시겠습니까?")
		) {
			setCategories((prev) => prev.filter((c) => c.id !== id));
			if (selectedCategory?.id === id) {
				setSelectedCategory(categories.find((c) => c.id !== id) || null);
				setSelectedBrand(null);
			}
		}
	};

	// Brand handlers
	const openAddBrandModal = () => {
		setEditingBrand(null);
		setBrandForm({ name: "" });
		setModalType("brand");
	};

	const openEditBrandModal = (brand: ProductBrand) => {
		setEditingBrand(brand);
		setBrandForm({ name: brand.name });
		setModalType("brand");
	};

	const handleBrandSubmit = () => {
		if (!brandForm.name.trim() || !selectedCategory) return;

		if (editingBrand) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? {
								...c,
								brands: c.brands.map((b) =>
									b.id === editingBrand.id ? { ...b, name: brandForm.name } : b,
								),
							}
						: c,
				),
			);
		} else {
			const newBrand: ProductBrand = {
				id: `brand-${Date.now()}`,
				name: brandForm.name,
				items: [],
			};
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? { ...c, brands: [...c.brands, newBrand] }
						: c,
				),
			);
			setSelectedBrand(newBrand);
		}
		setModalType(null);
	};

	const handleDeleteBrand = (brandId: string) => {
		if (!selectedCategory) return;
		if (confirm("브랜드와 모든 상품이 삭제됩니다. 계속하시겠습니까?")) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? { ...c, brands: c.brands.filter((b) => b.id !== brandId) }
						: c,
				),
			);
			if (selectedBrand?.id === brandId) {
				setSelectedBrand(null);
			}
		}
	};

	// Product handlers
	const openAddProductModal = () => {
		setEditingProduct(null);
		setProductForm({ name: "", price: "" });
		setModalType("product");
	};

	const openEditProductModal = (product: ProductItem) => {
		setEditingProduct(product);
		setProductForm({ name: product.name, price: String(product.price) });
		setModalType("product");
	};

	const handleProductSubmit = () => {
		if (
			!productForm.name.trim() ||
			!productForm.price ||
			!selectedCategory ||
			!selectedBrand
		)
			return;

		const price = parseInt(productForm.price);
		if (isNaN(price)) return;

		if (editingProduct) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? {
								...c,
								brands: c.brands.map((b) =>
									b.id === selectedBrand.id
										? {
												...b,
												items: b.items.map((p) =>
													p.id === editingProduct.id
														? { ...p, name: productForm.name, price }
														: p,
												),
											}
										: b,
								),
							}
						: c,
				),
			);
		} else {
			const newProduct: ProductItem = {
				id: `p-${Date.now()}`,
				name: productForm.name,
				price,
			};
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? {
								...c,
								brands: c.brands.map((b) =>
									b.id === selectedBrand.id
										? { ...b, items: [...b.items, newProduct] }
										: b,
								),
							}
						: c,
				),
			);
		}
		setModalType(null);
	};

	const handleDeleteProduct = (productId: string) => {
		if (!selectedCategory || !selectedBrand) return;
		if (confirm("이 상품을 삭제하시겠습니까?")) {
			setCategories((prev) =>
				prev.map((c) =>
					c.id === selectedCategory.id
						? {
								...c,
								brands: c.brands.map((b) =>
									b.id === selectedBrand.id
										? { ...b, items: b.items.filter((p) => p.id !== productId) }
										: b,
								),
							}
						: c,
				),
			);
		}
	};

	return (
		<div className="flex-1 p-8 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">상품 관리</h1>
					<p className="text-neutral-500 mt-1">
						상품 카테고리, 브랜드, 상품을 관리합니다 (3단계 구조)
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Categories Panel */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
						<div className="p-4 border-b border-neutral-200 flex items-center justify-between">
							<h2 className="font-bold text-neutral-800">카테고리</h2>
							<button
								onClick={openAddCategoryModal}
								className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
							>
								<span className="material-symbols-outlined">add</span>
							</button>
						</div>
						<div className="divide-y divide-neutral-100">
							{categories.map((cat) => (
								<button
									key={cat.id}
									onClick={() => {
										setSelectedCategory(cat);
										setSelectedBrand(cat.brands[0] || null);
									}}
									className={`w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors ${
										selectedCategory?.id === cat.id ? "bg-primary-50" : ""
									}`}
								>
									<div className="flex items-center gap-3">
										<span
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: cat.color }}
										/>
										<span className="font-medium text-sm">{cat.name}</span>
									</div>
									<div className="flex gap-1">
										<span
											onClick={(e) => {
												e.stopPropagation();
												openEditCategoryModal(cat);
											}}
											className="p-1 text-neutral-400 hover:text-primary-500 cursor-pointer"
										>
											<span className="material-symbols-outlined text-sm">
												edit
											</span>
										</span>
										<span
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteCategory(cat.id);
											}}
											className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
										>
											<span className="material-symbols-outlined text-sm">
												delete
											</span>
										</span>
									</div>
								</button>
							))}
						</div>
						{categories.length === 0 && (
							<div className="p-8 text-center text-neutral-400 text-sm">
								카테고리가 없습니다
							</div>
						)}
					</div>
				</div>

				{/* Brands Panel */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
						<div className="p-4 border-b border-neutral-200 flex items-center justify-between">
							<h2 className="font-bold text-neutral-800">
								{currentCategory?.name || "브랜드"}
							</h2>
							{currentCategory && (
								<button
									onClick={openAddBrandModal}
									className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
								>
									<span className="material-symbols-outlined">add</span>
								</button>
							)}
						</div>
						<div className="divide-y divide-neutral-100">
							{currentCategory?.brands.map((brand) => (
								<button
									key={brand.id}
									onClick={() => setSelectedBrand(brand)}
									className={`w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors ${
										selectedBrand?.id === brand.id ? "bg-primary-50" : ""
									}`}
								>
									<div className="flex items-center gap-2">
										<span className="font-medium text-sm">{brand.name}</span>
										<span className="text-xs text-neutral-400">
											({brand.items.length})
										</span>
									</div>
									<div className="flex gap-1">
										<span
											onClick={(e) => {
												e.stopPropagation();
												openEditBrandModal(brand);
											}}
											className="p-1 text-neutral-400 hover:text-primary-500 cursor-pointer"
										>
											<span className="material-symbols-outlined text-sm">
												edit
											</span>
										</span>
										<span
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteBrand(brand.id);
											}}
											className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
										>
											<span className="material-symbols-outlined text-sm">
												delete
											</span>
										</span>
									</div>
								</button>
							))}
						</div>
						{!currentCategory && (
							<div className="p-8 text-center text-neutral-400 text-sm">
								카테고리를 선택하세요
							</div>
						)}
						{currentCategory && currentCategory.brands.length === 0 && (
							<div className="p-8 text-center text-neutral-400 text-sm">
								브랜드가 없습니다
							</div>
						)}
					</div>
				</div>

				{/* Products Panel */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
						<div className="p-4 border-b border-neutral-200 flex items-center justify-between">
							<h2 className="font-bold text-neutral-800">
								{currentBrand?.name || "상품"}
							</h2>
							{currentBrand && (
								<button
									onClick={openAddProductModal}
									className="flex items-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors"
								>
									<span className="material-symbols-outlined text-lg">add</span>
									상품 추가
								</button>
							)}
						</div>
						{currentBrand ? (
							<div className="divide-y divide-neutral-100">
								{currentBrand.items.map((product) => (
									<div
										key={product.id}
										className="p-4 flex items-center justify-between hover:bg-neutral-50"
									>
										<div>
											<h3 className="font-medium text-neutral-800">
												{product.name}
											</h3>
											<span className="text-sm text-neutral-500">
												{product.price.toLocaleString()}원
											</span>
										</div>
										<div className="flex gap-1">
											<button
												onClick={() => openEditProductModal(product)}
												className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
											>
												<span className="material-symbols-outlined text-xl">
													edit
												</span>
											</button>
											<button
												onClick={() => handleDeleteProduct(product.id)}
												className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
											>
												<span className="material-symbols-outlined text-xl">
													delete
												</span>
											</button>
										</div>
									</div>
								))}
								{currentBrand.items.length === 0 && (
									<div className="p-8 text-center text-neutral-400">
										등록된 상품이 없습니다
									</div>
								)}
							</div>
						) : (
							<div className="p-8 text-center text-neutral-400">
								브랜드를 선택하세요
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Category Modal */}
			{modalType === "category" && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingCategory ? "카테고리 수정" : "카테고리 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									이름
								</label>
								<input
									type="text"
									value={categoryForm.name}
									onChange={(e) =>
										setCategoryForm((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="카테고리 이름"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									색상
								</label>
								<div className="flex flex-wrap gap-3">
									{colorOptions.map((color) => (
										<button
											key={color}
											onClick={() =>
												setCategoryForm((prev) => ({ ...prev, color }))
											}
											className={`w-10 h-10 rounded-full transition-transform ${
												categoryForm.color === color
													? "ring-2 ring-offset-2 ring-primary-500 scale-110"
													: "hover:scale-105"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={() => setModalType(null)}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleCategorySubmit}
								disabled={!categoryForm.name.trim()}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{editingCategory ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Brand Modal */}
			{modalType === "brand" && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingBrand ? "브랜드 수정" : "브랜드 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									브랜드명
								</label>
								<input
									type="text"
									value={brandForm.name}
									onChange={(e) =>
										setBrandForm((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="브랜드 이름"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={() => setModalType(null)}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleBrandSubmit}
								disabled={!brandForm.name.trim()}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{editingBrand ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Product Modal */}
			{modalType === "product" && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingProduct ? "상품 수정" : "상품 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									상품명
								</label>
								<input
									type="text"
									value={productForm.name}
									onChange={(e) =>
										setProductForm((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="상품 이름"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									가격
								</label>
								<input
									type="number"
									value={productForm.price}
									onChange={(e) =>
										setProductForm((prev) => ({
											...prev,
											price: e.target.value,
										}))
									}
									placeholder="0"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={() => setModalType(null)}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleProductSubmit}
								disabled={!productForm.name.trim() || !productForm.price}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{editingProduct ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
