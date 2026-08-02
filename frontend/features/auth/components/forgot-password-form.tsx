"use client";

import { forgotPasswordAction } from "@/features/auth/actions/forgot-password-action";
import type { ForgotPasswordState } from "@/features/auth/types/auth";
import {
    useActionState,
    useEffect,
    useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const initialState: ForgotPasswordState = {
    success: false,
};

export function ForgotPasswordForm() {
    const t = useTranslations();
    const router = useRouter();

    const [email, setEmail] = useState("");

    const [state, formAction, pending] = useActionState(
        forgotPasswordAction,
        initialState,
    );

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

    const emailError = state.errors?.email?.[0];

    return (
        <div className="w-full max-w-md">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    {t("forgotPassword.title")}
                </h1>

                <p className="mt-3 leading-relaxed text-slate-400">
                    {t("forgotPassword.description")}
                </p>
            </div>

            <form
                action={formAction}
                className="space-y-5"
            >
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-200"
                    >
                        {t("forgotPassword.email")}
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                        }}
                        placeholder={t(
                            "forgotPassword.emailPlaceholder",
                        )}
                        autoComplete="email"
                        autoFocus
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={
                            emailError
                                ? "email-error"
                                : undefined
                        }
                        className={[
                            "w-full rounded-xl border bg-white/5 px-4 py-3",
                            "text-white outline-none transition",
                            "placeholder:text-slate-500",
                            "focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20",
                            emailError
                                ? "border-red-400/60"
                                : "border-white/10",
                        ].join(" ")}
                    />

                    {emailError && (
                        <p
                            id="email-error"
                            className="mt-2 text-sm text-red-300"
                        >
                            {t(emailError)}
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
                        {t(state.message)}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={pending || state.success}
                    className={[
                        "flex w-full items-center justify-center rounded-xl",
                        "bg-linear-to-r from-fuchsia-600 to-violet-600",
                        "px-5 py-3 font-semibold text-white transition",
                        "hover:from-fuchsia-500 hover:to-violet-500",
                        "focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        "cursor-pointer"
                    ].join(" ")}
                >
                    {pending
                        ? t("forgotPassword.submitting")
                        : t("forgotPassword.submit")}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-sm font-medium text-fuchsia-400 transition hover:text-fuchsia-300"
                >
                    ← {t("forgotPassword.backToLogin")}
                </Link>
            </div>
        </div>
    );
}