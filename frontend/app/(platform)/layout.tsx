import { redirect } from "next/navigation";

import { PlatformShell } from '@/features/platform/components/platform-shell'
import { getAuthenticatedUser } from "@/features/auth/services/get-authenticated-user";

type PlatformLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default async function PlatformLayout({
    children,
}: PlatformLayoutProps) {
    const user = await getAuthenticatedUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <PlatformShell user={user}>
            {children}
        </PlatformShell>
    );
}