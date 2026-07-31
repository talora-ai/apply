import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "validation.email.required")
        .pipe(z.email("validation.email.invalid")),
});

export type ForgotPasswordData = z.infer<
    typeof forgotPasswordSchema
>;