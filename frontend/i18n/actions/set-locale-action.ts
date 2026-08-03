"use server";

import { cookies } from "next/headers";

import {
    isAppLocale,
    localeCookieName,
} from "@/i18n/config";

const LOCALE_COOKIE_DURATION = 60 * 60 * 24 * 365;

export async function setLocaleAction(
    locale: string,
): Promise<void> {
    if (!isAppLocale(locale)) {
        return;
    }

    const cookieStore = await cookies();

    cookieStore.set(localeCookieName, locale, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: LOCALE_COOKIE_DURATION,
    });
}
