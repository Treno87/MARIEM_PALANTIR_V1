import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { CatalogProvider } from "../contexts/CatalogContext";
import { CustomerProvider } from "../contexts/CustomerContext";
import { SaleProvider } from "../contexts/SaleContext";
import { StaffProvider } from "../contexts/StaffContext";

interface AllProvidersProps {
	children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps): ReactElement {
	return (
		<MemoryRouter>
			<StaffProvider>
				<CatalogProvider>
					<CustomerProvider>
						<SaleProvider>{children}</SaleProvider>
					</CustomerProvider>
				</CatalogProvider>
			</StaffProvider>
		</MemoryRouter>
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
