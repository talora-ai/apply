"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteResumeAction(id: number): Promise<{ success: boolean; message: string }> {
    const token = (await cookies()).get("talora_token")?.value;
    const apiUrl = process.env.API_URL;
    if (!token || !apiUrl || !Number.isInteger(id) || id < 1) {
        return { success: false, message: "Não foi possível excluir o currículo." };
    }

    try {
        const response = await fetch(`${apiUrl}/client/user/resumes/${id}`, {
            method: "DELETE",
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!response.ok) return { success: false, message: "Não foi possível excluir o currículo." };
        revalidatePath("/resumes");
        revalidatePath("/dashboard");
        return { success: true, message: "Currículo excluído." };
    } catch {
        return { success: false, message: "Não foi possível excluir o currículo." };
    }
}
