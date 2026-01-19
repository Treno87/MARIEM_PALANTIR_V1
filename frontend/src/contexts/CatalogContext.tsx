import {
	createContext,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import {
	discountEvents as initialDiscountEvents,
	membershipOptions as initialMembershipOptions,
	productCategories as initialProductCategories,
	serviceCategories as initialServiceCategories,
	storedValueOptions as initialStoredValueOptions,
} from "../components/sale/constants";
import type {
	DiscountEvent,
	MembershipOption,
	ProductBrand,
	ProductCategory,
	ProductItem,
	ServiceCategory,
	ServiceItem,
	StoredValueOption,
} from "../components/sale/types";

interface CatalogContextType {
	// 시술
	serviceCategories: ServiceCategory[];
	addServiceCategory: (category: Omit<ServiceCategory, "id" | "items">) => void;
	updateServiceCategory: (id: string, updates: Partial<ServiceCategory>) => void;
	deleteServiceCategory: (id: string) => void;
	addServiceItem: (categoryId: string, item: Omit<ServiceItem, "id">) => void;
	updateServiceItem: (categoryId: string, itemId: string, updates: Partial<ServiceItem>) => void;
	deleteServiceItem: (categoryId: string, itemId: string) => void;

	// 상품
	productCategories: ProductCategory[];
	addProductCategory: (category: Omit<ProductCategory, "id" | "brands">) => void;
	updateProductCategory: (id: string, updates: Partial<ProductCategory>) => void;
	deleteProductCategory: (id: string) => void;
	addProductBrand: (categoryId: string, brand: Omit<ProductBrand, "id" | "items">) => void;
	updateProductBrand: (categoryId: string, brandId: string, updates: Partial<ProductBrand>) => void;
	deleteProductBrand: (categoryId: string, brandId: string) => void;
	addProductItem: (categoryId: string, brandId: string, item: Omit<ProductItem, "id">) => void;
	updateProductItem: (
		categoryId: string,
		brandId: string,
		itemId: string,
		updates: Partial<ProductItem>,
	) => void;
	deleteProductItem: (categoryId: string, brandId: string, itemId: string) => void;

	// 정액권
	storedValueOptions: StoredValueOption[];
	addStoredValueOption: (option: Omit<StoredValueOption, "id">) => void;
	updateStoredValueOption: (id: string, updates: Partial<StoredValueOption>) => void;
	deleteStoredValueOption: (id: string) => void;

	// 정기권
	membershipOptions: MembershipOption[];
	addMembershipOption: (option: Omit<MembershipOption, "id">) => void;
	updateMembershipOption: (id: string, updates: Partial<MembershipOption>) => void;
	deleteMembershipOption: (id: string) => void;

	// 이벤트
	discountEvents: DiscountEvent[];
	addDiscountEvent: (event: Omit<DiscountEvent, "id">) => void;
	updateDiscountEvent: (id: string, updates: Partial<DiscountEvent>) => void;
	deleteDiscountEvent: (id: string) => void;
}

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }): ReactElement {
	// 시술 상태
	const [serviceCategories, setServiceCategories] =
		useState<ServiceCategory[]>(initialServiceCategories);

	// 상품 상태
	const [productCategories, setProductCategories] =
		useState<ProductCategory[]>(initialProductCategories);

	// 멤버쉽 상태
	const [storedValueOptions, setStoredValueOptions] =
		useState<StoredValueOption[]>(initialStoredValueOptions);
	const [membershipOptions, setMembershipOptions] =
		useState<MembershipOption[]>(initialMembershipOptions);

	// 이벤트 상태
	const [discountEvents, setDiscountEvents] = useState<DiscountEvent[]>(initialDiscountEvents);

	// 시술 카테고리 CRUD
	const addServiceCategory = useCallback(
		(category: Omit<ServiceCategory, "id" | "items">): void => {
			const newCategory: ServiceCategory = {
				...category,
				id: `cat-${String(Date.now())}`,
				items: [],
			};
			setServiceCategories((prev) => [...prev, newCategory]);
		},
		[],
	);

	const updateServiceCategory = useCallback(
		(id: string, updates: Partial<ServiceCategory>): void => {
			setServiceCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
		},
		[],
	);

	const deleteServiceCategory = useCallback((id: string): void => {
		setServiceCategories((prev) => prev.filter((c) => c.id !== id));
	}, []);

	// 시술 아이템 CRUD
	const addServiceItem = useCallback((categoryId: string, item: Omit<ServiceItem, "id">): void => {
		const newItem: ServiceItem = {
			...item,
			id: `s-${String(Date.now())}`,
		};
		setServiceCategories((prev) =>
			prev.map((c) => (c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c)),
		);
	}, []);

	const updateServiceItem = useCallback(
		(categoryId: string, itemId: string, updates: Partial<ServiceItem>): void => {
			setServiceCategories((prev) =>
				prev.map((c) =>
					c.id === categoryId
						? {
								...c,
								items: c.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
							}
						: c,
				),
			);
		},
		[],
	);

	const deleteServiceItem = useCallback((categoryId: string, itemId: string): void => {
		setServiceCategories((prev) =>
			prev.map((c) =>
				c.id === categoryId ? { ...c, items: c.items.filter((item) => item.id !== itemId) } : c,
			),
		);
	}, []);

	// 상품 카테고리 CRUD
	const addProductCategory = useCallback(
		(category: Omit<ProductCategory, "id" | "brands">): void => {
			const newCategory: ProductCategory = {
				...category,
				id: `pcat-${String(Date.now())}`,
				brands: [],
			};
			setProductCategories((prev) => [...prev, newCategory]);
		},
		[],
	);

	const updateProductCategory = useCallback(
		(id: string, updates: Partial<ProductCategory>): void => {
			setProductCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
		},
		[],
	);

	const deleteProductCategory = useCallback((id: string): void => {
		setProductCategories((prev) => prev.filter((c) => c.id !== id));
	}, []);

	// 상품 브랜드 CRUD
	const addProductBrand = useCallback(
		(categoryId: string, brand: Omit<ProductBrand, "id" | "items">): void => {
			const newBrand: ProductBrand = {
				...brand,
				id: `brand-${String(Date.now())}`,
				items: [],
			};
			setProductCategories((prev) =>
				prev.map((c) => (c.id === categoryId ? { ...c, brands: [...c.brands, newBrand] } : c)),
			);
		},
		[],
	);

	const updateProductBrand = useCallback(
		(categoryId: string, brandId: string, updates: Partial<ProductBrand>): void => {
			setProductCategories((prev) =>
				prev.map((c) =>
					c.id === categoryId
						? {
								...c,
								brands: c.brands.map((b) => (b.id === brandId ? { ...b, ...updates } : b)),
							}
						: c,
				),
			);
		},
		[],
	);

	const deleteProductBrand = useCallback((categoryId: string, brandId: string): void => {
		setProductCategories((prev) =>
			prev.map((c) =>
				c.id === categoryId ? { ...c, brands: c.brands.filter((b) => b.id !== brandId) } : c,
			),
		);
	}, []);

	// 상품 아이템 CRUD
	const addProductItem = useCallback(
		(categoryId: string, brandId: string, item: Omit<ProductItem, "id">): void => {
			const newItem: ProductItem = {
				...item,
				id: `p-${String(Date.now())}`,
			};
			setProductCategories((prev) =>
				prev.map((c) =>
					c.id === categoryId
						? {
								...c,
								brands: c.brands.map((b) =>
									b.id === brandId ? { ...b, items: [...b.items, newItem] } : b,
								),
							}
						: c,
				),
			);
		},
		[],
	);

	const updateProductItem = useCallback(
		(categoryId: string, brandId: string, itemId: string, updates: Partial<ProductItem>): void => {
			setProductCategories((prev) =>
				prev.map((c) =>
					c.id === categoryId
						? {
								...c,
								brands: c.brands.map((b) =>
									b.id === brandId
										? {
												...b,
												items: b.items.map((item) =>
													item.id === itemId ? { ...item, ...updates } : item,
												),
											}
										: b,
								),
							}
						: c,
				),
			);
		},
		[],
	);

	const deleteProductItem = useCallback(
		(categoryId: string, brandId: string, itemId: string): void => {
			setProductCategories((prev) =>
				prev.map((c) =>
					c.id === categoryId
						? {
								...c,
								brands: c.brands.map((b) =>
									b.id === brandId
										? {
												...b,
												items: b.items.filter((item) => item.id !== itemId),
											}
										: b,
								),
							}
						: c,
				),
			);
		},
		[],
	);

	// 정액권 CRUD
	const addStoredValueOption = useCallback((option: Omit<StoredValueOption, "id">): void => {
		const newOption: StoredValueOption = {
			...option,
			id: `sv-${String(Date.now())}`,
		};
		setStoredValueOptions((prev) => [...prev, newOption]);
	}, []);

	const updateStoredValueOption = useCallback(
		(id: string, updates: Partial<StoredValueOption>): void => {
			setStoredValueOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
		},
		[],
	);

	const deleteStoredValueOption = useCallback((id: string): void => {
		setStoredValueOptions((prev) => prev.filter((o) => o.id !== id));
	}, []);

	// 정기권 CRUD
	const addMembershipOption = useCallback((option: Omit<MembershipOption, "id">): void => {
		const newOption: MembershipOption = {
			...option,
			id: `mb-${String(Date.now())}`,
		};
		setMembershipOptions((prev) => [...prev, newOption]);
	}, []);

	const updateMembershipOption = useCallback(
		(id: string, updates: Partial<MembershipOption>): void => {
			setMembershipOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
		},
		[],
	);

	const deleteMembershipOption = useCallback((id: string): void => {
		setMembershipOptions((prev) => prev.filter((o) => o.id !== id));
	}, []);

	// 이벤트 CRUD
	const addDiscountEvent = useCallback((event: Omit<DiscountEvent, "id">): void => {
		const newEvent: DiscountEvent = {
			...event,
			id: `ev-${String(Date.now())}`,
		};
		setDiscountEvents((prev) => [...prev, newEvent]);
	}, []);

	const updateDiscountEvent = useCallback((id: string, updates: Partial<DiscountEvent>): void => {
		setDiscountEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
	}, []);

	const deleteDiscountEvent = useCallback((id: string): void => {
		setDiscountEvents((prev) => prev.filter((e) => e.id !== id));
	}, []);

	const value: CatalogContextType = {
		// 시술
		serviceCategories,
		addServiceCategory,
		updateServiceCategory,
		deleteServiceCategory,
		addServiceItem,
		updateServiceItem,
		deleteServiceItem,

		// 상품
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

		// 정액권
		storedValueOptions,
		addStoredValueOption,
		updateStoredValueOption,
		deleteStoredValueOption,

		// 정기권
		membershipOptions,
		addMembershipOption,
		updateMembershipOption,
		deleteMembershipOption,

		// 이벤트
		discountEvents,
		addDiscountEvent,
		updateDiscountEvent,
		deleteDiscountEvent,
	};

	return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextType {
	const context = useContext(CatalogContext);
	if (!context) {
		throw new Error("useCatalog must be used within a CatalogProvider");
	}
	return context;
}
