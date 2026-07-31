export const locales = [
    "pt-BR",
    "en",
] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export function isAppLocale(
    locale: string | undefined,
): locale is AppLocale {
    return locales.some((item) => item === locale);
}