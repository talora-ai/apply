import type { UserResume, UserResumeDetail, UserResumeDetailResponse, UserResumesResponse } from "@/features/resumes/types/resume";
import { apiRequest } from "@/lib/api";

export async function getResumes(token: string): Promise<UserResume[]> {
    const response = await apiRequest<UserResumesResponse>("/client/user/resumes", { token });
    return response.data?.resumes ?? [];
}

export async function getResume(token: string, id: number): Promise<UserResumeDetail | null> {
    const response = await apiRequest<UserResumeDetailResponse>(`/client/user/resumes/${id}`, { token });
    return response.data?.resume ?? null;
}

export async function deleteResume(token: string, id: number): Promise<void> {
    await apiRequest(`/client/user/resumes/${id}`, { method: "DELETE", token });
}

export async function setPrimaryResume(token: string, id: number): Promise<void> {
    await apiRequest(`/client/user/resumes/${id}/primary`, { method: "PATCH", token });
}

export async function uploadResume({ token, file, name }: { token: string; file: { uri: string; name: string; mimeType?: string | null }; name: string }): Promise<void> {
    const body = new FormData();
    body.append("name", name);
    body.append("file", { uri: file.uri, name: file.name, type: file.mimeType ?? (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document") } as unknown as Blob);
    await apiRequest("/client/user/resumes", { method: "POST", token, body });
}
