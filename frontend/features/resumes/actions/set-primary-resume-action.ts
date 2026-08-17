"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type SetPrimaryResumeState = { success: boolean; message?: string };

export async function setPrimaryResumeAction(
    _previousState: SetPrimaryResumeState,
    formData: FormData,
): Promise<SetPrimaryResumeState> {
    const id = Number(formData.get("resume_id"));
    if (!Number.isInteger(id) || id <= 0) {
        return { success: false, message: "Currículo inválido." };
    }

    const token = (await cookies()).get("talora_token")?.value;
    const apiUrl = process.env.API_URL;
    if (!token || !apiUrl) {
        return { success: false, message: "Não foi possível acessar a API." };
    }

    try {
        const response = await fetch(`${apiUrl}/client/user/resumes/${id}/primary`, {
            method: "PATCH",
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        const body = (await response.json().catch(() => null)) as { message?: string; data?: { message?: string } } | null;
        if (!response.ok) {
            return { success: false, message: body?.data?.message ?? body?.message ?? "Não foi possível alterar o currículo principal." };
        }

        revalidatePath("/resumes");
        revalidatePath("/dashboard");
        revalidatePath("/jobs/search");
        revalidatePath("/analytics");
        revalidatePath("/applications");
        revalidatePath("/favorites");
        return { success: true, message: "Currículo principal alterado. As compatibilidades serão recalculadas com este CV." };
    } catch {
        return { success: false, message: "Não foi possível conectar com a API." };
    }
}
