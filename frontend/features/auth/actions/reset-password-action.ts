"use server";

import { resetPasswordSchema } from "@/features/auth/schemas/reset-password-schema";

import type {
    ResetPasswordApiResponse,
    ResetPasswordState,
} from "@/features/auth/types/auth";

export async function resetPasswordAction(
    _previousState: ResetPasswordState,
    formData: FormData,
): Promise<ResetPasswordState> {
    const validation = resetPasswordSchema.safeParse({
        email: formData.get("email"),
        token: formData.get("token"),
        password: formData.get("password"),
        passwordConfirmation: formData.get(
            "passwordConfirmation",
        ),
    });

    if (!validation.success) {
        return {
            success: false,
            message: "resetPassword.validationError",
            errors: validation.error.flatten().fieldErrors,
        };
    }

    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
        return {
            success: false,
            message: "resetPassword.apiNotConfigured",
        };
    }

    const {
        email,
        token,
        password,
        passwordConfirmation,
    } = validation.data;

    try {
        const response = await fetch(
            `${apiUrl}/auth/reset-password`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    token,
                    password,
                    password_confirmation:
                        passwordConfirmation,
                }),
                cache: "no-store",
            },
        );

        const payload =
            await getResponsePayload(response);

        if (!response.ok) {
            return {
                success: false,
                message: getResetPasswordError(
                    response.status,
                    payload,
                ),
            };
        }

        return {
            success: true,
            message: "resetPassword.success",
        };
    } catch {
        return {
            success: false,
            message: "resetPassword.connectionError",
        };
    }
}

async function getResponsePayload(
    response: Response,
): Promise<ResetPasswordApiResponse> {
    try {
        return (await response.json()) as ResetPasswordApiResponse;
    } catch {
        return {};
    }
}

function getResetPasswordError(
    status: number,
    payload: ResetPasswordApiResponse,
): string {
    const message =
        payload.data?.message ?? payload.message;

    const translatedMessages: Record<string, string> = {
        "The password reset token is invalid or has expired.":
            "resetPassword.expiredToken",

        "The provided email address is invalid.":
            "resetPassword.expiredToken",

        "Password reset failed.":
            "resetPassword.expiredToken",

        "Unable to reset password.":
            "resetPassword.unexpectedError",

        "An unexpected error occurred.":
            "resetPassword.unexpectedError",
    };

    if (message && translatedMessages[message]) {
        return translatedMessages[message];
    }

    if (status === 422) {
        return "resetPassword.expiredToken";
    }

    return "resetPassword.unexpectedError";
}