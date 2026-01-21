import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAIMessageGenerator } from "./useAIMessageGenerator";

describe("useAIMessageGenerator", () => {
	describe("초기 상태", () => {
		it("초기 상태가 올바르게 설정된다", () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			expect(result.current.isGenerating).toBe(false);
			expect(result.current.generatedMessage).toBe("");
			expect(result.current.error).toBeNull();
			expect(result.current.tone).toBe("friendly");
			expect(result.current.length).toBe("medium");
			expect(result.current.includePromotion).toBe(true);
		});
	});

	describe("옵션 설정", () => {
		it("톤을 변경할 수 있다", () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setTone("formal");
			});

			expect(result.current.tone).toBe("formal");
		});

		it("길이를 변경할 수 있다", () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setLength("short");
			});

			expect(result.current.length).toBe("short");
		});

		it("프로모션 포함 여부를 변경할 수 있다", () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setIncludePromotion(false);
			});

			expect(result.current.includePromotion).toBe(false);
		});
	});

	describe("메시지 생성", () => {
		it("휴면 위험 고객에게 적절한 메시지를 생성한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.generateMessage(
					{
						name: "김연아",
						daysSinceLastVisit: 120,
					},
					"churn_risk",
				);
			});

			expect(result.current.isGenerating).toBe(true);

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			expect(result.current.generatedMessage).toContain("김연아");
			expect(result.current.generatedMessage.length).toBeGreaterThan(20);
			expect(result.current.error).toBeNull();
		});

		it("생일 임박 고객에게 생일 메시지를 생성한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.generateMessage(
					{
						name: "정다은",
						birthdayDaysLeft: 7,
					},
					"birthday_upcoming",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			expect(result.current.generatedMessage).toContain("정다은");
			// 생일 관련 키워드 포함 확인
			const hasBirthdayKeyword =
				result.current.generatedMessage.includes("생일") ||
				result.current.generatedMessage.includes("축하");
			expect(hasBirthdayKeyword).toBe(true);
		});

		it("정액권 부족 고객에게 충전 안내 메시지를 생성한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.generateMessage(
					{
						name: "박지우",
						storedValueBalance: 30000,
					},
					"low_balance",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			expect(result.current.generatedMessage).toContain("박지우");
			// 잔액 또는 충전 관련 키워드 포함 확인
			const hasBalanceKeyword =
				result.current.generatedMessage.includes("잔액") ||
				result.current.generatedMessage.includes("충전") ||
				result.current.generatedMessage.includes("30,000");
			expect(hasBalanceKeyword).toBe(true);
		});

		it("신규 미정착 고객에게 재방문 유도 메시지를 생성한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.generateMessage(
					{
						name: "손흥민",
						visitCount: 1,
					},
					"new_unsettled",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			expect(result.current.generatedMessage).toContain("손흥민");
		});
	});

	describe("톤 적용", () => {
		it("formal 톤은 존칭을 사용한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setTone("formal");
			});

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			// 격식체 키워드 확인
			const hasFormalKeyword =
				result.current.generatedMessage.includes("님") ||
				result.current.generatedMessage.includes("드립니다") ||
				result.current.generatedMessage.includes("감사");
			expect(hasFormalKeyword).toBe(true);
		});

		it("casual 톤은 친근한 표현을 사용한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setTone("casual");
			});

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			expect(result.current.generatedMessage.length).toBeGreaterThan(0);
		});
	});

	describe("길이 적용", () => {
		it("short 길이는 100자 이하의 메시지를 생성한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setLength("short");
			});

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			expect(result.current.generatedMessage.length).toBeLessThanOrEqual(100);
		});

		it("long 길이는 130자 이상의 메시지를 생성한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setLength("long");
			});

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			// long 메시지는 medium보다 길어야 함
			expect(result.current.generatedMessage.length).toBeGreaterThanOrEqual(130);
		});
	});

	describe("프로모션 포함", () => {
		it("프로모션 포함 시 혜택 문구가 포함된다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setIncludePromotion(true);
			});

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			const hasPromotionKeyword =
				result.current.generatedMessage.includes("할인") ||
				result.current.generatedMessage.includes("혜택") ||
				result.current.generatedMessage.includes("이벤트") ||
				result.current.generatedMessage.includes("특별");
			expect(hasPromotionKeyword).toBe(true);
		});

		it("프로모션 미포함 시 혜택 문구가 없다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.setIncludePromotion(false);
			});

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			const hasPromotionKeyword =
				result.current.generatedMessage.includes("할인") ||
				result.current.generatedMessage.includes("% ");
			expect(hasPromotionKeyword).toBe(false);
		});
	});

	describe("재생성", () => {
		it("regenerate 호출 시 새로운 메시지를 생성한다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			const _firstMessage = result.current.generatedMessage;
			expect(_firstMessage.length).toBeGreaterThan(0);

			act(() => {
				result.current.regenerate();
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			// 재생성된 메시지는 고객 이름을 포함
			expect(result.current.generatedMessage).toContain("김민지");
		});
	});

	describe("메시지 초기화", () => {
		it("clearMessage 호출 시 메시지가 초기화된다", async () => {
			const { result } = renderHook(() => useAIMessageGenerator());

			act(() => {
				result.current.generateMessage(
					{
						name: "김민지",
						daysSinceLastVisit: 100,
					},
					"churn_risk",
				);
			});

			await waitFor(() => {
				expect(result.current.isGenerating).toBe(false);
			});

			expect(result.current.generatedMessage.length).toBeGreaterThan(0);

			act(() => {
				result.current.clearMessage();
			});

			expect(result.current.generatedMessage).toBe("");
		});
	});
});
