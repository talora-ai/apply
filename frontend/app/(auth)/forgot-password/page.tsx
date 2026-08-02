import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata.forgotPassword");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function ForgotPasswordPage() {
    return (
        <AuthShell hero={<AuthHero />}>
            <ForgotPasswordForm />
        </AuthShell>
    );
}
