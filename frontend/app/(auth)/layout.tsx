import type { ReactNode } from "react";

type AuthLayoutProps = {
    children: ReactNode
};

export default function AuthLayout({
    children
}: AuthLayoutProps) {
    return (
        <main className="min-h-svh bg-[#0B1020] text-white">
            { children }
        </main>
    );
}