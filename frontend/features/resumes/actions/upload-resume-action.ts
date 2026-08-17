"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ResumeUploadState } from "@/features/resumes/types/resume";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function uploadResumeAction(
    _previousState: ResumeUploadState,
    formData: FormData,
): Promise<ResumeUploadState> {
    const file = formData.get("file");
    const rawName = String(formData.get("name") ?? "").trim();

    if (!(file instanceof File) || file.size === 0) {
        return { success: false, message: "Selecione um currículo em PDF ou DOCX." };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: "O currículo deve ter no máximo 10 MB." };
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".docx")) {
        return { success: false, message: "Formato não suportado. Envie um arquivo PDF ou DOCX." };
    }

    const token = (await cookies()).get("talora_token")?.value;
    const apiUrl = process.env.API_URL;
    if (!token) redirect("/login");
    if (!apiUrl) return { success: false, message: "A URL da API não está configurada." };

    const payload = new FormData();
    payload.set("file", file);
    payload.set("name", rawName || file.name.replace(/\.[^.]+$/, ""));

    try {
        const response = await fetch(`${apiUrl}/client/user/resumes`, {
            method: "POST",
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            body: payload,
            cache: "no-store",
        });
        const body = (await response.json().catch(() => null)) as { message?: string; data?: { message?: string } } | null;
        if (!response.ok) {
            return { success: false, message: body?.data?.message ?? body?.message ?? "Não foi possível enviar o currículo." };
        }
        revalidatePath("/resumes");
        revalidatePath("/dashboard");
        return { success: true, message: "Currículo enviado com sucesso e adicionado à fila de processamento." };
    } catch {
        return { success: false, message: "Não foi possível conectar com a API." };
    }
}
