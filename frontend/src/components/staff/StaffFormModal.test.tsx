import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { render } from "../../test/test-utils";
import type { Staff } from "../sale/types";
import StaffFormModal from "./StaffFormModal";

const mockStaff: Staff = {
	id: "staff-1",
	name: "김디자이너",
	role: "designer",
	phone: "010-1234-5678",
	color: "#00c875",
	joinDate: "2024-01-15",
	employmentStatus: "active",
	showInSales: true,
	displayOrder: 1,
	gender: "female",
	birthDate: "1990-05-20",
	address: "서울시 강남구",
	memo: "테스트 메모",
	permissions: {
		sales: true,
		customers: true,
		reports: false,
		settings: false,
	},
};

describe("StaffFormModal", () => {
	const defaultProps = {
		isOpen: true,
		onClose: vi.fn(),
		onSubmit: vi.fn(),
		mode: "create" as const,
	};

	describe("렌더링", () => {
		it("isOpen이 false면 모달이 렌더링되지 않는다", () => {
			render(<StaffFormModal {...defaultProps} isOpen={false} />);

			expect(screen.queryByText("직원 추가")).not.toBeInTheDocument();
		});

		it("생성 모드에서 '직원 추가' 타이틀이 표시된다", () => {
			render(<StaffFormModal {...defaultProps} mode="create" />);

			expect(screen.getByText("직원 추가")).toBeInTheDocument();
		});

		it("수정 모드에서 '직원 수정' 타이틀이 표시된다", () => {
			render(<StaffFormModal {...defaultProps} mode="edit" staff={mockStaff} />);

			expect(screen.getByText("직원 수정")).toBeInTheDocument();
		});

		it("수정 모드에서 기존 직원 정보가 폼에 채워진다", () => {
			render(<StaffFormModal {...defaultProps} mode="edit" staff={mockStaff} />);

			expect(screen.getByDisplayValue("김디자이너")).toBeInTheDocument();
			expect(screen.getByDisplayValue("010-1234-5678")).toBeInTheDocument();
		});
	});

	describe("폼 유효성 검사", () => {
		it("이름이 비어있으면 저장 버튼이 비활성화된다", () => {
			render(<StaffFormModal {...defaultProps} mode="create" />);

			const submitButton = screen.getByRole("button", { name: "추가" });
			expect(submitButton).toBeDisabled();
		});

		it("이름을 입력하면 저장 버튼이 활성화된다", async () => {
			render(<StaffFormModal {...defaultProps} mode="create" />);

			const nameInput = screen.getByPlaceholderText("직원 이름");
			await userEvent.type(nameInput, "새직원");

			const submitButton = screen.getByRole("button", { name: "추가" });
			expect(submitButton).not.toBeDisabled();
		});
	});

	describe("폼 제출", () => {
		it("생성 모드에서 폼 제출 시 onSubmit이 호출된다", async () => {
			const onSubmit = vi.fn();
			render(<StaffFormModal {...defaultProps} onSubmit={onSubmit} mode="create" />);

			const nameInput = screen.getByPlaceholderText("직원 이름");
			await userEvent.type(nameInput, "새직원");

			const submitButton = screen.getByRole("button", { name: "추가" });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledTimes(1);
				expect(onSubmit).toHaveBeenCalledWith(
					expect.objectContaining({
						name: "새직원",
						role: "designer",
						showInSales: true,
					}),
				);
			});
		});

		it("수정 모드에서 폼 제출 시 수정된 데이터로 onSubmit이 호출된다", async () => {
			const onSubmit = vi.fn();
			render(
				<StaffFormModal {...defaultProps} onSubmit={onSubmit} mode="edit" staff={mockStaff} />,
			);

			const nameInput = screen.getByDisplayValue("김디자이너");
			await userEvent.clear(nameInput);
			await userEvent.type(nameInput, "박디자이너");

			const submitButton = screen.getByRole("button", { name: "수정" });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith(
					expect.objectContaining({
						name: "박디자이너",
					}),
				);
			});
		});
	});

	describe("취소 동작", () => {
		it("취소 버튼 클릭 시 onClose가 호출된다", () => {
			const onClose = vi.fn();
			render(<StaffFormModal {...defaultProps} onClose={onClose} />);

			const cancelButton = screen.getByRole("button", { name: "취소" });
			fireEvent.click(cancelButton);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe("직급 변경", () => {
		it("직급 변경 시 해당 직급의 기본 권한이 설정된다", async () => {
			const onSubmit = vi.fn();
			render(<StaffFormModal {...defaultProps} onSubmit={onSubmit} mode="create" />);

			const nameInput = screen.getByPlaceholderText("직원 이름");
			await userEvent.type(nameInput, "새직원");

			// 직급을 owner로 변경
			const roleSelect = screen.getByDisplayValue("디자이너");
			await userEvent.selectOptions(roleSelect, "owner");

			const submitButton = screen.getByRole("button", { name: "추가" });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledTimes(1);
			});

			const callArgs = onSubmit.mock.calls[0];
			if (callArgs === undefined) {
				throw new Error("onSubmit was not called");
			}
			const calledWith = callArgs[0] as {
				role: string;
				permissions: {
					sales: boolean;
					customers: boolean;
					reports: boolean;
					settings: boolean;
				};
			};
			expect(calledWith.role).toBe("owner");
			expect(calledWith.permissions.sales).toBe(true);
			expect(calledWith.permissions.customers).toBe(true);
			expect(calledWith.permissions.reports).toBe(true);
			expect(calledWith.permissions.settings).toBe(true);
		});
	});

	describe("색상 선택", () => {
		it("색상 버튼 클릭 시 해당 색상이 선택된다", async () => {
			const onSubmit = vi.fn();
			render(<StaffFormModal {...defaultProps} onSubmit={onSubmit} mode="create" />);

			const nameInput = screen.getByPlaceholderText("직원 이름");
			await userEvent.type(nameInput, "새직원");

			// 빨간색 버튼 클릭
			fireEvent.click(screen.getByTestId("color-#e2445c"));

			const submitButton = screen.getByRole("button", { name: "추가" });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith(
					expect.objectContaining({
						color: "#e2445c",
					}),
				);
			});
		});
	});
});
