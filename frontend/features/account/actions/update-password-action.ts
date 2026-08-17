"use server";

import { cookies } from "next/headers";
import type { AccountActionState } from "@/features/account/actions/update-profile-action";

export async function updatePasswordAction(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
    const token = (await cookies()).get("talora_token")?.value;
    const apiUrl = process.env.API_URL;
    if (!token || !apiUrl) return { success: false, message: "Sessão inválida." };

    const currentPassword = String(formData.get("current_password") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("password_confirmation") ?? "");
    if (password.length < 8) return { success: false, message: "A nova senha deve ter pelo menos 8 caracteres." };
    if (password !== confirmation) return { success: false, message: "A confirmação da nova senha não confere." };

    try {
        const response = await fetch(`${apiUrl}/client/user/password`, {
            method: "PUT",
            headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ current_password: currentPassword, password, password_confirmation: confirmation }),
            cache: "no-store",
        });
        const payload = await response.json().catch(() => null) as { message?: string; data?: { message?: string } } | null;
        if (!response.ok) return { success: false, message: payload?.data?.message ?? payload?.message ?? "Não foi possível alterar a senha." };
        return { success: true, message: "Senha alterada com sucesso." };
    } catch {
        return { success: false, message: "Não foi possível conectar ao servidor." };
    }
}
