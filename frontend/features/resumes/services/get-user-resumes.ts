import "server-only";

import { cookies } from "next/headers";

import type { UserResume, UserResumesResponse } from "@/features/resumes/types/resume";

export async function getUserResumes(explicitToken?: string): Promise<UserResume[] | null> {
    const token = explicitToken ?? (await cookies()).get("talora_token")?.value;
    const apiUrl = process.env.API_URL;

    if (!token || !apiUrl) {
        return null;
    }

    try {
        const response = await fetch(`${apiUrl}/client/user/resumes`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const payload = (await response.json()) as UserResumesResponse;
        return payload.data?.resumes ?? [];
    } catch {
        return null;
    }
}
