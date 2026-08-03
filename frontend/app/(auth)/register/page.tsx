import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata.register");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function RegisterPage() {
    return (
        <AuthShell hero={<AuthHero />}>
            <RegisterForm />
        </AuthShell>
    );
}
