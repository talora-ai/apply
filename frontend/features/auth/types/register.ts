export type RegisterField =
    | "name"
    | "last_name"
    | "email"
    | "password"
    | "password_confirmation"
    | "terms";

export type RegisterState = {
    success?: boolean;
    message?: string;
    errors?: Partial<
        Record<RegisterField, string[]>
    >;
};

export type RegisterApiResponse = {
    message?: string;

    errors?: Record<string, string[]>;

    data?: {
        message?: string;
        errors?: Record<string, string[]>;
    };
};