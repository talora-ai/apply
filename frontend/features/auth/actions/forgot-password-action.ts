"use server";

import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password-schema";

import type {
    ForgotPasswordApiResponse,
    ForgotPasswordState,
} from "@/features/auth/types/auth";

export async function forgotPasswordAction(
    _previousState: ForgotPasswordState,
    formData: FormData,
): Promise<ForgotPasswordState> {
    const validation = forgotPasswordSchema.safeParse({
        email: formData.get("email"),
    });

    if (!validation.success) {
        return {
            success: false,
            message: "forgotPassword.validationError",
            errors: validation.error.flatten().fieldErrors,
        };
    }

    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
        return {
            success: false,
            message: "forgotPassword.apiNotConfigured",
        };
    }

    try {
        const response = await fetch(
            `${apiUrl}/auth/forgot-password`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: validation.data.email,
                }),
                cache: "no-store",
            },
        );

        const payload =
            (await response.json()) as ForgotPasswordApiResponse;

        if (!response.ok) {
            return {
                success: false,
                message: translateApiError(
                    payload.data?.message ?? payload.message,
                ),
            };
        }

        return {
            success: true,
            message: "forgotPassword.success",
        };
    } catch {
        return {
            success: false,
            message: "forgotPassword.connectionError",
        };
    }
}

function translateApiError(message?: string): string {
    const translations: Record<string, string> = {
        "The email field is required.":
            "validation.email.required",

        "The email field must be a valid email address.":
            "validation.email.invalid",

        "Unable to send password reset instructions.":
            "forgotPassword.unexpectedError",

        "An unexpected error occurred.":
            "forgotPassword.unexpectedError",
    };

    if (!message) {
        return "forgotPassword.unexpectedError";
    }

    return (
        translations[message] ??
        "forgotPassword.unexpectedError"
    );
}