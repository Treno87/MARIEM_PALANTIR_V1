/**
 * React Query Key Factory
 * 일관된 쿼리 키 생성을 위한 팩토리 패턴
 */

type QueryKeyParams = Record<string, unknown> | undefined;

export function createQueryKeys<T extends string>(domain: T) {
	return {
		all: [domain] as const,
		list: (params?: QueryKeyParams) => [domain, "list", params] as const,
		detail: (id: number | string) => [domain, "detail", id] as const,
	};
}
