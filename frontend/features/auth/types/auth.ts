export type LoginState = {
    success?: boolean;
    message?: string;

    errors?: {
        email?: string[];
        password?: string[];
    };
};

export type LoginApiResponse = {
    message: string;

    data?: {
        type?: string;
        token?: string;
        message?: string;
    };
};