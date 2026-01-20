import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { authApi } from "../api/endpoints";
import type { User } from "../api/types";

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isAuthenticated = useMemo(() => user !== null, [user]);

	// 앱 시작 시 저장된 토큰으로 사용자 정보 복원
	useEffect(() => {
		const initAuth = async (): Promise<void> => {
			const token = localStorage.getItem("authToken");
			if (token === null || token === "") {
				setIsLoading(false);
				return;
			}

			try {
				const userData = await authApi.me();
				setUser(userData);
			} catch {
				localStorage.removeItem("authToken");
			} finally {
				setIsLoading(false);
			}
		};

		void initAuth();
	}, []);

	const signIn = useCallback(async (email: string, password: string): Promise<void> => {
		const { user: userData, token } = await authApi.signIn(email, password);
		if (token !== undefined) {
			localStorage.setItem("authToken", token);
		}
		setUser(userData);
	}, []);

	const signOut = useCallback(async (): Promise<void> => {
		try {
			await authApi.signOut();
		} finally {
			setUser(null);
			localStorage.removeItem("authToken");
		}
	}, []);

	const value = useMemo(
		() => ({
			user,
			isAuthenticated,
			isLoading,
			signIn,
			signOut,
		}),
		[user, isAuthenticated, isLoading, signIn, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === null) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
