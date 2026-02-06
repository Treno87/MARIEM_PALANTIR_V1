import {
	createContext,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { mockStaff } from "../components/sale/constants";
import type { Staff } from "../components/sale/types";
import { useStaffList } from "../hooks/useStaffApi";
import { USE_API } from "../lib/config";
import { mapApiStaffToStaff } from "../utils/apiMappers";
import { useAuth } from "./AuthContext";

interface StaffContextType {
	staffList: Staff[];
	activeStaff: Staff[];
	salesStaff: Staff[];
	isLoading: boolean;
	addStaff: (staff: Staff) => void;
	updateStaff: (id: string, updates: Partial<Staff>) => void;
	deleteStaff: (id: string) => void;
}

const StaffContext = createContext<StaffContextType | null>(null);

export function StaffProvider({ children }: { children: ReactNode }): ReactElement {
	const [localStaffList, setLocalStaffList] = useState<Staff[]>(mockStaff);

	// API 데이터 (USE_API=true 이고 인증된 상태일 때만 fetch)
	const { isAuthenticated } = useAuth();
	const staffQuery = useStaffList({ enabled: USE_API && isAuthenticated });
	const apiStaffList = useMemo((): Staff[] => {
		if (!USE_API || !staffQuery.data) return [];
		return staffQuery.data.map((s, i) => mapApiStaffToStaff(s, i));
	}, [staffQuery.data]);

	// 실제 사용할 staffList
	const staffList = USE_API ? apiStaffList : localStaffList;
	const isLoading = USE_API && staffQuery.isLoading;

	const activeStaff = useMemo(
		() => staffList.filter((s) => s.employmentStatus === "active"),
		[staffList],
	);

	const salesStaff = useMemo(() => activeStaff.filter((s) => s.showInSales), [activeStaff]);

	const addStaff = useCallback((staff: Staff) => {
		setLocalStaffList((prev) => [...prev, staff]);
	}, []);

	const updateStaff = useCallback((id: string, updates: Partial<Staff>) => {
		setLocalStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
	}, []);

	const deleteStaff = useCallback((id: string) => {
		setLocalStaffList((prev) => prev.filter((s) => s.id !== id));
	}, []);

	return (
		<StaffContext.Provider
			value={{
				staffList,
				activeStaff,
				salesStaff,
				isLoading,
				addStaff,
				updateStaff,
				deleteStaff,
			}}
		>
			{children}
		</StaffContext.Provider>
	);
}

export function useStaff(): StaffContextType {
	const context = useContext(StaffContext);
	if (context === null) {
		throw new Error("useStaff must be used within a StaffProvider");
	}
	return context;
}
