"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { loginSchema } from "@/features/auth/schemas/login-schema";

import type {
    LoginApiResponse,
    LoginState,
} from "@/features/auth/types/auth";

const REMEMBER_TOKEN_DURATION = 60 * 60 * 24 * 30;

export async function loginAction(
    _previousState: LoginState,
    formData: FormData,
): Promise<LoginState> {
    const validationT = await getTranslations("Validation");
    const errorsT = await getTranslations("Errors");

    const validation = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        remember: formData.get("remember") === "on",
    });

    if (!validation.success) {
        return {
            success: false,
            message: validationT("invalidFields"),
            errors: validation.error.flatten().fieldErrors,
        };
    }

    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
        return {
            success: false,
            message: errorsT("API_NOT_CONFIGURED"),
        };
    }

    const {
        email,
        password,
        remember,
    } = validation.data;

    let response: Response;

    try {
        response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password
            }),
            cache: "no-store",
        });
    } catch {
        return {
            success: false,
            message: errorsT("API_UNAVAILABLE"),
        };
    }

    let payload: LoginApiResponse;

    try {
        payload = (await response.json()) as LoginApiResponse;
    } catch {
        return {
            success: false,
            message: errorsT("INVALID_API_RESPONSE"),
        };
    }

    if (!response.ok) {
        if (response.status === 401) {
            return {
                success: false,
                message: errorsT(
                    "AUTH_INVALID_CREDENTIALS",
                ),
            };
        }

        if (response.status === 422) {
            return {
                success: false,
                message: validationT("invalidFields"),
            };
        }

        return {
            success: false,
            message: errorsT("UNKNOWN"),
        };
    }

    if (!payload.data?.token) {
        return {
            success: false,
            message: errorsT(
                "AUTH_TOKEN_CREATION_FAILED",
            ),
        };
    }

    const cookieStore = await cookies();

    cookieStore.set(
        "talora_token",
        payload.data.token,
        {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            ...(remember
                ? {
                      maxAge:
                          REMEMBER_TOKEN_DURATION,
                  }
                : {}),
        },
    );

    redirect("/dashboard");
}