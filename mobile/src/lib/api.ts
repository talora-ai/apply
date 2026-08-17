const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!configuredApiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
}

const apiUrl: string = configuredApiUrl;

type ApiRequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
    allowEmptyResponse?: boolean;
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
    const isFormData = options.body instanceof FormData;

    const response = await fetch(buildApiUrl(endpoint), {
        method: options.method ?? "GET",
        headers: {
            Accept: "application/json",
            ...(!isFormData ? { "Content-Type": "application/json" } : {}),
            ...(options.token
                ? {
                      Authorization: `Bearer ${options.token}`,
                  }
                : {}),
        },
        body:
            options.body !== undefined
                ? isFormData
                    ? options.body
                    : JSON.stringify(options.body)
                : undefined,
    });

    const payload = (await response.json().catch(() => null)) as T | null;

    if (!response.ok) {
        const message = getApiErrorMessage(payload);

        throw new ApiError(message, response.status, payload);
    }

    if (!payload && options.allowEmptyResponse) {
        return undefined as T;
    }

    if (!payload) {
        throw new ApiError(
            "The API returned an empty response.",
            response.status,
        );
    }

    return payload;
}

function buildApiUrl(endpoint: string): string {
    const normalizedBaseUrl = apiUrl.replace(/\/$/, "");
    const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

    if (
        normalizedBaseUrl.endsWith("/api") &&
        normalizedEndpoint.startsWith("/api/")
    ) {
        return `${normalizedBaseUrl}${normalizedEndpoint.slice(4)}`;
    }

    return `${normalizedBaseUrl}${normalizedEndpoint}`;
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
