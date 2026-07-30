"use client";

import { LogOut } from "lucide-react";
import {
    useActionState,
    useEffect,
} from "react";
import { toast } from "sonner";

import {
    logoutAction,
    type LogoutState,
} from "@/features/auth/actions/logout-action";

import { useTranslations } from "next-intl";

const initialState: LogoutState = {};

export function LogoutButton() {

    const t = useTranslations("Components.Platform.Logout_Button");

    const [state, formAction, pending] =
        useActionState(
            logoutAction,
            initialState,
        );

    useEffect(() => {
        if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <form action={formAction}>
            <button
                type="submit"
                disabled={pending}
                className="flex cursor-pointer w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <LogOut className="size-4" />

                {pending ? t("outing") + '...' : t("out")}
            </button>
        </form>
    );
}