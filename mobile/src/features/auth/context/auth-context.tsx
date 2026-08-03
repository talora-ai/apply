import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getAuthenticatedUser,
    getStoredToken,
    removeStoredToken,
    revokeToken,
    storeToken,
} from "@/features/auth/services/session-service";
import type { AuthUser } from "@/features/auth/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
    status: AuthStatus;
    user: AuthUser | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
    children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        async function restoreSession() {
            try {
                const storedToken = await getStoredToken();

                if (!storedToken) {
                    setStatus("unauthenticated");
                    return;
                }

                const authenticatedUser =
                    await getAuthenticatedUser(storedToken);

                if (!authenticatedUser) {
                    await removeStoredToken();
                    setStatus("unauthenticated");
                    return;
                }

                setToken(storedToken);
                setUser(authenticatedUser);
                setStatus("authenticated");
            } catch {
                await removeStoredToken().catch(() => undefined);
                setToken(null);
                setUser(null);
                setStatus("unauthenticated");
            }
        }

        void restoreSession();
    }, []);

    const signIn = useCallback(async (accessToken: string) => {
        const authenticatedUser =
            await getAuthenticatedUser(accessToken);

        if (!authenticatedUser) {
            throw new Error("The authenticated user was not returned.");
        }

        await storeToken(accessToken);
        setToken(accessToken);
        setUser(authenticatedUser);
        setStatus("authenticated");
    }, []);

    const signOut = useCallback(async () => {
        if (token) {
            await revokeToken(token);
        }

        await removeStoredToken();
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
    }, [token]);

    const value = useMemo<AuthContextValue>(
        () => ({ status, user, signIn, signOut }),
        [signIn, signOut, status, user],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider.");
    }

    return context;
}
