import type {
    RegisterApiResponse,
    RegisterPayload,
} from "@/features/auth/types/auth";
import { apiRequest } from "@/lib/api";

export function register(
    payload: RegisterPayload,
): Promise<RegisterApiResponse> {
    return apiRequest<RegisterApiResponse>("/auth/register", {
        method: "POST",
        body: payload,
    });
}