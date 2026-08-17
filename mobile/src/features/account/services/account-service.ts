import type { AuthUser } from "@/features/auth/types/auth";
import { apiRequest } from "@/lib/api";

type UserResponse = { data?: { user?: AuthUser } };

export async function updateProfile(token: string, input: { name: string; last_name: string }): Promise<AuthUser | null> {
    const response = await apiRequest<UserResponse>("/client/user", { method: "PATCH", token, body: input });
    return response.data?.user ?? null;
}

export async function updatePassword(token: string, input: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
    await apiRequest("/client/user/password", { method: "PUT", token, body: input });
}
