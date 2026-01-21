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
	{ icon: "calendar_month", label: "예약관리", path: "/reservations" },
	{ icon: "analytics", label: "리포트", path: "/reports" },
];

const managementNavItems: NavItem[] = [
	{ icon: "group", label: "고객 관리", path: "/customers" },
	{ icon: "campaign", label: "마케팅 관리", path: "/marketing" },
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

const accountItems: NavItem[] = [{ icon: "settings", label: "설정", path: "/settings" }];

function NavLinkItem({ item }: { item: NavItem }) {
	return (
		<NavLink
			to={item.path}
			className={({ isActive }) =>
				`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
					isActive ? "bg-primary-500/10 text-primary-500" : "text-neutral-500 hover:bg-neutral-50"
				}`
			}
		>
			{({ isActive }) => (
				<>
					<span
						className="material-symbols-outlined"
						style={isActive && item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
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
				onClick={() => {
					setIsOpen(!isOpen);
				}}
				className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
					isInCatalog
						? "bg-primary-500/10 text-primary-500"
						: "text-neutral-500 hover:bg-neutral-50"
				}`}
			>
				<span className="material-symbols-outlined">{menu.icon}</span>
				<span className="flex-1 text-left text-sm font-bold">{menu.label}</span>
				<span
					className={`material-symbols-outlined text-lg transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				>
					expand_more
				</span>
			</button>
			{isOpen && (
				<div className="mt-1 ml-4 space-y-1">
					{menu.subItems.map((subItem) => (
						<NavLink
							key={subItem.path}
							to={subItem.path}
							className={({ isActive }) =>
								`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
									isActive
										? "bg-primary-500/10 text-primary-500"
										: "text-neutral-500 hover:bg-neutral-50"
								}`
							}
						>
							<span className="material-symbols-outlined text-xl">{subItem.icon}</span>
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
		<aside className="no-scrollbar flex h-full w-[280px] shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white">
			{/* Logo */}
			<div className="flex items-center gap-3 p-6">
				<div className="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg">
					<span className="material-symbols-outlined text-lg text-white">spa</span>
				</div>
				<span className="text-primary-500 text-xl font-extrabold tracking-tight">Mariem</span>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 px-4 pb-6">
				{/* Main navigation */}
				<div className="space-y-1">
					{mainNavItems.map((item) => (
						<NavLinkItem key={item.path} item={item} />
					))}
				</div>

				{/* Management section */}
				<div className="mt-4 border-t border-neutral-200 pt-4">
					<p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
						관리
					</p>
					<div className="space-y-1">
						{managementNavItems.map((item) => (
							<NavLinkItem key={item.path} item={item} />
						))}
					</div>
				</div>

				{/* Catalog section */}
				<div className="mt-4 border-t border-neutral-200 pt-4">
					<p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
						판매 항목
					</p>
					<CollapsibleMenu menu={catalogMenu} />
				</div>

				{/* Account section */}
				<div className="mt-4 border-t border-neutral-200 pt-4">
					<p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
						계정
					</p>
					{accountItems.map((item) => (
						<NavLinkItem key={item.path} item={item} />
					))}
					<button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 transition-all hover:bg-red-50">
						<span className="material-symbols-outlined">logout</span>
						<span className="text-sm font-bold">로그아웃</span>
					</button>
				</div>
			</nav>

			{/* User info */}
			<div className="border-t border-neutral-200 p-4">
				<div className="flex items-center gap-3">
					<div className="bg-accent-500/20 text-accent-600 flex h-10 w-10 items-center justify-center rounded-full font-bold">
						JH
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-bold text-neutral-800">김정희</p>
						<p className="truncate text-xs text-neutral-500">헤어라운지 강남점</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
