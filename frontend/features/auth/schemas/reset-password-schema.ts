import { z } from "zod";

export const resetPasswordSchema = z
    .object({
        email: z
            .string()
            .min(1, "validation.email.required")
            .pipe(z.email("validation.email.invalid")),

        token: z
            .string()
            .min(1, "resetPassword.invalidLink"),

        password: z
            .string()
            .min(1, "validation.password.required")
            .min(8, "validation.password.min")
            .max(32, "validation.password.max"),

        passwordConfirmation: z
            .string()
            .min(
                1,
                "validation.passwordConfirmation.required",
            ),
    })
    .refine(
        (data) =>
            data.password === data.passwordConfirmation,
        {
            message:
                "validation.passwordConfirmation.mismatch",
            path: ["passwordConfirmation"],
        },
    );

export type ResetPasswordData = z.infer<
    typeof resetPasswordSchema
>;