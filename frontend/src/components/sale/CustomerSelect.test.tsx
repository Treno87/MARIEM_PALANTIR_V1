import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { render } from "../../test/test-utils";
import { CustomerSelect } from "./CustomerSelect";

const mockCustomers = [
	{
		id: "1",
		name: "김민지",
		phone: "010-1234-5678",
		initials: "김민",
		visitCount: 5,
		totalSpent: 100000,
		lastVisitDate: "2024-01-15",
	},
	{
		id: "2",
		name: "이수진",
		phone: "010-2345-6789",
		initials: "이수",
		visitCount: 3,
		totalSpent: 50000,
		lastVisitDate: "2024-01-10",
	},
	{
		id: "3",
		name: "박지영",
		phone: "010-3456-7890",
		initials: "박지",
		visitCount: 1,
		totalSpent: 30000,
		lastVisitDate: "2024-01-05",
	},
];

describe("CustomerSelect", () => {
	const defaultProps = {
		customers: mockCustomers,
		selectedCustomer: undefined,
		onSelect: vi.fn(),
		onClear: vi.fn(),
		onAddCustomer: vi.fn(() => "new-id"),
	};

	describe("엔터키로 고객 선택", () => {
		it("검색 후 엔터를 누르면 첫 번째 검색 결과가 선택된다", async () => {
			const onSelect = vi.fn();
			render(<CustomerSelect {...defaultProps} onSelect={onSelect} />);

			// 고객 선택 버튼 클릭
			const selectButton = screen.getByText("고객 선택");
			fireEvent.click(selectButton);

			// 검색창이 열릴 때까지 대기
			const searchInput = await screen.findByPlaceholderText("검색...");

			// 검색어 입력
			await userEvent.type(searchInput, "김민지");

			// 엔터 키 입력
			fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

			// 첫 번째 결과가 선택됨
			await waitFor(() => {
				expect(onSelect).toHaveBeenCalledWith("1");
			});
		});

		it("검색 결과가 없으면 엔터를 눌러도 선택되지 않는다", async () => {
			const onSelect = vi.fn();
			render(<CustomerSelect {...defaultProps} onSelect={onSelect} />);

			const selectButton = screen.getByText("고객 선택");
			fireEvent.click(selectButton);

			const searchInput = await screen.findByPlaceholderText("검색...");

			// 존재하지 않는 검색어 입력
			await userEvent.type(searchInput, "존재하지않는고객");

			// 엔터 키 입력
			fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

			// onSelect가 호출되지 않음
			expect(onSelect).not.toHaveBeenCalled();
		});

		it("검색어 없이 엔터를 누르면 첫 번째 고객이 선택된다", async () => {
			const onSelect = vi.fn();
			render(<CustomerSelect {...defaultProps} onSelect={onSelect} />);

			const selectButton = screen.getByText("고객 선택");
			fireEvent.click(selectButton);

			const searchInput = await screen.findByPlaceholderText("검색...");

			// 검색어 없이 엔터 키 입력
			fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

			// 첫 번째 고객이 선택됨
			await waitFor(() => {
				expect(onSelect).toHaveBeenCalledWith("1");
			});
		});

		it("전화번호로 검색 후 엔터를 누르면 해당 고객이 선택된다", async () => {
			const onSelect = vi.fn();
			render(<CustomerSelect {...defaultProps} onSelect={onSelect} />);

			const selectButton = screen.getByText("고객 선택");
			fireEvent.click(selectButton);

			const searchInput = await screen.findByPlaceholderText("검색...");

			// 전화번호로 검색
			await userEvent.type(searchInput, "2345");

			// 엔터 키 입력
			fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

			// 이수진(2번 고객)이 선택됨
			await waitFor(() => {
				expect(onSelect).toHaveBeenCalledWith("2");
			});
		});
	});
});
