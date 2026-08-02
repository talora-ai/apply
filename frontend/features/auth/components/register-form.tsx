"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    useActionState,
    useState,
} from "react";

import { registerAction } from "@/features/auth/actions/register-action";
import type { RegisterState } from "@/features/auth/types/register";

const initialState: RegisterState = {};

export function RegisterForm() {
    const t = useTranslations("Register");

    const [state, formAction, pending] =
        useActionState(
            registerAction,
            initialState,
        );

    const [name, setName] = useState("");
    const [lastName, setLastName] =
        useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] =
        useState("");

    const [
        passwordConfirmation,
        setPasswordConfirmation,
    ] = useState("");

    const [termsAccepted, setTermsAccepted] =
        useState(false);

    return (
        <div>
            <div className="mb-8">
                <Image
                    src="/brand/talora-symbol.svg"
                    alt="Talora"
                    width={44}
                    height={44}
                    priority
                    className="mb-5 size-11 drop-shadow-[0_0_20px_rgba(109,74,255,0.55)] lg:hidden"
                />

                <p className="text-sm font-medium text-[#8B6CFF]">
                    {t("welcome")}
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    {t("title")}
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                    {t("description")}
                </p>
            </div>

            <form
                action={formAction}
                className="space-y-5"
                noValidate
            >
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-slate-200"
                        >
                            {t("name")}
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(event) => {
                                setName(
                                    event.target.value,
                                );
                            }}
                            placeholder={t(
                                "namePlaceholder",
                            )}
                            autoComplete="given-name"
                            minLength={2}
                            maxLength={198}
                            aria-invalid={Boolean(
                                state.errors?.name
                                    ?.length,
                            )}
                            aria-describedby={
                                state.errors?.name
                                    ? "name-error"
                                    : undefined
                            }
                            className="h-12 w-full rounded-xl border border-white/10 bg-[#161C2D] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#6D4AFF] focus:ring-4 focus:ring-[#6D4AFF]/10 aria-invalid:border-red-400/60 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-400/10"
                        />

                        {state.errors?.name?.[0] && (
                            <FieldError
                                id="name-error"
                                message={
                                    state.errors
                                        .name[0]
                                }
                            />
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="last_name"
                            className="mb-2 block text-sm font-medium text-slate-200"
                        >
                            {t("lastName")}
                        </label>

                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            value={lastName}
                            onChange={(event) => {
                                setLastName(
                                    event.target.value,
                                );
                            }}
                            placeholder={t(
                                "lastNamePlaceholder",
                            )}
                            autoComplete="family-name"
                            minLength={2}
                            maxLength={198}
                            aria-invalid={Boolean(
                                state.errors?.last_name
                                    ?.length,
                            )}
                            aria-describedby={
                                state.errors?.last_name
                                    ? "last-name-error"
                                    : undefined
                            }
                            className="h-12 w-full rounded-xl border border-white/10 bg-[#161C2D] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#6D4AFF] focus:ring-4 focus:ring-[#6D4AFF]/10 aria-invalid:border-red-400/60 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-400/10"
                        />

                        {state.errors
                            ?.last_name?.[0] && (
                            <FieldError
                                id="last-name-error"
                                message={
                                    state.errors
                                        .last_name[0]
                                }
                            />
                        )}
                    </div>
                </div>

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
                            setEmail(
                                event.target.value,
                            );
                        }}
                        placeholder={t(
                            "emailPlaceholder",
                        )}
                        autoComplete="email"
                        minLength={5}
                        maxLength={198}
                        aria-invalid={Boolean(
                            state.errors?.email
                                ?.length,
                        )}
                        aria-describedby={
                            state.errors?.email
                                ? "email-error"
                                : undefined
                        }
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#161C2D] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#6D4AFF] focus:ring-4 focus:ring-[#6D4AFF]/10 aria-invalid:border-red-400/60 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-400/10"
                    />

                    {state.errors?.email?.[0] && (
                        <FieldError
                            id="email-error"
                            message={
                                state.errors.email[0]
                            }
                        />
                    )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-slate-200"
                        >
                            {t("password")}
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(
                                    event.target.value,
                                );
                            }}
                            placeholder={t(
                                "passwordPlaceholder",
                            )}
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={32}
                            aria-invalid={Boolean(
                                state.errors?.password
                                    ?.length,
                            )}
                            aria-describedby={
                                state.errors?.password
                                    ? "password-error"
                                    : undefined
                            }
                            className="h-12 w-full rounded-xl border border-white/10 bg-[#161C2D] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#6D4AFF] focus:ring-4 focus:ring-[#6D4AFF]/10 aria-invalid:border-red-400/60 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-400/10"
                        />

                        {state.errors
                            ?.password?.[0] && (
                            <FieldError
                                id="password-error"
                                message={
                                    state.errors
                                        .password[0]
                                }
                            />
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password_confirmation"
                            className="mb-2 block text-sm font-medium text-slate-200"
                        >
                            {t(
                                "passwordConfirmation",
                            )}
                        </label>

                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value={
                                passwordConfirmation
                            }
                            onChange={(event) => {
                                setPasswordConfirmation(
                                    event.target.value,
                                );
                            }}
                            placeholder={t(
                                "passwordConfirmationPlaceholder",
                            )}
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={32}
                            aria-invalid={Boolean(
                                state.errors
                                    ?.password_confirmation
                                    ?.length,
                            )}
                            aria-describedby={
                                state.errors
                                    ?.password_confirmation
                                    ? "password-confirmation-error"
                                    : undefined
                            }
                            className="h-12 w-full rounded-xl border border-white/10 bg-[#161C2D] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#6D4AFF] focus:ring-4 focus:ring-[#6D4AFF]/10 aria-invalid:border-red-400/60 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-400/10"
                        />

                        {state.errors
                            ?.password_confirmation
                            ?.[0] && (
                            <FieldError
                                id="password-confirmation-error"
                                message={
                                    state.errors
                                        .password_confirmation[0]
                                }
                            />
                        )}
                    </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                    {t("passwordHelp")}
                </p>

                <div>
                    <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-400">
                        <input
                            type="checkbox"
                            name="terms"
                            checked={termsAccepted}
                            onChange={(event) => {
                                setTermsAccepted(
                                    event.target
                                        .checked,
                                );
                            }}
                            aria-invalid={Boolean(
                                state.errors?.terms
                                    ?.length,
                            )}
                            aria-describedby={
                                state.errors?.terms
                                    ? "terms-error"
                                    : undefined
                            }
                            className="mt-1 size-4 shrink-0 rounded border-white/20 bg-[#161C2D] accent-[#6D4AFF]"
                        />

                        <span>
                            {t("termsPrefix")}{" "}
                            <Link
                                href="/terms"
                                className="font-medium text-[#8B6CFF] transition hover:text-[#A995FF]"
                            >
                                {t("terms")}
                            </Link>{" "}
                            {t("and")}{" "}
                            <Link
                                href="/privacy"
                                className="font-medium text-[#8B6CFF] transition hover:text-[#A995FF]"
                            >
                                {t("privacy")}
                            </Link>
                            .
                        </span>
                    </label>

                    {state.errors?.terms?.[0] && (
                        <FieldError
                            id="terms-error"
                            message={
                                state.errors.terms[0]
                            }
                        />
                    )}
                </div>

                {state.message &&
                    !state.success && (
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
                    disabled={
                        pending || !termsAccepted
                    }
                    className="flex cursor-pointer h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(109,74,255,0.25)] transition hover:bg-[#7C5CFF] focus:outline-none focus:ring-4 focus:ring-[#6D4AFF]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {pending && <LoadingIcon />}

                    {pending
                        ? t("submitting")
                        : t("submit")}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
                {t("hasAccount")}{" "}
                <Link
                    href="/login"
                    className="font-semibold text-[#8B6CFF] transition hover:text-[#A995FF]"
                >
                    {t("login")}
                </Link>
            </p>
        </div>
    );
}

type FieldErrorProps = {
    id: string;
    message: string;
};

function FieldError({
    id,
    message,
}: FieldErrorProps) {
    return (
        <p
            id={id}
            role="alert"
            className="mt-2 text-sm text-red-400"
        >
            {message}
        </p>
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