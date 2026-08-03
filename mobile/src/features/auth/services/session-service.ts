import * as SecureStore from "expo-secure-store";

import type { AuthUser } from "@/features/auth/types/auth";
import {
    ApiError,
    apiRequest,
} from "@/lib/api";

const TOKEN_KEY = "talora_token";

type AuthenticatedUserResponse = {
    data?: AuthUser | {
        user?: AuthUser;
    };
    user?: AuthUser;
};

export async function getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeStoredToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getAuthenticatedUser(
    token: string,
): Promise<AuthUser | null> {
    const response = await apiRequest<AuthenticatedUserResponse>(
        "/api/user",
        { token },
    );

    if (response.user) {
        return response.user;
    }

    if (response.data && "user" in response.data) {
        return response.data.user ?? null;
    }

    if (response.data && "id" in response.data) {
        return response.data;
    }

    return null;
}

export async function revokeToken(token: string): Promise<void> {
    try {
        await apiRequest<unknown>("/auth/logout", {
            method: "POST",
            token,
            allowEmptyResponse: true,
        });
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return;
        }

        throw error;
    }
}
