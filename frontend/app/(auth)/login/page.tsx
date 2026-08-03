import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata.login");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function LoginPage() {
    return (
        <AuthShell hero={<AuthHero />}>
            <LoginForm />
        </AuthShell>
    );
}
