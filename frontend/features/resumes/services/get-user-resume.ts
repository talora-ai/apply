import "server-only";

import { cookies } from "next/headers";
import type { UserResumeDetail, UserResumeDetailResponse } from "@/features/resumes/types/resume";

export async function getUserResume(id: number): Promise<UserResumeDetail | null> {
    const token = (await cookies()).get("talora_token")?.value;
    const apiUrl = process.env.API_URL;
    if (!token || !apiUrl || !Number.isInteger(id) || id < 1) return null;

    try {
        const response = await fetch(`${apiUrl}/client/user/resumes/${id}`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!response.ok) return null;
        const payload = (await response.json()) as UserResumeDetailResponse;
        return payload.data?.resume ?? null;
    } catch {
        return null;
    }
}
