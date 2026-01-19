/**
 * API 관련 커스텀 훅
 */

import { useCallback, useState } from "react";
import api from "../lib/api";

interface UseApiState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
}

/**
 * API 호출을 위한 범용 훅
 */
export function useApi<T>(): UseApiState<T> & {
	execute: (promise: Promise<T>) => Promise<T>;
} {
	const [state, setState] = useState<UseApiState<T>>({
		data: null,
		loading: false,
		error: null,
	});

	const execute = useCallback(async (promise: Promise<T>) => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const data = await promise;
			setState({ data, loading: false, error: null });
			return data;
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Unknown error");
			setState({ data: null, loading: false, error: err });
			throw err;
		}
	}, []);

	return { ...state, execute };
}

/**
 * GET 요청을 위한 훅
 */
export function useFetch<T>(endpoint: string): {
	data: T | null;
	loading: boolean;
	error: Error | null;
	fetch: () => Promise<T>;
} {
	const { data, loading, error, execute } = useApi<T>();

	const fetch = useCallback(() => {
		return execute(api.get<T>(endpoint));
	}, [endpoint, execute]);

	return { data, loading, error, fetch };
}

/**
 * POST/PUT/DELETE 요청을 위한 훅
 */
export function useMutation<T, D = unknown>(): {
	data: T | null;
	loading: boolean;
	error: Error | null;
	post: (endpoint: string, payload?: D) => Promise<T>;
	put: (endpoint: string, payload?: D) => Promise<T>;
	del: (endpoint: string) => Promise<T>;
} {
	const { data, loading, error, execute } = useApi<T>();

	const post = useCallback(
		(endpoint: string, payload?: D) => {
			return execute(api.post<T>(endpoint, payload));
		},
		[execute],
	);

	const put = useCallback(
		(endpoint: string, payload?: D) => {
			return execute(api.put<T>(endpoint, payload));
		},
		[execute],
	);

	const del = useCallback(
		(endpoint: string) => {
			return execute(api.delete<T>(endpoint));
		},
		[execute],
	);

	return { data, loading, error, post, put, del };
}
