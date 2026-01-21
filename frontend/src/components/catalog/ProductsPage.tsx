import { useState } from "react";
import { COLOR_OPTIONS, DEFAULT_COLOR } from "../../constants/colors";
import { useCatalog } from "../../contexts/CatalogContext";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useProductsApi";
import { USE_API } from "../../lib/config";
import type { ProductBrand, ProductCategory, ProductItem } from "../sale/types";

type ModalType = "category" | "brand" | "product" | null;

export default function ProductsPage(): React.ReactElement {
	const {
		productCategories,
		addProductCategory,
		updateProductCategory,
		deleteProductCategory,
		addProductBrand,
		updateProductBrand,
		deleteProductBrand,
		addProductItem,
		updateProductItem,
		deleteProductItem,
	} = useCatalog();

	// API mutation hooks (제품만 - 카테고리/브랜드는 API 미지원)
	const createProductMutation = useCreateProduct();
	const updateProductMutation = useUpdateProduct();

	const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(
		productCategories[0] ?? null,
	);
	const [selectedBrand, setSelectedBrand] = useState<ProductBrand | null>(
		productCategories[0]?.brands[0] ?? null,
	);
	const [modalType, setModalType] = useState<ModalType>(null);
	const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
	const [editingBrand, setEditingBrand] = useState<ProductBrand | null>(null);
	const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

	const [categoryForm, setCategoryForm] = useState({
		name: "",
		color: "#00c875",
	});
	const [brandForm, setBrandForm] = useState({ name: "" });
	const [productForm, setProductForm] = useState({ name: "", price: "" });

	// Sync selections with categories
	const currentCategory = productCategories.find((c) => c.id === selectedCategory?.id);
	const currentBrand = currentCategory?.brands.find((b) => b.id === selectedBrand?.id);

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
			updateProductCategory(editingCategory.id, {
				name: categoryForm.name,
				color: categoryForm.color,
			});
		} else {
			addProductCategory({
				name: categoryForm.name,
				color: categoryForm.color,
			});
		}
		setModalType(null);
	};

	const handleDeleteCategory = (id: string): void => {
		if (!confirm("카테고리와 모든 브랜드/상품이 삭제됩니다. 계속하시겠습니까?")) return;

		deleteProductCategory(id);
		if (selectedCategory?.id === id) {
			setSelectedCategory(productCategories.find((c) => c.id !== id) ?? null);
			setSelectedBrand(null);
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
			updateProductBrand(selectedCategory.id, editingBrand.id, {
				name: brandForm.name,
			});
		} else {
			addProductBrand(selectedCategory.id, {
				name: brandForm.name,
			});
		}
		setModalType(null);
	};

	const handleDeleteBrand = (brandId: string): void => {
		if (selectedCategory === null) return;
		if (!confirm("브랜드와 모든 상품이 삭제됩니다. 계속하시겠습니까?")) return;

		deleteProductBrand(selectedCategory.id, brandId);
		if (selectedBrand?.id === brandId) {
			setSelectedBrand(null);
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

	const handleProductSubmit = (): void => {
		if (!productForm.name.trim() || !productForm.price || !selectedCategory || !selectedBrand)
			return;

		const price = parseInt(productForm.price);
		if (isNaN(price)) return;

		if (editingProduct !== null) {
			// 수정 모드
			if (USE_API) {
				updateProductMutation.mutate({
					id: Number(editingProduct.id),
					data: {
						name: productForm.name,
						default_retail_unit_price: price,
					},
				});
			}
			updateProductItem(selectedCategory.id, selectedBrand.id, editingProduct.id, {
				name: productForm.name,
				price,
			});
		} else {
			// 생성 모드
			if (USE_API) {
				createProductMutation.mutate({
					name: productForm.name,
					kind: selectedCategory.name,
					vendor_id: Number(selectedBrand.id),
					default_retail_unit_price: price,
				});
			}
			addProductItem(selectedCategory.id, selectedBrand.id, {
				name: productForm.name,
				price,
			});
		}
		setModalType(null);
	};

	const handleDeleteProduct = (productId: string): void => {
		if (selectedCategory === null || selectedBrand === null) return;
		if (!confirm("이 상품을 삭제하시겠습니까?")) return;

		deleteProductItem(selectedCategory.id, selectedBrand.id, productId);
	};

	return (
		<div className="flex-1 overflow-y-auto p-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">상품 관리</h1>
					<p className="mt-1 text-neutral-500">
						상품 카테고리, 브랜드, 상품을 관리합니다 (3단계 구조)
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
				{/* Categories Panel */}
				<div className="lg:col-span-1">
					<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
						<div className="flex items-center justify-between border-b border-neutral-200 p-4">
							<h2 className="font-bold text-neutral-800">카테고리</h2>
							<button
								onClick={openAddCategoryModal}
								className="text-primary-500 hover:bg-primary-50 rounded-lg p-2 transition-colors"
							>
								<span className="material-symbols-outlined">add</span>
							</button>
						</div>
						<div className="divide-y divide-neutral-100">
							{productCategories.map((cat) => (
								<button
									key={cat.id}
									onClick={() => {
										setSelectedCategory(cat);
										setSelectedBrand(cat.brands[0] ?? null);
									}}
									className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-neutral-50 ${
										selectedCategory?.id === cat.id ? "bg-primary-50" : ""
									}`}
								>
									<div className="flex items-center gap-3">
										<span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
										<span className="font-medium">{cat.name}</span>
									</div>
									<div className="flex gap-1">
										<span
											onClick={(e) => {
												e.stopPropagation();
												openEditCategoryModal(cat);
											}}
											className="hover:text-primary-500 cursor-pointer p-1 text-neutral-400"
										>
											<span className="material-symbols-outlined text-lg">edit</span>
										</span>
										<span
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteCategory(cat.id);
											}}
											className="cursor-pointer p-1 text-neutral-400 hover:text-red-500"
										>
											<span className="material-symbols-outlined text-lg">delete</span>
										</span>
									</div>
								</button>
							))}
						</div>
						{productCategories.length === 0 && (
							<div className="p-8 text-center text-sm text-neutral-400">카테고리가 없습니다</div>
						)}
					</div>
				</div>

				{/* Brands Panel */}
				<div className="lg:col-span-1">
					<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
						<div className="flex items-center justify-between border-b border-neutral-200 p-4">
							<h2 className="font-bold text-neutral-800">{currentCategory?.name ?? "브랜드"}</h2>
							{currentCategory && (
								<button
									onClick={openAddBrandModal}
									className="text-primary-500 hover:bg-primary-50 rounded-lg p-2 transition-colors"
								>
									<span className="material-symbols-outlined">add</span>
								</button>
							)}
						</div>
						<div className="divide-y divide-neutral-100">
							{currentCategory?.brands.map((brand) => (
								<button
									key={brand.id}
									onClick={() => {
										setSelectedBrand(brand);
									}}
									className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-neutral-50 ${
										selectedBrand?.id === brand.id ? "bg-primary-50" : ""
									}`}
								>
									<div className="flex items-center gap-2">
										<span className="font-medium">{brand.name}</span>
										<span className="text-sm text-neutral-400">({brand.items.length})</span>
									</div>
									<div className="flex gap-1">
										<span
											onClick={(e) => {
												e.stopPropagation();
												openEditBrandModal(brand);
											}}
											className="hover:text-primary-500 cursor-pointer p-1 text-neutral-400"
										>
											<span className="material-symbols-outlined text-lg">edit</span>
										</span>
										<span
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteBrand(brand.id);
											}}
											className="cursor-pointer p-1 text-neutral-400 hover:text-red-500"
										>
											<span className="material-symbols-outlined text-lg">delete</span>
										</span>
									</div>
								</button>
							))}
						</div>
						{!currentCategory && (
							<div className="p-8 text-center text-sm text-neutral-400">카테고리를 선택하세요</div>
						)}
						{currentCategory?.brands.length === 0 && (
							<div className="p-8 text-center text-sm text-neutral-400">브랜드가 없습니다</div>
						)}
					</div>
				</div>

				{/* Products Panel */}
				<div className="lg:col-span-2">
					<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
						<div className="flex items-center justify-between border-b border-neutral-200 p-4">
							<h2 className="font-bold text-neutral-800">{currentBrand?.name ?? "상품"}</h2>
							{currentBrand && (
								<button
									onClick={openAddProductModal}
									className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
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
										className="flex items-center justify-between p-4 hover:bg-neutral-50"
									>
										<div>
											<h3 className="font-medium text-neutral-800">{product.name}</h3>
											<span className="text-sm text-neutral-500">
												{product.price.toLocaleString()}원
											</span>
										</div>
										<div className="flex gap-1">
											<button
												onClick={() => {
													openEditProductModal(product);
												}}
												className="hover:bg-primary-50 hover:text-primary-500 rounded-lg p-2 text-neutral-400 transition-colors"
											>
												<span className="material-symbols-outlined text-xl">edit</span>
											</button>
											<button
												onClick={() => {
													handleDeleteProduct(product.id);
												}}
												className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
											>
												<span className="material-symbols-outlined text-xl">delete</span>
											</button>
										</div>
									</div>
								))}
								{currentBrand.items.length === 0 && (
									<div className="p-8 text-center text-neutral-400">등록된 상품이 없습니다</div>
								)}
							</div>
						) : (
							<div className="p-8 text-center text-neutral-400">브랜드를 선택하세요</div>
						)}
					</div>
				</div>
			</div>

			{/* Category Modal */}
			{modalType === "category" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingCategory ? "카테고리 수정" : "카테고리 추가"}
							</h2>
						</div>
						<div className="space-y-6 p-6">
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">이름</label>
								<input
									type="text"
									value={categoryForm.name}
									onChange={(e) => {
										setCategoryForm((prev) => ({
											...prev,
											name: e.target.value,
										}));
									}}
									placeholder="카테고리 이름"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">색상</label>
								<div className="flex flex-wrap gap-3">
									{COLOR_OPTIONS.map((color) => (
										<button
											key={color}
											onClick={() => {
												setCategoryForm((prev) => ({ ...prev, color }));
											}}
											className={`h-10 w-10 rounded-full transition-transform ${
												categoryForm.color === color
													? "ring-primary-500 scale-110 ring-2 ring-offset-2"
													: "hover:scale-105"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								onClick={() => {
									setModalType(null);
								}}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								취소
							</button>
							<button
								onClick={handleCategorySubmit}
								disabled={!categoryForm.name.trim()}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
							>
								{editingCategory ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Brand Modal */}
			{modalType === "brand" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingBrand ? "브랜드 수정" : "브랜드 추가"}
							</h2>
						</div>
						<div className="space-y-6 p-6">
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">브랜드명</label>
								<input
									type="text"
									value={brandForm.name}
									onChange={(e) => {
										setBrandForm((prev) => ({ ...prev, name: e.target.value }));
									}}
									placeholder="브랜드 이름"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								onClick={() => {
									setModalType(null);
								}}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								취소
							</button>
							<button
								onClick={handleBrandSubmit}
								disabled={!brandForm.name.trim()}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
							>
								{editingBrand ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Product Modal */}
			{modalType === "product" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white">
						<div className="border-b border-neutral-200 p-6">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingProduct ? "상품 수정" : "상품 추가"}
							</h2>
						</div>
						<div className="space-y-6 p-6">
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">상품명</label>
								<input
									type="text"
									value={productForm.name}
									onChange={(e) => {
										setProductForm((prev) => ({
											...prev,
											name: e.target.value,
										}));
									}}
									placeholder="상품 이름"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
							<div>
								<label className="mb-2 block text-sm font-bold text-neutral-700">가격</label>
								<input
									type="number"
									value={productForm.price}
									onChange={(e) => {
										setProductForm((prev) => ({
											...prev,
											price: e.target.value,
										}));
									}}
									placeholder="0"
									className="focus:ring-primary-500 w-full rounded-xl border border-neutral-200 px-4 py-3 focus:ring-2 focus:outline-none"
								/>
							</div>
						</div>
						<div className="flex justify-end gap-3 bg-neutral-50 p-6">
							<button
								onClick={() => {
									setModalType(null);
								}}
								className="rounded-xl px-4 py-2.5 font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
							>
								취소
							</button>
							<button
								onClick={handleProductSubmit}
								disabled={!productForm.name.trim() || !productForm.price}
								className="bg-primary-500 hover:bg-primary-600 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
