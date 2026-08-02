"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocaleAction } from "@/i18n/actions/set-locale-action";
import type { AppLocale } from "@/i18n/config";

type LocaleSwitcherProps = {
    compact?: boolean;
};

export function LocaleSwitcher({
    compact = false,
}: LocaleSwitcherProps) {
    const locale = useLocale();
    const t = useTranslations("LocaleSwitcher");
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function changeLocale(nextLocale: AppLocale) {
        if (nextLocale === locale || pending) {
            return;
        }

        startTransition(async () => {
            await setLocaleAction(nextLocale);
            router.refresh();
        });
    }

    return (
        <label className="relative inline-flex items-center">
            <span className="sr-only">{t("label")}</span>

            <Languages
                aria-hidden="true"
                className="pointer-events-none absolute left-3 size-4 text-slate-400"
            />

            <select
                value={locale}
                disabled={pending}
                aria-label={t("label")}
                onChange={(event) => {
                    changeLocale(event.target.value as AppLocale);
                }}
                className={[
                    "cursor-pointer appearance-none rounded-xl border border-slate-700",
                    "bg-[#161C2D] py-2 pl-9 pr-3 text-sm text-slate-200",
                    "outline-none transition hover:border-[#6D4AFF] focus:border-[#6D4AFF]",
                    "disabled:cursor-wait disabled:opacity-60",
                    compact ? "w-24" : "w-36",
                ].join(" ")}
            >
                <option value="pt-BR">{t("portuguese")}</option>
                <option value="en">{t("english")}</option>
            </select>
        </label>
    );
}
