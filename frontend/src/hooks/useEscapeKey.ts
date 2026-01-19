import { useEffect } from "react";

/**
 * ESC 키 감지 훅
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
	useEffect(() => {
		if (!enabled) return;

		const handleEscape = (event: KeyboardEvent): void => {
			if (event.key === "Escape") {
				handler();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [handler, enabled]);
}
