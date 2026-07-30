"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    useActionState,
    useState,
} from "react";

import { loginAction } from "@/features/auth/actions/login-action";
import type { LoginState } from "@/features/auth/types/auth";

const initialState: LoginState = {};

export function LoginForm() {
    const t = useTranslations("Login");

    const [state, formAction, pending] = useActionState(
        loginAction,
        initialState,
    );

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <div className="mb-8">
                <Image
                    src="/brand/talora-apply-horizontal-negative.svg"
                    alt="Talora"
                    width={350}
                    height={350}
                    priority
                    className="mb-5 drop-shadow-[0_0_20px_rgba(109,74,255,0.55)] lg:hidden"
                />
            </div>

            <form
                action={formAction}
                className="space-y-5"
                noValidate
            >
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-200"
                    >
                        {t("email")}
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                        }}
                        placeholder={t("emailPlaceholder")}
                        autoComplete="email"
                        aria-invalid={Boolean(
                            state.errors?.email?.length,
                        )}
                        aria-describedby={
                            state.errors?.email
                                ? "email-error"
                                : undefined
                        }
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#161C2D] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#6D4AFF] focus:ring-4 focus:ring-[#6D4AFF]/10 aria-invalid:border-red-400/60 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-400/10"
                    />

                    {state.errors?.email?.[0] && (
                        <p
                            id="email-error"
                            role="alert"
                            className="mt-2 text-sm text-red-400"
                        >
                            {state.errors.email[0]}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-slate-200"
                    >
                        {t("password")}
                    </label>

                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                            placeholder={t("passwordPlaceholder")}
                            autoComplete="current-password"
                            aria-invalid={Boolean(
                                state.errors?.password?.length,
                            )}
                            aria-describedby={
                                state.errors?.password
                                    ? "password-error"
                                    : undefined
                            }
                            className="h-12 w-full rounded-xl border border-white/10 bg-[#161C2D] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#6D4AFF] focus:ring-4 focus:ring-[#6D4AFF]/10 aria-invalid:border-red-400/60 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-400/10"
                        />

                        <button
                            type="button"
                            onClick={() => {
                                setShowPassword(
                                    (current) => !current,
                                );
                            }}
                            aria-label={
                                showPassword
                                    ? t("hidePassword")
                                    : t("showPassword")
                            }
                            aria-pressed={showPassword}
                            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-200 focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeOffIcon />
                            ) : (
                                <EyeIcon />
                            )}
                        </button>
                    </div>

                    {state.errors?.password?.[0] && (
                        <p
                            id="password-error"
                            role="alert"
                            className="mt-2 text-sm text-red-400"
                        >
                            {state.errors.password[0]}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={remember}
                            onChange={(event) => {
                                setRemember(
                                    event.target.checked,
                                );
                            }}
                            className="size-4 rounded border-white/20 bg-[#161C2D] accent-[#6D4AFF]"
                        />

                        <span>{t("remember")}</span>
                    </label>

                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-[#8B6CFF] transition hover:text-[#A995FF]"
                    >
                        {t("forgotPassword")}
                    </Link>
                </div>

                {state.message && !state.success && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                    >
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="flex cursor-pointer h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(109,74,255,0.25)] transition hover:bg-[#7C5CFF] focus:outline-none focus:ring-4 focus:ring-[#6D4AFF]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending && <LoadingIcon />}

                    {pending
                        ? t("submitting")
                        : t("submit")}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
                {t("noAccount")}{" "}
                <Link
                    href="/register"
                    className="font-semibold text-[#8B6CFF] transition hover:text-[#A995FF]"
                >
                    {t("createAccount")}
                </Link>
            </p>
        </div>
    );
}

function EyeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="size-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6S2.25 12 2.25 12Z"
            />

            <circle
                cx="12"
                cy="12"
                r="2.75"
            />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="size-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3 3 18 18"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.6 6.14A10.8 10.8 0 0 1 12 6c6.25 0 9.75 6 9.75 6a18.7 18.7 0 0 1-2.15 2.78M6.2 6.2C3.64 8.05 2.25 12 2.25 12s3.5 6 9.75 6a10.5 10.5 0 0 0 3.13-.47"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.88 9.88a3 3 0 0 0 4.24 4.24"
            />
        </svg>
    );
}

function LoadingIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="size-4 animate-spin"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
            />

            <path
                fill="currentColor"
                className="opacity-90"
                d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
            />
        </svg>
    );
}