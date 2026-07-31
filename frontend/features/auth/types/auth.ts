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

export type ForgotPasswordState = {
    success: boolean;
    message?: string;
    errors?: {
        email?: string[];
    };
};

export type ForgotPasswordApiResponse = {
    success?: boolean;
    message?: string;
    data?: {
        message?: string;
    };
};

export type ResetPasswordState = {
    success: boolean;
    message?: string;
    errors?: {
        email?: string[];
        token?: string[];
        password?: string[];
        passwordConfirmation?: string[];
    };
};

export type ResetPasswordApiResponse = {
    success?: boolean;
    message?: string;
    data?: {
        message?: string;
    };
};