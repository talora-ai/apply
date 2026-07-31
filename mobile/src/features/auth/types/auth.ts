export type RegisterPayload = {
    name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export type AuthUser = {
    id: number;
    name: string;
    last_name?: string;
    email: string;
};

export type RegisterApiResponse = {
    message: string;
    data?: {
        user?: AuthUser;
    };
};

export type LoginPayload = {
    email: string;
    password: string;
    remember: boolean;
};

export type LoginApiResponse = {
    message: string;
    data: {
        type: "Bearer";
        token: string;
    };
};