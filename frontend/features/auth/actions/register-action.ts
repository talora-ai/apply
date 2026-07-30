"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createRegisterSchema } from "@/features/auth/schemas/register-schema";

import type {
    RegisterApiResponse,
    RegisterState,
} from "@/features/auth/types/register";

export async function registerAction(
    _previousState: RegisterState,
    formData: FormData,
): Promise<RegisterState> {
    const validationT =
        await getTranslations(
            "Validation.Register",
        );

    const errorsT =
        await getTranslations("Errors");

    const schema = createRegisterSchema({
        nameMin: validationT("nameMin"),
        nameMax: validationT("nameMax"),

        lastNameMin:
            validationT("lastNameMin"),

        lastNameMax:
            validationT("lastNameMax"),

        emailInvalid:
            validationT("emailInvalid"),

        emailMax:
            validationT("emailMax"),

        passwordMin:
            validationT("passwordMin"),

        passwordMax:
            validationT("passwordMax"),

        passwordConfirmationRequired:
            validationT(
                "passwordConfirmationRequired",
            ),

        passwordMismatch:
            validationT("passwordMismatch"),

        termsRequired:
            validationT("termsRequired"),
    });

    const validation = schema.safeParse({
        name: formData.get("name"),
        last_name: formData.get("last_name"),
        email: formData.get("email"),
        password: formData.get("password"),

        password_confirmation:
            formData.get(
                "password_confirmation",
            ),

        terms:
            formData.get("terms") === "on",
    });

    if (!validation.success) {
        return {
            success: false,
            message: errorsT(
                "REGISTER_INVALID_FIELDS",
            ),
            errors:
                validation.error.flatten()
                    .fieldErrors,
        };
    }

    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
        return {
            success: false,
            message: errorsT(
                "API_NOT_CONFIGURED",
            ),
        };
    }

    const {
        name,
        last_name,
        email,
        password,
        password_confirmation,
    } = validation.data;

    let response: Response;

    try {
        response = await fetch(
            `${apiUrl}/auth/register`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    name,
                    last_name,
                    email,
                    password,
                    password_confirmation,
                }),
                cache: "no-store",
            },
        );
    } catch {
        return {
            success: false,
            message: errorsT(
                "API_UNAVAILABLE",
            ),
        };
    }

    let payload: RegisterApiResponse = {};

    try {
        payload =
            (await response.json()) as RegisterApiResponse;
    } catch {
        if (!response.ok) {
            return {
                success: false,
                message: errorsT(
                    "INVALID_API_RESPONSE",
                ),
            };
        }
    }

    if (response.status === 422) {
        const backendErrors =
            payload.errors ??
            payload.data?.errors;

        if (backendErrors?.email) {
            return {
                success: false,
                message: errorsT(
                    "REGISTER_INVALID_FIELDS",
                ),
                errors: {
                    email: [
                        validationT(
                            "emailAlreadyUsed",
                        ),
                    ],
                },
            };
        }

        return {
            success: false,
            message: errorsT(
                "REGISTER_INVALID_FIELDS",
            ),
        };
    }

    if (!response.ok) {
        return {
            success: false,
            message: errorsT(
                "REGISTER_FAILED",
            ),
        };
    }

    redirect("/login?registered=1");
}