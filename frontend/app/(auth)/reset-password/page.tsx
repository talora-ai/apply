import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

type ResetPasswordPageProps = {
    searchParams: Promise<{
        email?: string | string[];
        token?: string | string[];
    }>;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata.resetPassword");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const params = await searchParams;

    const email = getSearchParam(params.email);
    const token = getSearchParam(params.token);

    return (
        <AuthShell hero={<AuthHero />}>
            <ResetPasswordForm
                email={email}
                token={token}
            />
        </AuthShell>
    );
}

function getSearchParam(
    value: string | string[] | undefined,
): string {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}
