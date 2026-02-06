import { useQuery } from "@tanstack/react-query";
import { staffMembersApi } from "../api/endpoints";
import type { StaffMember } from "../api/types";

export const staffKeys = {
	all: ["staff"] as const,
	list: () => [...staffKeys.all, "list"] as const,
	detail: (id: number) => [...staffKeys.all, "detail", id] as const,
};

export function useStaffList(options?: { enabled?: boolean }) {
	return useQuery<StaffMember[]>({
		queryKey: staffKeys.list(),
		queryFn: staffMembersApi.list,
		enabled: options?.enabled ?? true,
	});
}

export function useStaffMember(id: number) {
	return useQuery({
		queryKey: staffKeys.detail(id),
		queryFn: () => staffMembersApi.get(id),
		enabled: id > 0,
	});
}
