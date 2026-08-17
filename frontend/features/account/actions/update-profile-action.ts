"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type AccountActionState = { success?: boolean; message?: string; errors?: Record<string, string[]> };

export async function updateProfileAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
    const token = (await cookies()).get("talora_token")?.value;
    const apiUrl = process.env.API_URL;
    if (!token || !apiUrl) return { success: false, message: "Sessão inválida." };

    const name = String(formData.get("name") ?? "").trim();
    const lastName = String(formData.get("last_name") ?? "").trim();
    if (name.length < 2 || lastName.length < 2) return { success: false, message: "Preencha nome e sobrenome corretamente." };

    try {
        const response = await fetch(`${apiUrl}/client/user`, {
            method: "PATCH",
            headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, last_name: lastName }),
            cache: "no-store",
        });
        const payload = await response.json().catch(() => null) as { message?: string; data?: { message?: string; errors?: Record<string, string[]> } } | null;
        if (!response.ok) return { success: false, message: payload?.data?.message ?? payload?.message ?? "Não foi possível atualizar seus dados.", errors: payload?.data?.errors };
        revalidatePath("/settings");
        revalidatePath("/profile");
        revalidatePath("/dashboard");
        return { success: true, message: "Dados atualizados com sucesso." };
    } catch {
        return { success: false, message: "Não foi possível conectar ao servidor." };
    }
}
