import { COLOR_OPTIONS } from "../components/sale/constants";

/**
 * 직원 이름을 기반으로 고정된 색상을 반환하는 유틸.
 * 같은 이름은 항상 같은 색상을 반환합니다 (해시 기반).
 */
export function getStaffColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) | 0;
	}
	const index = Math.abs(hash) % COLOR_OPTIONS.length;
	return COLOR_OPTIONS[index] ?? COLOR_OPTIONS[0];
}
