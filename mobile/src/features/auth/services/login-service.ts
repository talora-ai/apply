import type {
    LoginApiResponse,
    LoginPayload,
} from "@/features/auth/types/auth";
import { apiRequest } from "@/lib/api";

export function login(
    payload: LoginPayload,
): Promise<LoginApiResponse> {
    return apiRequest<LoginApiResponse>("/auth/login", {
        method: "POST",
        body: payload,
    });
}