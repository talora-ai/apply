import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/features/auth/services/get-authenticated-user";
import { PlatformShell } from "@/features/platform/components/platform-shell";

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
