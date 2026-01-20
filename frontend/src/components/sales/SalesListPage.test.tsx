import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../test/test-utils";
import SalesListPage from "./SalesListPage";

// window.confirm mock
vi.stubGlobal(
	"confirm",
	vi.fn(() => true),
);

describe("SalesListPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("초기 렌더링", () => {
		it("거래 내역 제목이 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText("거래 내역")).toBeInTheDocument();
		});

		it("날짜 범위 필터가 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByLabelText("시작 날짜")).toBeInTheDocument();
			expect(screen.getByLabelText("종료 날짜")).toBeInTheDocument();
		});

		it("거래 목록 테이블이 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByRole("table")).toBeInTheDocument();
		});

		it("테이블 헤더에 필수 컬럼이 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText("날짜/시간")).toBeInTheDocument();
			expect(screen.getByText("고객")).toBeInTheDocument();
			expect(screen.getByText("담당")).toBeInTheDocument();
			expect(screen.getByText("항목")).toBeInTheDocument();
			expect(screen.getByText("금액")).toBeInTheDocument();
			expect(screen.getByText("상태")).toBeInTheDocument();
		});
	});

	describe("거래 목록 표시", () => {
		it("이번 달 거래 내역이 기본으로 표시된다", () => {
			render(<SalesListPage />);
			// 2026년 1월 샘플 데이터가 표시됨
			const completedItems = screen.getAllByText(/완료/);
			expect(completedItems.length).toBeGreaterThan(0);
		});

		it("거래가 없을 때 빈 상태 메시지가 표시된다", async () => {
			render(<SalesListPage />);
			// 데이터가 없는 기간으로 변경
			const startInput = screen.getByLabelText("시작 날짜");
			const endInput = screen.getByLabelText("종료 날짜");
			fireEvent.change(startInput, { target: { value: "2020-01-01" } });
			fireEvent.change(endInput, { target: { value: "2020-01-31" } });

			await waitFor(() => {
				expect(screen.getByText("해당 날짜의 거래 내역이 없습니다")).toBeInTheDocument();
			});
		});
	});

	describe("날짜 범위 필터", () => {
		it("시작 날짜를 변경하면 필터가 적용된다", async () => {
			render(<SalesListPage />);

			const startInput = screen.getByLabelText("시작 날짜");
			fireEvent.change(startInput, { target: { value: "2026-01-15" } });

			await waitFor(() => {
				expect(startInput).toHaveValue("2026-01-15");
			});
		});

		it("종료 날짜를 변경하면 필터가 적용된다", async () => {
			render(<SalesListPage />);

			const endInput = screen.getByLabelText("종료 날짜");
			fireEvent.change(endInput, { target: { value: "2026-01-19" } });

			await waitFor(() => {
				expect(endInput).toHaveValue("2026-01-19");
			});
		});
	});

	describe("거래 상세", () => {
		it("거래 행을 클릭하면 상세 정보가 표시된다", async () => {
			render(<SalesListPage />);

			// 기본적으로 이번 달 데이터가 표시됨 (여러 개의 완료 상태가 있음)
			const completedItems = screen.getAllByText(/완료/);
			expect(completedItems.length).toBeGreaterThan(0);

			// 첫 번째 거래 행 클릭
			const firstRow = screen.getAllByRole("row")[1]; // 헤더 제외
			fireEvent.click(firstRow);

			await waitFor(() => {
				// 상세 모달 표시
				expect(screen.getByText(/결제 내역/)).toBeInTheDocument();
			});
		});
	});

	describe("거래 취소", () => {
		it("취소 버튼을 클릭하면 확인 다이얼로그가 표시된다", () => {
			render(<SalesListPage />);

			// 기본적으로 이번 달 데이터가 표시됨 (여러 개의 완료 상태가 있음)
			const completedItems = screen.getAllByText(/완료/);
			expect(completedItems.length).toBeGreaterThan(0);

			// 취소 버튼 클릭
			const cancelButtons = screen.getAllByRole("button", { name: /취소/ });
			if (cancelButtons.length > 0) {
				fireEvent.click(cancelButtons[0]);
				expect(vi.mocked(confirm)).toHaveBeenCalled();
			}
		});
	});

	describe("합계 표시", () => {
		it("선택된 기간의 총 매출이 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText(/총 매출/)).toBeInTheDocument();
		});

		it("거래 건수가 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText("거래 건수")).toBeInTheDocument();
		});

		it("취소 건수가 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText("취소 건수")).toBeInTheDocument();
		});
	});
});
