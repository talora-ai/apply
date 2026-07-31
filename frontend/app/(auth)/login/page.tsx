import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Login',
};

export default function LoginPage() {
    return (
        <AuthShell hero={<AuthHero />}>
            <LoginForm />
        </AuthShell>
    );
}