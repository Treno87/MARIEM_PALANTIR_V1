import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { CatalogProvider } from "../contexts/CatalogContext";
import { CustomerProvider } from "../contexts/CustomerContext";
import { SaleProvider } from "../contexts/SaleContext";
import { StaffProvider } from "../contexts/StaffContext";

// 테스트용 QueryClient (매 테스트마다 새로 생성)
function createTestQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

/**
 * renderHook 테스트용 QueryClient 래퍼
 * API 훅 테스트에서 사용
 */
export function createQueryWrapper(): ({ children }: { children: ReactNode }) => ReactNode {
	const queryClient = createTestQueryClient();
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

interface AllProvidersProps {
	children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps): ReactElement {
	const queryClient = createTestQueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<StaffProvider>
					<CatalogProvider>
						<CustomerProvider>
							<SaleProvider>{children}</SaleProvider>
						</CustomerProvider>
					</CatalogProvider>
				</StaffProvider>
			</MemoryRouter>
		</QueryClientProvider>
	);
}

function customRender(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
): ReturnType<typeof render> {
	return render(ui, { wrapper: AllProviders, ...options });
}

// re-export everything
export * from "@testing-library/react";
export { customRender as render };
