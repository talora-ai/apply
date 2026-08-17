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
import { getResumes } from "@/features/resumes/services/resume-service";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
    status: AuthStatus;
    user: AuthUser | null;
    token: string | null;
    hasResume: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshResumeState: () => Promise<boolean>;
    refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [hasResume, setHasResume] = useState(false);

    useEffect(() => {
        async function restoreSession() {
            try {
                const storedToken = await getStoredToken();
                if (!storedToken) {
                    setStatus("unauthenticated");
                    return;
                }

                const [authenticatedUser, resumes] = await Promise.all([
                    getAuthenticatedUser(storedToken),
                    getResumes(storedToken),
                ]);

                if (!authenticatedUser) {
                    await removeStoredToken();
                    setStatus("unauthenticated");
                    return;
                }

                setToken(storedToken);
                setUser(authenticatedUser);
                setHasResume(resumes.length > 0);
                setStatus("authenticated");
            } catch {
                await removeStoredToken().catch(() => undefined);
                setToken(null);
                setUser(null);
                setHasResume(false);
                setStatus("unauthenticated");
            }
        }

        void restoreSession();
    }, []);

    const signIn = useCallback(async (accessToken: string) => {
        const [authenticatedUser, resumes] = await Promise.all([
            getAuthenticatedUser(accessToken),
            getResumes(accessToken),
        ]);

        if (!authenticatedUser) {
            throw new Error("The authenticated user was not returned.");
        }

        await storeToken(accessToken);
        setToken(accessToken);
        setUser(authenticatedUser);
        setHasResume(resumes.length > 0);
        setStatus("authenticated");
    }, []);

    const refreshResumeState = useCallback(async (): Promise<boolean> => {
        if (!token) {
            setHasResume(false);
            return false;
        }

        const resumes = await getResumes(token);
        const nextHasResume = resumes.length > 0;
        setHasResume(nextHasResume);
        return nextHasResume;
    }, [token]);


    const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
        if (!token) return null;
        const authenticatedUser = await getAuthenticatedUser(token);
        if (authenticatedUser) setUser(authenticatedUser);
        return authenticatedUser;
    }, [token]);

    const signOut = useCallback(async () => {
        if (token) {
            await revokeToken(token);
        }

        await removeStoredToken();
        setToken(null);
        setUser(null);
        setHasResume(false);
        setStatus("unauthenticated");
    }, [token]);

    const value = useMemo<AuthContextValue>(
        () => ({ status, user, token, hasResume, signIn, signOut, refreshResumeState, refreshUser }),
        [hasResume, refreshResumeState, refreshUser, signIn, signOut, status, token, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider.");
    return context;
}
