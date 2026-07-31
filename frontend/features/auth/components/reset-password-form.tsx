"use client";

import {
    useActionState,
    useEffect,
    useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { resetPasswordAction } from "@/features/auth/actions/reset-password-action";

import type { ResetPasswordState } from "@/features/auth/types/auth";

type ResetPasswordFormProps = {
    email: string;
    token: string;
};

const initialState: ResetPasswordState = {
    success: false,
};

export function ResetPasswordForm({
    email,
    token,
}: ResetPasswordFormProps) {
    const t = useTranslations();
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [
        passwordConfirmation,
        setPasswordConfirmation,
    ] = useState("");

    const [state, formAction, pending] = useActionState(
        resetPasswordAction,
        initialState,
    );

    const invalidLink = !email || !token;

    const passwordError =
        state.errors?.password?.[0];

    const passwordConfirmationError =
        state.errors?.passwordConfirmation?.[0];

    useEffect(() => {
        if (!state.success) {
            return;
        }

        const redirectTimeout = window.setTimeout(() => {
            router.replace("/login");
        }, 3000);

        return () => {
            window.clearTimeout(redirectTimeout);
        };
    }, [router, state.success]);

    if (invalidLink) {
        return (
            <div className="w-full max-w-md">
                <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-4 text-red-300">
                    <p role="alert">
                        {t("resetPassword.invalidLink")}
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-fuchsia-400 transition hover:text-fuchsia-300"
                    >
                        ← {t("resetPassword.backToLogin")}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    {t("resetPassword.title")}
                </h1>

                <p className="mt-3 leading-relaxed text-slate-400">
                    {t("resetPassword.description")}
                </p>
            </div>

            <form
                action={formAction}
                className="space-y-5"
            >
                <input
                    type="hidden"
                    name="email"
                    value={email}
                />

                <input
                    type="hidden"
                    name="token"
                    value={token}
                />

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-slate-200"
                    >
                        {t("resetPassword.password")}
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                        }}
                        placeholder={t(
                            "resetPassword.passwordPlaceholder",
                        )}
                        autoComplete="new-password"
                        autoFocus
                        disabled={pending || state.success}
                        aria-invalid={Boolean(passwordError)}
                        aria-describedby={
                            passwordError
                                ? "password-error"
                                : undefined
                        }
                        className={[
                            "w-full rounded-xl border bg-white/5 px-4 py-3",
                            "text-white outline-none transition",
                            "placeholder:text-slate-500",
                            "focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            passwordError
                                ? "border-red-400/60"
                                : "border-white/10",
                        ].join(" ")}
                    />

                    {passwordError && (
                        <p
                            id="password-error"
                            className="mt-2 text-sm text-red-300"
                        >
                            {t(passwordError)}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="passwordConfirmation"
                        className="mb-2 block text-sm font-medium text-slate-200"
                    >
                        {t(
                            "resetPassword.passwordConfirmation",
                        )}
                    </label>

                    <input
                        id="passwordConfirmation"
                        name="passwordConfirmation"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(event) => {
                            setPasswordConfirmation(
                                event.target.value,
                            );
                        }}
                        placeholder={t(
                            "resetPassword.passwordConfirmationPlaceholder",
                        )}
                        autoComplete="new-password"
                        disabled={pending || state.success}
                        aria-invalid={Boolean(
                            passwordConfirmationError,
                        )}
                        aria-describedby={
                            passwordConfirmationError
                                ? "password-confirmation-error"
                                : undefined
                        }
                        className={[
                            "w-full rounded-xl border bg-white/5 px-4 py-3",
                            "text-white outline-none transition",
                            "placeholder:text-slate-500",
                            "focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            passwordConfirmationError
                                ? "border-red-400/60"
                                : "border-white/10",
                        ].join(" ")}
                    />

                    {passwordConfirmationError && (
                        <p
                            id="password-confirmation-error"
                            className="mt-2 text-sm text-red-300"
                        >
                            {t(
                                passwordConfirmationError,
                            )}
                        </p>
                    )}
                </div>

                {state.message && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className={[
                            "rounded-xl border px-4 py-3 text-sm",
                            state.success
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-red-400/20 bg-red-400/10 text-red-300",
                        ].join(" ")}
                    >
                        <p>{t(state.message)}</p>

                        {state.success && (
                            <p className="mt-1 text-xs text-emerald-200/70">
                                {t(
                                    "resetPassword.redirecting",
                                )}
                            </p>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={
                        pending ||
                        state.success ||
                        invalidLink
                    }
                    className={[
                        "flex w-full items-center justify-center rounded-xl",
                        "bg-linear-to-r from-fuchsia-600 to-violet-600",
                        "px-5 py-3 font-semibold text-white transition",
                        "hover:from-fuchsia-500 hover:to-violet-500",
                        "focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                    ].join(" ")}
                >
                    {pending
                        ? t("resetPassword.submitting")
                        : t("resetPassword.submit")}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-sm font-medium text-fuchsia-400 transition hover:text-fuchsia-300"
                >
                    ← {t("resetPassword.backToLogin")}
                </Link>
            </div>
        </div>
    );
}