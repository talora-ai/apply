import "server-only";

import { cookies } from "next/headers";

import type { AuthenticatedUser } from "@/features/auth/types/user";

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
    const cookieStore = await cookies();

    const token = cookieStore
        .get("talora_token")
        ?.value;

    const apiUrl = process.env.API_URL;

    if (!token || !apiUrl) {
        return null;
    }

    let response: Response;

    try {
        response = await fetch(`${apiUrl}/client/user`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    return (await response.json()) as AuthenticatedUser;
}
