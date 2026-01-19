import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../test/test-utils";
import SalePage from "./SalePage";

// window.alert mock
vi.stubGlobal("alert", vi.fn());

describe("SalePage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("초기 렌더링", () => {
		it("거래 입력 페이지가 렌더링된다", () => {
			render(<SalePage />);
			expect(screen.getByText("거래 입력")).toBeInTheDocument();
		});

		it("고객 선택 영역이 표시된다", () => {
			render(<SalePage />);
			expect(screen.getByText("고객 선택")).toBeInTheDocument();
		});

		it("디자이너 선택 영역이 표시된다", () => {
			render(<SalePage />);
			expect(screen.getByText("담당")).toBeInTheDocument();
		});

		it("시술 탭이 기본으로 선택되어 시술 카테고리가 표시된다", () => {
			render(<SalePage />);
			expect(screen.getByText("커트")).toBeInTheDocument();
		});

		it("초기화 버튼이 표시된다", () => {
			render(<SalePage />);
			expect(screen.getByText("초기화")).toBeInTheDocument();
		});

		it("거래 저장 버튼이 표시된다", () => {
			render(<SalePage />);
			expect(screen.getByRole("button", { name: /거래 저장/ })).toBeInTheDocument();
		});
	});

	describe("탭 전환", () => {
		it("상품 탭을 클릭하면 상품 카테고리가 표시된다", () => {
			render(<SalePage />);
			const productTab = screen.getByRole("button", { name: /상품/ });
			fireEvent.click(productTab);

			expect(screen.getByText("헤어케어")).toBeInTheDocument();
		});

		it("멤버쉽 탭을 클릭하면 멤버쉽 관련 내용이 표시된다", () => {
			render(<SalePage />);
			const membershipTab = screen.getByRole("button", { name: /멤버쉽/ });
			fireEvent.click(membershipTab);

			// 멤버쉽 탭이 활성화됨 (보라색 테마)
			expect(membershipTab).toHaveClass("text-[#a25ddc]");
		});
	});

	describe("고객 선택", () => {
		it("고객 선택을 클릭하면 드롭다운이 열린다", async () => {
			render(<SalePage />);

			const customerSelectButton = screen.getByText("고객 선택");
			fireEvent.click(customerSelectButton);

			await waitFor(() => {
				expect(screen.getByPlaceholderText("검색...")).toBeInTheDocument();
			});
		});

		it("고객을 선택하면 고객 전화번호가 표시된다", async () => {
			render(<SalePage />);

			const customerSelectButton = screen.getByText("고객 선택");
			fireEvent.click(customerSelectButton);

			await waitFor(() => {
				expect(screen.getByPlaceholderText("검색...")).toBeInTheDocument();
			});

			const customerOption = screen.getByText("김민지");
			fireEvent.click(customerOption);

			await waitFor(() => {
				expect(screen.getByText("010-1234-5678")).toBeInTheDocument();
			});
		});

		it("신규 고객 등록 버튼이 드롭다운에 표시된다", async () => {
			render(<SalePage />);

			const customerSelectButton = screen.getByText("고객 선택");
			fireEvent.click(customerSelectButton);

			await waitFor(() => {
				expect(screen.getByText("신규 고객 등록")).toBeInTheDocument();
			});
		});
	});

	describe("거래 저장", () => {
		it("카트가 비어있으면 저장 버튼이 비활성화된다", () => {
			render(<SalePage />);

			const saveButton = screen.getByRole("button", { name: /거래 저장/ });
			expect(saveButton).toBeDisabled();
		});
	});

	describe("디자이너 선택", () => {
		it("기본 디자이너가 선택되어 있다", () => {
			render(<SalePage />);
			// 첫 번째 디자이너 (김정희)가 선택된 상태
			const designerButton = screen.getByRole("button", { name: "김정희" });
			expect(designerButton).toHaveClass("text-white");
		});

		it("다른 디자이너를 선택할 수 있다", () => {
			render(<SalePage />);
			const anotherDesigner = screen.getByRole("button", { name: "박수민" });
			fireEvent.click(anotherDesigner);

			expect(anotherDesigner).toHaveClass("text-white");
		});
	});
});
