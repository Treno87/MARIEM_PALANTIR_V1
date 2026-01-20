import type { LineItem, Payment, Visit } from "../api/types";
import type { SaleRecord, SaleStatus } from "../components/sale/types";

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

	return {
		id: String(visit.id),
		saleDate: visit.visited_at.split("T")[0] ?? visit.visited_at,
		customer: {
			id: String(visit.customer.id),
			name: visit.customer.name,
			phone: visit.customer.phone,
			type: "returning", // API에서 제공하지 않으므로 기본값
		},
		staff: {
			id: "", // Visit 목록에서는 staff 정보가 없음
			name: "미지정", // TODO: API에서 staff 정보 제공 시 수정
			color: "#6b7280", // 기본 색상
		},
		items,
		subtotal: visit.subtotal_amount,
		discountAmount: visit.subtotal_amount - visit.total_amount,
		total: visit.total_amount,
		payments,
		status,
		createdAt: visit.created_at,
	};
}
