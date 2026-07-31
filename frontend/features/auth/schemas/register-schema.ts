import { z } from "zod";

type RegisterValidationMessages = {
    nameMin: string;
    nameMax: string;
    lastNameMin: string;
    lastNameMax: string;
    emailInvalid: string;
    emailMax: string;
    passwordMin: string;
    passwordMax: string;
    passwordConfirmationRequired: string;
    passwordMismatch: string;
    termsRequired: string;
};

export function createRegisterSchema(
    messages: RegisterValidationMessages,
) {
    return z
        .object({
            name: z
                .string()
                .trim()
                .min(2, messages.nameMin)
                .max(198, messages.nameMax),

            last_name: z
                .string()
                .trim()
                .min(2, messages.lastNameMin)
                .max(198, messages.lastNameMax),

            email: z
                .string()
                .trim()
                .min(5, messages.emailInvalid)
                .max(198, messages.emailMax)
                .pipe(
                    z.email(
                        messages.emailInvalid,
                    ),
                ),

            password: z
                .string()
                .min(8, messages.passwordMin)
                .max(32, messages.passwordMax),

            password_confirmation: z
                .string()
                .min(
                    1,
                    messages.passwordConfirmationRequired,
                )
                .max(32, messages.passwordMax),

            terms: z
                .boolean()
                .refine((accepted) => accepted, {
                    message:
                        messages.termsRequired,
                }),
        })
        .refine(
            (data) =>
                data.password ===
                data.password_confirmation,
            {
                path: [
                    "password_confirmation",
                ],
                message:
                    messages.passwordMismatch,
            },
        );
}

export type RegisterData = z.infer<
    ReturnType<typeof createRegisterSchema>
>;