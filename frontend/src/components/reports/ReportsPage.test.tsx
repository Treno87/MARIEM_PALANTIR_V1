import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../test/test-utils";
import ReportsPage from "./ReportsPage";

describe("ReportsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("초기 렌더링", () => {
		it("리포트 제목이 표시된다", () => {
			render(<ReportsPage />);
			expect(screen.getByText("리포트")).toBeInTheDocument();
		});

		it("기간 선택 필터가 표시된다", () => {
			render(<ReportsPage />);
			expect(screen.getByText("오늘")).toBeInTheDocument();
			expect(screen.getByText("이번 주")).toBeInTheDocument();
			expect(screen.getByText("이번 달")).toBeInTheDocument();
		});

		it("매출 요약 카드가 표시된다", () => {
			render(<ReportsPage />);
			expect(screen.getByText("총 매출")).toBeInTheDocument();
			expect(screen.getByText("거래 건수")).toBeInTheDocument();
			expect(screen.getByText("평균 객단가")).toBeInTheDocument();
		});
	});

	describe("기간 필터", () => {
		it("오늘 버튼을 클릭하면 오늘 날짜의 데이터가 표시된다", async () => {
			render(<ReportsPage />);

			const todayButton = screen.getByRole("button", { name: "오늘" });
			fireEvent.click(todayButton);

			await waitFor(() => {
				expect(todayButton).toHaveClass("bg-neutral-800");
			});
		});

		it("이번 주 버튼을 클릭하면 해당 기간의 데이터가 표시된다", async () => {
			render(<ReportsPage />);

			const weekButton = screen.getByRole("button", { name: "이번 주" });
			fireEvent.click(weekButton);

			await waitFor(() => {
				expect(weekButton).toHaveClass("bg-neutral-800");
			});
		});
	});

	describe("담당자별 매출", () => {
		it("담당자별 매출 섹션이 표시된다", () => {
			render(<ReportsPage />);
			expect(screen.getByText("담당자별 매출")).toBeInTheDocument();
		});
	});

	describe("결제수단별 매출", () => {
		it("결제수단별 매출 섹션이 표시된다", () => {
			render(<ReportsPage />);
			expect(screen.getByText("결제수단별 매출")).toBeInTheDocument();
		});
	});

	describe("시술/상품 분석", () => {
		it("인기 시술 TOP 5 섹션이 표시된다", () => {
			render(<ReportsPage />);
			expect(screen.getByText("인기 시술 TOP 5")).toBeInTheDocument();
		});
	});

	describe("고객 분석", () => {
		it("신규/재방문 비율이 표시된다", () => {
			render(<ReportsPage />);
			expect(screen.getByText("고객 유형")).toBeInTheDocument();
		});
	});
});
