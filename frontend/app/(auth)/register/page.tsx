import type { Metadata } from "next";

import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
    title: "Criar conta",
};

export default function RegisterPage() {
    return (
        <AuthShell hero={<AuthHero />}>
            <RegisterForm />
        </AuthShell>
    );
}