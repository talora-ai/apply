"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export type LogoutState = {
    message?: string;
};

export async function logoutAction(
    _previousState: LogoutState,
    _formData: FormData,
): Promise<LogoutState> {
    const errorsT = await getTranslations("Errors");
    const cookieStore = await cookies();

    const token = cookieStore
        .get("talora_token")
        ?.value;

    const apiUrl = process.env.API_URL;

    if (!token) {
        redirect("/login");
    }

    if (!apiUrl) {
        return {
            message: errorsT("LOGOUT_FAILED"),
        };
    }

    let response: Response;

    try {
        response = await fetch(
            `${apiUrl}/auth/logout`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            },
        );
    } catch {
        return {
            message: errorsT("LOGOUT_FAILED"),
        };
    }

    if (!response.ok) {
        if (response.status === 401) {
            cookieStore.delete("talora_token");
            redirect("/login");
        }

        return {
            message: errorsT("LOGOUT_FAILED"),
        };
    }

    cookieStore.delete("talora_token");

    redirect("/login");
}