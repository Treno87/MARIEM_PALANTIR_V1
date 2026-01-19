import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { mockStaff } from "../components/sale/constants";
import type { Staff } from "../components/sale/types";

interface StaffContextType {
	staffList: Staff[];
	activeStaff: Staff[];
	salesStaff: Staff[];
	addStaff: (staff: Staff) => void;
	updateStaff: (id: string, updates: Partial<Staff>) => void;
	deleteStaff: (id: string) => void;
}

const StaffContext = createContext<StaffContextType | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
	const [staffList, setStaffList] = useState<Staff[]>(mockStaff);

	const activeStaff = useMemo(
		() => staffList.filter((s) => s.employmentStatus === "active"),
		[staffList],
	);

	const salesStaff = useMemo(() => activeStaff.filter((s) => s.showInSales), [activeStaff]);

	const addStaff = useCallback((staff: Staff) => {
		setStaffList((prev) => [...prev, staff]);
	}, []);

	const updateStaff = useCallback((id: string, updates: Partial<Staff>) => {
		setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
	}, []);

	const deleteStaff = useCallback((id: string) => {
		setStaffList((prev) => prev.filter((s) => s.id !== id));
	}, []);

	return (
		<StaffContext.Provider
			value={{
				staffList,
				activeStaff,
				salesStaff,
				addStaff,
				updateStaff,
				deleteStaff,
			}}
		>
			{children}
		</StaffContext.Provider>
	);
}

export function useStaff() {
	const context = useContext(StaffContext);
	if (!context) {
		throw new Error("useStaff must be used within a StaffProvider");
	}
	return context;
}
