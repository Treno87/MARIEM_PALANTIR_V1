import { BrowserRouter, Route, Routes } from "react-router-dom";
import EventsPage from "./components/catalog/EventsPage";
import MembershipPage from "./components/catalog/MembershipPage";
import ProductsPage from "./components/catalog/ProductsPage";
import ServicesPage from "./components/catalog/ServicesPage";
import LandingPage from "./components/landing/LandingPage";
import AppLayout from "./components/layout/AppLayout";
import SalePage from "./components/sale/SalePage";
import SalesPage from "./components/sales/SalesPage";
import StaffPage from "./components/staff/StaffPage";
import { CatalogProvider } from "./contexts/CatalogContext";
import { StaffProvider } from "./contexts/StaffContext";

function App() {
	return (
		<StaffProvider>
			<CatalogProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<LandingPage />} />
						<Route element={<AppLayout />}>
							<Route path="/sale" element={<SalePage />} />
							<Route path="/staff" element={<StaffPage />} />
							<Route path="/catalog/services" element={<ServicesPage />} />
							<Route path="/catalog/products" element={<ProductsPage />} />
							<Route path="/catalog/membership" element={<MembershipPage />} />
							<Route path="/catalog/events" element={<EventsPage />} />
							{/* Placeholder routes */}
							<Route path="/dashboard" element={<PlaceholderPage title="대시보드" />} />
							<Route path="/sales" element={<SalesPage />} />
							<Route path="/reports" element={<PlaceholderPage title="리포트" />} />
							<Route path="/customers" element={<PlaceholderPage title="고객 관리" />} />
							<Route path="/settings" element={<PlaceholderPage title="설정" />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</CatalogProvider>
		</StaffProvider>
	);
}

function PlaceholderPage({ title }: { title: string }) {
	return (
		<div className="flex flex-1 items-center justify-center">
			<div className="text-center">
				<span className="material-symbols-outlined mb-4 text-6xl text-neutral-300">
					construction
				</span>
				<h1 className="text-2xl font-bold text-neutral-400">{title}</h1>
				<p className="mt-2 text-neutral-400">준비 중입니다</p>
			</div>
		</div>
	);
}

export default App;
