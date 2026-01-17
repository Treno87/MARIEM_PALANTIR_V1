import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
	return (
		<div className="bg-neutral-50 text-neutral-800 antialiased flex overflow-hidden h-screen">
			<Sidebar />
			<div className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar">
				<Outlet />
			</div>
		</div>
	);
}
