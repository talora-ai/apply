export const locales = [
    "pt-BR",
    "en",
] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "pt-BR";
export const localeCookieName = "talora-apply-locale";

export function isAppLocale(
    locale: string | undefined,
): locale is AppLocale {
    return locales.some((item) => item === locale);
}
