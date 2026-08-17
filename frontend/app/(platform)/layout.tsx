import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/features/auth/services/get-authenticated-user";
import { PlatformShell } from "@/features/platform/components/platform-shell";
import { getUserResumes } from "@/features/resumes/services/get-user-resumes";

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

    const resumes = await getUserResumes();

    if (resumes !== null && resumes.length === 0) {
        redirect("/resume-upload");
    }

    return (
        <PlatformShell user={user}>
            {children}
        </PlatformShell>
    );
}
