import type { Customer as ApiCustomer, LineItem, Payment, StaffMember, Visit } from "../api/types";
import type { SaleRecord, SaleStatus, Staff } from "../components/sale/types";
import type { Customer } from "../contexts/CustomerContext";
import { getStaffColor } from "./staffColors";

const getInitials = (name: string): string => {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0]?.charAt(0) ?? "") + (parts[1]?.charAt(0) ?? "");
	}
	return name.substring(0, 2).toUpperCase();
};

/**
 * API Visit 응답을 Frontend SaleRecord로 변환
 */
export function mapVisitToSaleRecord(visit: Visit): SaleRecord {
	const status: SaleStatus = visit.voided ? "voided" : "completed";

	// line_items를 items로 변환
	const items = (visit.line_items ?? []).map((item: LineItem) => ({
		name: item.item_name,
		quantity: item.qty,
		unitPrice: item.list_unit_price,
		lineTotal: item.net_total,
		type: item.item_type as "service" | "product" | "topup",
	}));

	// payments 변환
	const payments = (visit.payments ?? []).map((payment: Payment) => ({
		method: payment.method_label,
		amount: payment.amount,
	}));

	// staff 정보 해석: API가 staff 필드를 제공하면 사용, 없으면 line_items에서 추출
	const staffInfo = visit.staff;
	const staffFromLineItem = (visit.line_items ?? []).find((li) => li.staff_id !== null);

	let staffId = "";
	let staffName = "미지정";
	if (staffInfo) {
		staffId = String(staffInfo.id);
		staffName = staffInfo.name;
	} else if (staffFromLineItem?.staff_id !== null && staffFromLineItem?.staff_id !== undefined) {
		staffId = String(staffFromLineItem.staff_id);
	}

	return {
		id: String(visit.id),
		saleDate: visit.visited_at.split("T")[0] ?? visit.visited_at,
		customer: {
			id: String(visit.customer.id),
			name: visit.customer.name,
			phone: visit.customer.phone,
			type: "returning",
		},
		staff: {
			id: staffId,
			name: staffName,
			color: getStaffColor(staffName),
		},
		items,
		subtotal: visit.subtotal_amount,
		discountAmount: visit.subtotal_amount - visit.total_amount,
		total: visit.total_amount,
		payments,
		status,
		createdAt: visit.visited_at,
	};
}

/**
 * SaleRecord의 staff 정보를 StaffMember 목록으로 보강
 * - staff가 이미 해석된 경우 스킵
 * - 이름 매칭으로 id/color 보강
 */
export function enrichSaleWithStaff(sale: SaleRecord, staffMembers: StaffMember[]): SaleRecord {
	if (sale.staff.id !== "" && sale.staff.name !== "미지정") return sale;

	const staffName = sale.staff.name;
	const matched = staffMembers.find((s) => s.name === staffName);
	if (matched) {
		return {
			...sale,
			staff: {
				id: String(matched.id),
				name: matched.name,
				color: getStaffColor(matched.name),
			},
		};
	}
	return {
		...sale,
		staff: { ...sale.staff, color: getStaffColor(staffName) },
	};
}

/**
 * API Customer → Frontend Customer (CustomerContext) 변환
 */
export function mapApiCustomerToCustomer(apiCustomer: ApiCustomer): Customer {
	const result: Customer = {
		id: String(apiCustomer.id),
		name: apiCustomer.name,
		phone: apiCustomer.phone,
		initials: getInitials(apiCustomer.name),
		totalSpent: apiCustomer.total_spent ?? 0,
		visitCount: apiCustomer.visit_count ?? 0,
		status: "active",
		createdAt: apiCustomer.created_at.split("T")[0] ?? apiCustomer.created_at,
	};
	if (apiCustomer.memo !== null) {
		result.memo = apiCustomer.memo;
	}
	if (apiCustomer.last_visit_at !== null && apiCustomer.last_visit_at !== undefined) {
		result.lastVisitDate = apiCustomer.last_visit_at.split("T")[0] ?? apiCustomer.last_visit_at;
	}
	return result;
}

/**
 * API StaffMember → Frontend Staff 변환
 */
export function mapApiStaffToStaff(apiStaff: StaffMember, index: number): Staff {
	return {
		id: String(apiStaff.id),
		name: apiStaff.name,
		role: "designer",
		phone: apiStaff.phone ?? undefined,
		color: getStaffColor(apiStaff.name),
		employmentStatus: apiStaff.active ? "active" : "resigned",
		showInSales: apiStaff.active,
		displayOrder: index + 1,
	};
}
