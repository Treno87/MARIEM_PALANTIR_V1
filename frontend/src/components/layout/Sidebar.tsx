import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
	icon: string;
	label: string;
	path: string;
	filled?: boolean;
}

interface SubMenuItem {
	icon: string;
	label: string;
	path: string;
}

interface CollapsibleNavItem {
	icon: string;
	label: string;
	basePath: string;
	subItems: SubMenuItem[];
}

const mainNavItems: NavItem[] = [
	{ icon: "dashboard", label: "대시보드", path: "/dashboard" },
	{ icon: "point_of_sale", label: "거래 입력", path: "/sale", filled: true },
	{ icon: "receipt_long", label: "거래 내역", path: "/sales" },
	{ icon: "analytics", label: "리포트", path: "/reports" },
];

const managementNavItems: NavItem[] = [
	{ icon: "group", label: "고객 관리", path: "/customers" },
	{ icon: "badge", label: "직원 관리", path: "/staff" },
];

const catalogMenu: CollapsibleNavItem = {
	icon: "inventory_2",
	label: "카탈로그",
	basePath: "/catalog",
	subItems: [
		{ icon: "content_cut", label: "시술 관리", path: "/catalog/services" },
		{ icon: "shopping_bag", label: "상품 관리", path: "/catalog/products" },
		{ icon: "card_membership", label: "멤버쉽", path: "/catalog/membership" },
		{ icon: "local_offer", label: "이벤트", path: "/catalog/events" },
	],
};

const accountItems: NavItem[] = [
	{ icon: "settings", label: "설정", path: "/settings" },
];

function NavLinkItem({ item }: { item: NavItem }) {
	return (
		<NavLink
			to={item.path}
			className={({ isActive }) =>
				`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
					isActive
						? "bg-primary-500/10 text-primary-500"
						: "text-neutral-500 hover:bg-neutral-50"
				}`
			}
		>
			{({ isActive }) => (
				<>
					<span
						className="material-symbols-outlined"
						style={
							isActive && item.filled
								? { fontVariationSettings: "'FILL' 1" }
								: undefined
						}
					>
						{item.icon}
					</span>
					<span className="text-sm font-bold">{item.label}</span>
				</>
			)}
		</NavLink>
	);
}

function CollapsibleMenu({ menu }: { menu: CollapsibleNavItem }) {
	const location = useLocation();
	const isInCatalog = location.pathname.startsWith(menu.basePath);
	const [isOpen, setIsOpen] = useState(isInCatalog);

	return (
		<div>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
					isInCatalog
						? "bg-primary-500/10 text-primary-500"
						: "text-neutral-500 hover:bg-neutral-50"
				}`}
			>
				<span className="material-symbols-outlined">{menu.icon}</span>
				<span className="text-sm font-bold flex-1 text-left">{menu.label}</span>
				<span
					className={`material-symbols-outlined text-lg transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				>
					expand_more
				</span>
			</button>
			{isOpen && (
				<div className="ml-4 mt-1 space-y-1">
					{menu.subItems.map((subItem) => (
						<NavLink
							key={subItem.path}
							to={subItem.path}
							className={({ isActive }) =>
								`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
									isActive
										? "bg-primary-500/10 text-primary-500"
										: "text-neutral-500 hover:bg-neutral-50"
								}`
							}
						>
							<span className="material-symbols-outlined text-xl">
								{subItem.icon}
							</span>
							<span className="text-sm font-medium">{subItem.label}</span>
						</NavLink>
					))}
				</div>
			)}
		</div>
	);
}

export default function Sidebar() {
	return (
		<aside className="w-[280px] bg-white border-r border-neutral-200 flex flex-col h-full overflow-y-auto no-scrollbar shrink-0">
			{/* Logo */}
			<div className="p-6 flex items-center gap-3">
				<div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
					<span className="material-symbols-outlined text-white text-lg">
						spa
					</span>
				</div>
				<span className="font-extrabold text-xl tracking-tight text-primary-500">
					Mariem
				</span>
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-4 space-y-1 pb-6">
				{/* Main navigation */}
				<div className="space-y-1">
					{mainNavItems.map((item) => (
						<NavLinkItem key={item.path} item={item} />
					))}
				</div>

				{/* Management section */}
				<div className="pt-4 mt-4 border-t border-neutral-200">
					<p className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
						관리
					</p>
					<div className="space-y-1">
						{managementNavItems.map((item) => (
							<NavLinkItem key={item.path} item={item} />
						))}
					</div>
				</div>

				{/* Catalog section */}
				<div className="pt-4 mt-4 border-t border-neutral-200">
					<p className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
						판매 항목
					</p>
					<CollapsibleMenu menu={catalogMenu} />
				</div>

				{/* Account section */}
				<div className="pt-4 mt-4 border-t border-neutral-200">
					<p className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
						계정
					</p>
					{accountItems.map((item) => (
						<NavLinkItem key={item.path} item={item} />
					))}
					<button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all">
						<span className="material-symbols-outlined">logout</span>
						<span className="text-sm font-bold">로그아웃</span>
					</button>
				</div>
			</nav>

			{/* User info */}
			<div className="p-4 border-t border-neutral-200">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-600 font-bold">
						JH
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-bold text-neutral-800 truncate">
							김정희
						</p>
						<p className="text-xs text-neutral-500 truncate">
							헤어라운지 강남점
						</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
