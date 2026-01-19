import { type RefObject, useEffect } from "react";

/**
 * 요소 외부 클릭 감지 훅
 */
export function useClickOutside<T extends HTMLElement>(
	ref: RefObject<T | null>,
	handler: () => void,
	enabled = true,
): void {
	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event: MouseEvent): void => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				handler();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref, handler, enabled]);
}
