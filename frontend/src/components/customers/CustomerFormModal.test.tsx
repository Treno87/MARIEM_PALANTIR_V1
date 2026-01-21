import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Customer } from "../../contexts/CustomerContext";
import CustomerFormModal from "./CustomerFormModal";

describe("CustomerFormModal", () => {
	const mockOnClose = vi.fn();
	const mockOnSubmit = vi.fn();

	const defaultProps = {
		isOpen: true,
		onClose: mockOnClose,
		onSubmit: mockOnSubmit,
		mode: "create" as const,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("렌더링", () => {
		it("isOpen이 false일 때 null을 반환한다", () => {
			const { container } = render(<CustomerFormModal {...defaultProps} isOpen={false} />);
			expect(container.firstChild).toBeNull();
		});

		it("isOpen이 true일 때 모달을 렌더링한다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			expect(screen.getByRole("heading")).toBeInTheDocument();
		});

		it('create 모드에서 "고객 등록" 제목을 표시한다', () => {
			render(<CustomerFormModal {...defaultProps} mode="create" />);
			expect(screen.getByRole("heading")).toHaveTextContent("고객 등록");
		});

		it('edit 모드에서 "고객 수정" 제목을 표시한다', () => {
			render(<CustomerFormModal {...defaultProps} mode="edit" />);
			expect(screen.getByRole("heading")).toHaveTextContent("고객 수정");
		});

		it("필수 필드에 * 표시가 있다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const labels = screen.getAllByText("*");
			expect(labels).toHaveLength(2); // 이름, 전화번호
		});
	});

	describe("폼 유효성 검사", () => {
		it("이름과 전화번호가 비어있으면 등록 버튼이 비활성화된다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const submitButton = screen.getByRole("button", { name: "등록" });
			expect(submitButton).toBeDisabled();
		});

		it("이름만 입력하면 등록 버튼이 비활성화된다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const nameInput = screen.getByPlaceholderText("고객 이름");
			fireEvent.change(nameInput, { target: { value: "홍길동" } });

			const submitButton = screen.getByRole("button", { name: "등록" });
			expect(submitButton).toBeDisabled();
		});

		it("전화번호만 입력하면 등록 버튼이 비활성화된다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const phoneInput = screen.getByPlaceholderText("010-0000-0000");
			fireEvent.change(phoneInput, { target: { value: "010-1234-5678" } });

			const submitButton = screen.getByRole("button", { name: "등록" });
			expect(submitButton).toBeDisabled();
		});

		it("이름과 전화번호를 모두 입력하면 등록 버튼이 활성화된다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const nameInput = screen.getByPlaceholderText("고객 이름");
			const phoneInput = screen.getByPlaceholderText("010-0000-0000");

			fireEvent.change(nameInput, { target: { value: "홍길동" } });
			fireEvent.change(phoneInput, { target: { value: "010-1234-5678" } });

			const submitButton = screen.getByRole("button", { name: "등록" });
			expect(submitButton).not.toBeDisabled();
		});
	});

	describe("폼 제출", () => {
		it("유효한 폼 제출 시 onSubmit이 호출된다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const nameInput = screen.getByPlaceholderText("고객 이름");
			const phoneInput = screen.getByPlaceholderText("010-0000-0000");

			fireEvent.change(nameInput, { target: { value: "홍길동" } });
			fireEvent.change(phoneInput, { target: { value: "010-1234-5678" } });

			const submitButton = screen.getByRole("button", { name: "등록" });
			fireEvent.click(submitButton);

			expect(mockOnSubmit).toHaveBeenCalledWith({
				name: "홍길동",
				phone: "010-1234-5678",
				gender: "unspecified",
				birthDate: "",
				memo: "",
			});
		});

		it("폼 제출 후 onClose가 호출된다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const nameInput = screen.getByPlaceholderText("고객 이름");
			const phoneInput = screen.getByPlaceholderText("010-0000-0000");

			fireEvent.change(nameInput, { target: { value: "홍길동" } });
			fireEvent.change(phoneInput, { target: { value: "010-1234-5678" } });

			const submitButton = screen.getByRole("button", { name: "등록" });
			fireEvent.click(submitButton);

			expect(mockOnClose).toHaveBeenCalled();
		});

		it("취소 버튼 클릭 시 onClose가 호출된다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const cancelButton = screen.getByRole("button", { name: "취소" });
			fireEvent.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe("edit 모드", () => {
		const mockCustomer: Customer = {
			id: "1",
			name: "김철수",
			phone: "010-9876-5432",
			initials: "김철",
			gender: "male",
			birthDate: "1990-05-15",
			memo: "VIP 고객",
			status: "active",
			visitCount: 5,
			totalSpent: 500000,
			createdAt: "2026-01-01T00:00:00.000Z",
		};

		it("기존 고객 정보로 폼이 초기화된다", () => {
			render(<CustomerFormModal {...defaultProps} mode="edit" customer={mockCustomer} />);

			expect(screen.getByDisplayValue("김철수")).toBeInTheDocument();
			expect(screen.getByDisplayValue("010-9876-5432")).toBeInTheDocument();
			expect(screen.getByDisplayValue("1990-05-15")).toBeInTheDocument();
			expect(screen.getByDisplayValue("VIP 고객")).toBeInTheDocument();
		});

		it('edit 모드에서 버튼 텍스트가 "수정"이다', () => {
			render(<CustomerFormModal {...defaultProps} mode="edit" customer={mockCustomer} />);

			expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
		});

		it("수정된 데이터로 onSubmit이 호출된다", () => {
			render(<CustomerFormModal {...defaultProps} mode="edit" customer={mockCustomer} />);

			const nameInput = screen.getByDisplayValue("김철수");
			fireEvent.change(nameInput, { target: { value: "김영희" } });

			const submitButton = screen.getByRole("button", { name: "수정" });
			fireEvent.click(submitButton);

			expect(mockOnSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "김영희",
					phone: "010-9876-5432",
				}),
			);
		});
	});

	describe("폼 필드 입력", () => {
		it("성별을 선택할 수 있다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const genderSelect = screen.getByRole("combobox");

			fireEvent.change(genderSelect, { target: { value: "female" } });

			expect(genderSelect).toHaveValue("female");
		});

		it("메모를 입력할 수 있다", () => {
			render(<CustomerFormModal {...defaultProps} />);
			const memoTextarea = screen.getByPlaceholderText("특이사항, 알러지 정보 등");

			fireEvent.change(memoTextarea, { target: { value: "알러지 있음" } });

			expect(memoTextarea).toHaveValue("알러지 있음");
		});
	});
});
