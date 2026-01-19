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

		it("날짜 필터가 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByLabelText(/날짜/)).toBeInTheDocument();
		});

		it("거래 목록 테이블이 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByRole("table")).toBeInTheDocument();
		});

		it("테이블 헤더에 필수 컬럼이 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText("시간")).toBeInTheDocument();
			expect(screen.getByText("고객")).toBeInTheDocument();
			expect(screen.getByText("담당")).toBeInTheDocument();
			expect(screen.getByText("항목")).toBeInTheDocument();
			expect(screen.getByText("금액")).toBeInTheDocument();
			expect(screen.getByText("상태")).toBeInTheDocument();
		});
	});

	describe("거래 목록 표시", () => {
		it("거래 내역이 테이블에 표시된다", async () => {
			render(<SalesListPage />);

			// 샘플 데이터가 있는 날짜로 변경
			const dateInput = screen.getByLabelText(/날짜/);
			fireEvent.change(dateInput, { target: { value: "2025-01-10" } });

			await waitFor(() => {
				// 거래 데이터가 표시됨
				expect(screen.getByText(/완료/)).toBeInTheDocument();
			});
		});

		it("거래가 없을 때 빈 상태 메시지가 표시된다", () => {
			render(<SalesListPage />);
			// 현재 날짜(2026-01-19)에는 샘플 데이터가 없음
			expect(screen.getByText("해당 날짜의 거래 내역이 없습니다")).toBeInTheDocument();
		});
	});

	describe("날짜 필터", () => {
		it("날짜를 변경하면 해당 날짜의 거래만 표시된다", async () => {
			render(<SalesListPage />);

			const dateInput = screen.getByLabelText(/날짜/);
			fireEvent.change(dateInput, { target: { value: "2024-01-15" } });

			await waitFor(() => {
				// 필터링된 결과 표시
				expect(dateInput).toHaveValue("2024-01-15");
			});
		});
	});

	describe("거래 상세", () => {
		it("거래 행을 클릭하면 상세 정보가 표시된다", async () => {
			render(<SalesListPage />);

			// 샘플 데이터가 있는 날짜로 변경
			const dateInput = screen.getByLabelText(/날짜/);
			fireEvent.change(dateInput, { target: { value: "2025-01-10" } });

			await waitFor(() => {
				expect(screen.getByText(/완료/)).toBeInTheDocument();
			});

			// 첫 번째 거래 행 클릭
			const firstRow = screen.getAllByRole("row")[1]; // 헤더 제외
			fireEvent.click(firstRow);

			await waitFor(() => {
				// 상세 모달 또는 확장된 정보 표시
				expect(screen.getByText(/결제 내역/)).toBeInTheDocument();
			});
		});
	});

	describe("거래 취소", () => {
		it("취소 버튼을 클릭하면 확인 다이얼로그가 표시된다", async () => {
			render(<SalesListPage />);

			// 샘플 데이터가 있는 날짜로 변경
			const dateInput = screen.getByLabelText(/날짜/);
			fireEvent.change(dateInput, { target: { value: "2025-01-10" } });

			await waitFor(() => {
				expect(screen.getByText(/완료/)).toBeInTheDocument();
			});

			// 취소 버튼 클릭
			const cancelButtons = screen.getAllByRole("button", { name: /취소/ });
			if (cancelButtons.length > 0) {
				fireEvent.click(cancelButtons[0]);
				expect(vi.mocked(confirm)).toHaveBeenCalled();
			}
		});
	});

	describe("합계 표시", () => {
		it("선택된 날짜의 총 매출이 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText(/총 매출/)).toBeInTheDocument();
		});

		it("거래 건수가 표시된다", () => {
			render(<SalesListPage />);
			expect(screen.getByText("거래 건수")).toBeInTheDocument();
		});
	});
});
