import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./components/landing/LandingPage";
import AppLayout from "./components/layout/AppLayout";
import SalePage from "./components/sale/SalePage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route element={<AppLayout />}>
					<Route path="/sale" element={<SalePage />} />
					{/* TODO: 추가 라우트 */}
					<Route
						path="/dashboard"
						element={<PlaceholderPage title="대시보드" />}
					/>
					<Route
						path="/sales"
						element={<PlaceholderPage title="거래 내역" />}
					/>
					<Route path="/reports" element={<PlaceholderPage title="리포트" />} />
					<Route
						path="/customers"
						element={<PlaceholderPage title="고객 관리" />}
					/>
					<Route
						path="/catalog"
						element={<PlaceholderPage title="시술/상품" />}
					/>
					<Route path="/settings" element={<PlaceholderPage title="설정" />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

// 임시 페이지 컴포넌트
function PlaceholderPage({ title }: { title: string }) {
	return (
		<div className="flex-1 flex items-center justify-center">
			<div className="text-center">
				<span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">
					construction
				</span>
				<h1 className="text-2xl font-bold text-neutral-400">{title}</h1>
				<p className="text-neutral-400 mt-2">준비 중입니다</p>
			</div>
		</div>
	);
}

export default App;
