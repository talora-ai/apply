import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Forgot Password',
};

export default function ForgotPasswordPage() {
    return (
        <AuthShell hero={<AuthHero />}>
            <ForgotPasswordForm />
        </AuthShell>
    );
}