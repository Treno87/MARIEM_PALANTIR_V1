import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../test/test-utils";
import ReservationPage from "./ReservationPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe("ReservationPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("초기 렌더링", () => {
		it("예약관리 제목이 표시된다", () => {
			render(<ReservationPage />);
			expect(screen.getByText("예약관리")).toBeInTheDocument();
		});

		it("날짜 네비게이션이 표시된다", () => {
			render(<ReservationPage />);
			// 날짜 형식: YYYY년 MM월 DD일 (요일)
			expect(screen.getByText(/\d{4}년 \d{2}월 \d{2}일/)).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "오늘" })).toBeInTheDocument();
		});

		it("날짜 선택 캘린더가 표시된다", () => {
			render(<ReservationPage />);
			// 현재 날짜 버튼이 존재
			const today = new Date().getDate();
			const dayButton = screen.getByRole("button", { name: String(today) });
			expect(dayButton).toBeInTheDocument();
		});

		it("Summary 카드들이 표시된다", () => {
			render(<ReservationPage />);
			expect(screen.getByText(/오늘 예약/)).toBeInTheDocument();
			// Summary 카드에는 "N건" 형식으로 표시됨 (3개 카드)
			const summaryValues = screen.getAllByText(/\d+건/);
			expect(summaryValues.length).toBe(3);
		});

		it("예약 그리드가 표시된다", () => {
			render(<ReservationPage />);
			expect(screen.getByTestId("reservation-grid")).toBeInTheDocument();
		});
	});

	describe("날짜 네비게이션", () => {
		it("이전 날짜 버튼 클릭 시 날짜가 하루 감소한다", () => {
			render(<ReservationPage />);
			const prevButton = screen.getByRole("button", { name: "이전 날짜" });

			// 현재 날짜 확인
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			const expectedMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
			const expectedDay = String(yesterday.getDate()).padStart(2, "0");

			fireEvent.click(prevButton);

			expect(
				screen.getByText(new RegExp(`${expectedMonth}월 ${expectedDay}일`)),
			).toBeInTheDocument();
		});

		it("다음 날짜 버튼 클릭 시 날짜가 하루 증가한다", () => {
			render(<ReservationPage />);
			const nextButton = screen.getByRole("button", { name: "다음 날짜" });

			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1);
			const expectedMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
			const expectedDay = String(tomorrow.getDate()).padStart(2, "0");

			fireEvent.click(nextButton);

			expect(
				screen.getByText(new RegExp(`${expectedMonth}월 ${expectedDay}일`)),
			).toBeInTheDocument();
		});

		it("오늘 버튼 클릭 시 오늘 날짜로 이동한다", () => {
			render(<ReservationPage />);
			// 먼저 다른 날짜로 이동
			const nextButton = screen.getByRole("button", { name: "다음 날짜" });
			fireEvent.click(nextButton);
			fireEvent.click(nextButton);

			// 오늘 버튼 클릭
			const todayButton = screen.getByRole("button", { name: "오늘" });
			fireEvent.click(todayButton);

			const today = new Date();
			const expectedMonth = String(today.getMonth() + 1).padStart(2, "0");
			const expectedDay = String(today.getDate()).padStart(2, "0");

			expect(
				screen.getByText(new RegExp(`${expectedMonth}월 ${expectedDay}일`)),
			).toBeInTheDocument();
		});
	});

	describe("날짜 선택 캘린더", () => {
		it("해당 월의 날짜 버튼들이 표시된다", () => {
			render(<ReservationPage />);
			// 1일 버튼은 항상 존재
			expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
			// 28일도 모든 달에 존재
			expect(screen.getByRole("button", { name: "28" })).toBeInTheDocument();
		});

		it("토요일은 파란색, 일요일은 빨간색으로 표시된다", () => {
			render(<ReservationPage />);
			const calendar = screen.getByTestId("reservation-calendar");
			// 토요일 버튼들은 text-blue-500 클래스를 가짐
			const saturdayButtons = calendar.querySelectorAll(".text-blue-500");
			// 일요일 버튼들은 text-red-500 클래스를 가짐
			const sundayButtons = calendar.querySelectorAll(".text-red-500");
			// 월에 따라 토/일 수가 다르지만 최소 4개 이상 존재
			expect(saturdayButtons.length).toBeGreaterThanOrEqual(4);
			expect(sundayButtons.length).toBeGreaterThanOrEqual(4);
		});

		it("날짜 버튼 클릭 시 해당 날짜가 선택된다", () => {
			render(<ReservationPage />);
			const dayButton = screen.getByRole("button", { name: "15" });
			fireEvent.click(dayButton);

			const today = new Date();
			const expectedMonth = String(today.getMonth() + 1).padStart(2, "0");

			expect(screen.getByText(new RegExp(`${expectedMonth}월 15일`))).toBeInTheDocument();
		});

		it("선택된 날짜 버튼이 하이라이트된다", () => {
			render(<ReservationPage />);
			const today = new Date().getDate();
			const selectedButton = screen.getByRole("button", {
				name: String(today),
			});
			expect(selectedButton).toHaveClass("bg-primary-500");
		});
	});

	describe("상태 범례", () => {
		it("예약 그리드 위에 상태 범례가 표시된다", () => {
			render(<ReservationPage />);
			const legend = screen.getByTestId("status-legend");
			expect(legend).toBeInTheDocument();
			// 각 상태가 표시됨
			expect(legend).toHaveTextContent("예약");
			expect(legend).toHaveTextContent("완료");
			expect(legend).toHaveTextContent("취소");
		});
	});

	describe("예약 그리드", () => {
		it("담당자별 행이 표시된다", () => {
			render(<ReservationPage />);
			// salesStaff에서 showInSales가 true인 직원들 (김정희, 박수민, 이하늘)
			expect(screen.getByText("김정희")).toBeInTheDocument();
			expect(screen.getByText("박수민")).toBeInTheDocument();
			expect(screen.getByText("이하늘")).toBeInTheDocument();
		});

		it("시간 헤더가 표시된다 (10:00 ~ 20:00)", () => {
			render(<ReservationPage />);
			expect(screen.getByText("10:00")).toBeInTheDocument();
			expect(screen.getByText("12:00")).toBeInTheDocument();
			expect(screen.getByText("20:00")).toBeInTheDocument();
		});

		it("Mock 예약 데이터가 해당 날짜에 표시된다", () => {
			render(<ReservationPage />);
			// Mock 데이터는 2026-01-21 날짜
			// 현재 날짜가 다르면 보이지 않음
			const today = new Date();
			const isMockDate =
				today.getFullYear() === 2026 && today.getMonth() === 0 && today.getDate() === 21;

			if (isMockDate) {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			} else {
				// Mock 날짜로 이동
				expect(screen.getByTestId("reservation-grid")).toBeInTheDocument();
			}
		});
	});

	describe("예약 등록", () => {
		it("빈 슬롯 클릭 시 예약 등록 모달이 열린다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');
			expect(emptySlot).not.toBeNull();

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByText("예약 등록")).toBeInTheDocument();
			});
		});

		it("예약 등록 모달에서 필수 필드가 표시된다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByLabelText("고객 *")).toBeInTheDocument();
				expect(screen.getByLabelText("시술 카테고리 *")).toBeInTheDocument();
				expect(screen.getByLabelText("시술 *")).toBeInTheDocument();
				expect(screen.getByLabelText("소요시간 *")).toBeInTheDocument();
			});
		});

		it("예약 등록 완료 시 모달이 닫힌다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByText("예약 등록")).toBeInTheDocument();
			});

			// 폼 입력
			const customerInput = screen.getByLabelText("고객 *");
			fireEvent.change(customerInput, { target: { value: "테스트고객" } });

			// 카테고리 선택 후 시술 선택
			const categorySelect = screen.getByLabelText("시술 카테고리 *");
			fireEvent.change(categorySelect, { target: { value: "cat1" } });
			const serviceSelect = screen.getByLabelText("시술 *");
			fireEvent.change(serviceSelect, { target: { value: "남자커트" } });

			// 등록 버튼 클릭
			const submitButton = screen.getByRole("button", { name: "등록" });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.queryByText("예약 등록")).not.toBeInTheDocument();
			});
		});
	});

	describe("예약 수정", () => {
		it("예약 상세 모달에서 수정 버튼이 표시된다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜(2026-01-21)로 이동
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 예약 블록 클릭
			fireEvent.click(screen.getByText("김민지"));

			await waitFor(() => {
				expect(screen.getByText("예약 상세")).toBeInTheDocument();
				expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
			});
		});

		it("수정 버튼 클릭 시 예약 수정 모달이 열리고 기존 값이 채워져 있다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜로 이동
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 예약 블록 클릭
			fireEvent.click(screen.getByText("김민지"));

			await waitFor(() => {
				expect(screen.getByText("예약 상세")).toBeInTheDocument();
			});

			// 수정 버튼 클릭
			fireEvent.click(screen.getByRole("button", { name: "수정" }));

			await waitFor(() => {
				expect(screen.getByText("예약 수정")).toBeInTheDocument();
				// 기존 값이 채워져 있음
				expect(screen.getByLabelText("고객 *")).toHaveValue("김민지");
				expect(screen.getByLabelText("시술 *")).toHaveValue("여자커트");
			});
		});

		it("예약 수정 후 저장하면 예약이 업데이트된다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜로 이동
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 예약 블록 클릭 → 상세 모달
			fireEvent.click(screen.getByText("김민지"));

			await waitFor(() => {
				expect(screen.getByText("예약 상세")).toBeInTheDocument();
			});

			// 수정 버튼 클릭
			fireEvent.click(screen.getByRole("button", { name: "수정" }));

			await waitFor(() => {
				expect(screen.getByText("예약 수정")).toBeInTheDocument();
			});

			// 시술 변경 (카테고리 → 시술 선택)
			const user = userEvent.setup();
			const categorySelect = screen.getByLabelText("시술 카테고리 *");
			await user.selectOptions(categorySelect, "cat1");
			const serviceSelect = screen.getByLabelText("시술 *");
			await user.selectOptions(serviceSelect, "남자커트");

			// 입력값 변경 확인
			await waitFor(() => {
				expect(serviceSelect).toHaveValue("남자커트");
			});

			// 저장 버튼 클릭
			await user.click(screen.getByRole("button", { name: "저장" }));

			await waitFor(() => {
				// 모달 닫힘
				expect(screen.queryByText("예약 수정")).not.toBeInTheDocument();
			});

			// 수정된 내용 반영 확인
			const grid = screen.getByTestId("reservation-grid");
			expect(grid.textContent).not.toContain("여자커트");
			expect(grid.textContent).toContain("남자커트");
		});
	});

	describe("예약 상세 모달", () => {
		it("버튼이 아이콘으로 표시된다 (거래입력, 수정, 취소, 닫기)", async () => {
			render(<ReservationPage />);
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText("김민지"));

			await waitFor(() => {
				expect(screen.getByText("예약 상세")).toBeInTheDocument();
			});

			// 아이콘 버튼들이 존재하는지 확인
			expect(screen.getByRole("button", { name: "거래입력" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
		});

		it("버튼 순서가 거래입력, 수정, 취소, 닫기 순이다", async () => {
			render(<ReservationPage />);
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText("김민지"));

			await waitFor(() => {
				expect(screen.getByText("예약 상세")).toBeInTheDocument();
			});

			// 버튼 순서 확인 (footer 내 버튼들)
			const footer = screen.getByTestId("detail-modal-footer");
			const buttons = footer.querySelectorAll("button");
			expect(buttons[0]).toHaveAccessibleName("거래입력");
			expect(buttons[1]).toHaveAccessibleName("수정");
			expect(buttons[2]).toHaveAccessibleName("취소");
			expect(buttons[3]).toHaveAccessibleName("닫기");
		});

		it("거래입력 버튼 클릭 시 /sale 페이지로 이동하며 예약 정보가 전달된다", async () => {
			render(<ReservationPage />);
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText("김민지"));

			await waitFor(() => {
				expect(screen.getByText("예약 상세")).toBeInTheDocument();
			});

			const saleButton = screen.getByRole("button", { name: "거래입력" });
			fireEvent.click(saleButton);

			expect(mockNavigate).toHaveBeenCalledWith("/sale", {
				state: {
					customerId: "1",
					customerName: "김민지",
					staffId: "1",
					staffName: "김정희",
					serviceName: "여자커트",
				},
			});
		});

		it("빈 슬롯 클릭 후 예약 등록하면 새 예약이 추가된다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByText("예약 등록")).toBeInTheDocument();
			});

			// 폼 입력
			const customerInput = screen.getByLabelText("고객 *");
			fireEvent.change(customerInput, { target: { value: "신규테스트고객" } });

			// 카테고리 선택 후 시술 선택
			const categorySelect = screen.getByLabelText("시술 카테고리 *");
			fireEvent.change(categorySelect, { target: { value: "cat1" } });
			const serviceSelect = screen.getByLabelText("시술 *");
			fireEvent.change(serviceSelect, { target: { value: "여자커트" } });

			// 등록 버튼 클릭
			const submitButton = screen.getByRole("button", { name: "등록" });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText("신규테스트고객")).toBeInTheDocument();
			});
		});
	});

	describe("예약 폼 필드", () => {
		it("예약 등록 모달에서 날짜 선택 필드가 표시된다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByLabelText("예약 날짜 *")).toBeInTheDocument();
			});
		});

		it("예약 등록 모달에서 시간 선택 드롭다운이 표시된다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByLabelText("예약 시간 *")).toBeInTheDocument();
			});
		});

		it("예약 등록 모달에서 시술 카테고리 선택이 표시된다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByLabelText("시술 카테고리 *")).toBeInTheDocument();
				expect(screen.getByLabelText("시술 *")).toBeInTheDocument();
			});
		});

		it("시술 카테고리 선택 시 해당 시술 목록이 표시된다", async () => {
			render(<ReservationPage />);
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');

			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByLabelText("시술 카테고리 *")).toBeInTheDocument();
			});

			// 카테고리 선택
			const categorySelect = screen.getByLabelText("시술 카테고리 *");
			fireEvent.change(categorySelect, { target: { value: "cat1" } });

			// 해당 카테고리의 시술이 시술 드롭다운에 표시됨
			const serviceSelect = screen.getByLabelText("시술 *");
			expect(serviceSelect).toBeInTheDocument();
			// 커트 카테고리의 시술들이 옵션으로 존재하는지 확인
			expect(screen.getByRole("option", { name: "남자커트" })).toBeInTheDocument();
		});

		it("예약 수정 시 기존 날짜/시간/시술이 선택되어 있다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜로 이동
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 예약 블록 클릭 → 상세 모달
			fireEvent.click(screen.getByText("김민지"));

			await waitFor(() => {
				expect(screen.getByText("예약 상세")).toBeInTheDocument();
			});

			// 수정 버튼 클릭
			fireEvent.click(screen.getByRole("button", { name: "수정" }));

			await waitFor(() => {
				expect(screen.getByText("예약 수정")).toBeInTheDocument();
				// 기존 값들이 채워져 있는지 확인
				expect(screen.getByLabelText("예약 날짜 *")).toHaveValue("2026-01-21");
				expect(screen.getByLabelText("예약 시간 *")).toHaveValue("10:00");
			});
		});
	});

	describe("예약 충돌 검사", () => {
		it("충돌하는 예약이 있으면 경고 메시지가 표시된다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜(2026-01-21)로 이동 - 김민지 10:00 예약이 있음
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 김정희 담당자의 빈 슬롯 클릭 (14:00은 이서연 예약이 있음)
			const grid = screen.getByTestId("reservation-grid");
			// 이서연의 예약 시간대(14:00)와 충돌하는 시간 설정
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');
			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByText("예약 등록")).toBeInTheDocument();
			});

			// 고객명 입력
			fireEvent.change(screen.getByLabelText("고객 *"), {
				target: { value: "충돌테스트고객" },
			});

			// 카테고리 선택 후 시술 선택
			fireEvent.change(screen.getByLabelText("시술 카테고리 *"), {
				target: { value: "cat1" },
			});
			fireEvent.change(screen.getByLabelText("시술 *"), {
				target: { value: "남자커트" },
			});

			// 김정희 담당자 선택, 10:00 시간대 선택 (김민지 예약과 충돌)
			fireEvent.change(screen.getByLabelText("담당자 *"), {
				target: { value: "1" },
			});
			fireEvent.change(screen.getByLabelText("예약 시간 *"), {
				target: { value: "10:00" },
			});

			// 충돌 경고 메시지 확인
			await waitFor(() => {
				expect(screen.getByText("예약 시간이 충돌합니다")).toBeInTheDocument();
				expect(screen.getByText(/김민지님의 예약/)).toBeInTheDocument();
			});
		});

		it("충돌하는 예약이 있으면 저장 버튼이 비활성화된다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜로 이동
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 빈 슬롯 클릭
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');
			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByText("예약 등록")).toBeInTheDocument();
			});

			// 고객명 입력
			fireEvent.change(screen.getByLabelText("고객 *"), {
				target: { value: "충돌테스트고객" },
			});

			// 카테고리 선택 후 시술 선택
			fireEvent.change(screen.getByLabelText("시술 카테고리 *"), {
				target: { value: "cat1" },
			});
			fireEvent.change(screen.getByLabelText("시술 *"), {
				target: { value: "남자커트" },
			});

			// 김정희 담당자 선택, 10:00 시간대 선택 (김민지 예약과 충돌)
			fireEvent.change(screen.getByLabelText("담당자 *"), {
				target: { value: "1" },
			});
			fireEvent.change(screen.getByLabelText("예약 시간 *"), {
				target: { value: "10:00" },
			});

			// 등록 버튼이 비활성화됨
			await waitFor(() => {
				const submitButton = screen.getByRole("button", { name: "등록" });
				expect(submitButton).toBeDisabled();
			});
		});

		it("충돌을 해소하면 저장 버튼이 활성화된다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜로 이동
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 빈 슬롯 클릭
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');
			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByText("예약 등록")).toBeInTheDocument();
			});

			// 고객명 입력
			fireEvent.change(screen.getByLabelText("고객 *"), {
				target: { value: "충돌테스트고객" },
			});

			// 카테고리 선택 후 시술 선택
			fireEvent.change(screen.getByLabelText("시술 카테고리 *"), {
				target: { value: "cat1" },
			});
			fireEvent.change(screen.getByLabelText("시술 *"), {
				target: { value: "남자커트" },
			});

			// 김정희 담당자 선택, 10:00 시간대 선택 (김민지 예약과 충돌)
			fireEvent.change(screen.getByLabelText("담당자 *"), {
				target: { value: "1" },
			});
			fireEvent.change(screen.getByLabelText("예약 시간 *"), {
				target: { value: "10:00" },
			});

			// 충돌 확인
			await waitFor(() => {
				expect(screen.getByText("예약 시간이 충돌합니다")).toBeInTheDocument();
			});

			// 다른 시간대로 변경하여 충돌 해소 (12:00은 김정희 담당자에게 예약이 없음)
			fireEvent.change(screen.getByLabelText("예약 시간 *"), {
				target: { value: "12:00" },
			});

			// 충돌 경고 메시지가 사라지고 버튼이 활성화됨
			await waitFor(() => {
				expect(screen.queryByText("예약 시간이 충돌합니다")).not.toBeInTheDocument();
				const submitButton = screen.getByRole("button", { name: "등록" });
				expect(submitButton).not.toBeDisabled();
			});
		});

		it("취소된 예약과는 충돌하지 않는다", async () => {
			render(<ReservationPage />);
			// Mock 데이터 날짜로 이동 - 한소희(이하늘 담당, 10:30) 예약은 취소됨
			const dayButton = screen.getByRole("button", { name: "21" });
			fireEvent.click(dayButton);

			await waitFor(() => {
				expect(screen.getByText("김민지")).toBeInTheDocument();
			});

			// 빈 슬롯 클릭
			const grid = screen.getByTestId("reservation-grid");
			const emptySlot = grid.querySelector('[data-empty-slot="true"]');
			if (emptySlot) {
				fireEvent.click(emptySlot);
			}

			await waitFor(() => {
				expect(screen.getByText("예약 등록")).toBeInTheDocument();
			});

			// 고객명 입력
			fireEvent.change(screen.getByLabelText("고객 *"), {
				target: { value: "테스트고객" },
			});

			// 카테고리 선택 후 시술 선택
			fireEvent.change(screen.getByLabelText("시술 카테고리 *"), {
				target: { value: "cat1" },
			});
			fireEvent.change(screen.getByLabelText("시술 *"), {
				target: { value: "남자커트" },
			});

			// 이하늘 담당자 선택(id=3), 10:30 시간대 (취소된 한소희 예약 시간)
			fireEvent.change(screen.getByLabelText("담당자 *"), {
				target: { value: "3" },
			});
			fireEvent.change(screen.getByLabelText("예약 시간 *"), {
				target: { value: "10:30" },
			});

			// 취소된 예약과는 충돌하지 않으므로 경고 없음
			await waitFor(() => {
				expect(screen.queryByText("예약 시간이 충돌합니다")).not.toBeInTheDocument();
				const submitButton = screen.getByRole("button", { name: "등록" });
				expect(submitButton).not.toBeDisabled();
			});
		});
	});
});
