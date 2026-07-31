const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
}

type ApiRequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
};

export class ApiError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
        public readonly data?: unknown,
    ) {
        super(message);

        this.name = "ApiError";
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const response = await fetch(`${apiUrl}${endpoint}`, {
        method: options.method ?? "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(options.token
                ? {
                      Authorization: `Bearer ${options.token}`,
                  }
                : {}),
        },
        body:
            options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined,
    });

    const payload = (await response.json().catch(() => null)) as T | null;

    if (!response.ok) {
        const message = getApiErrorMessage(payload);

        throw new ApiError(message, response.status, payload);
    }

    if (!payload) {
        throw new ApiError(
            "The API returned an empty response.",
            response.status,
        );
    }

    return payload;
}

function getApiErrorMessage(payload: unknown): string {
    if (!payload || typeof payload !== "object") {
        return "An unexpected error occurred.";
    }

    const response = payload as {
        message?: string;
        data?: {
            message?: string;
        };
    };

    return (
        response.data?.message ??
        response.message ??
        "An unexpected error occurred."
    );
}