"use client";

import type { LucideIcon } from "lucide-react";
import {
    Bell,
    BriefcaseBusiness,
    ChartNoAxesColumnIncreasing,
    CheckCheck,
    ChevronDown,
    CreditCard,
    FileScan,
    FileText,
    Heart,
    LayoutDashboard,
    Menu,
    Search,
    Settings,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    useEffect,
    useState,
} from "react";

import type { AuthenticatedUser } from "@/features/auth/types/user";
import { LogoutButton } from "@/features/platform/components/logout-button";
import { LocaleSwitcher } from "@/i18n/components/locale-switcher";

type PlatformShellProps = Readonly<{
    user: AuthenticatedUser;
    children: React.ReactNode;
}>;

type NavigationItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

const navigation: NavigationItem[] = [
    {
        title: "dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "search_jobs",
        href: "/jobs/search",
        icon: Search,
    },
    {
        title: "applications",
        href: "/applications",
        icon: BriefcaseBusiness,
    },
    {
        title: "resumes",
        href: "/resumes",
        icon: FileText,
    },
    {
        title: "favorites",
        href: "/favorites",
        icon: Heart,
    },
    {
        title: "analytics",
        href: "/analytics",
        icon: ChartNoAxesColumnIncreasing,
    },
    {
        title: "settings",
        href: "/settings",
        icon: Settings,
    },
];

type NavigationLinkProps = {
    item: NavigationItem;
    active: boolean;
    onNavigate: () => void;
};

function NavigationLink({
    item,
    active,
    onNavigate,
}: NavigationLinkProps) {
    const Icon = item.icon;


    const t = useTranslations("Links");

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={[
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                active
                    ? "bg-linear-to-r from-[#6D4AFF] to-[#4822C7] font-semibold shadow-[0_0_32px_rgba(109,74,255,0.18)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
            ].join(" ")}
        >
            <Icon className="size-5" />
            {t(item.title)}
        </Link>
    );
}

type SearchInputProps = {
    className?: string;
};

function SearchInput({
    className = "",
}: SearchInputProps) {

    const t = useTranslations("sidebar");

    return (
        <label className={`relative ${className}`}>
            <span className="sr-only">
                {t("search")}
            </span>

            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />

            <input
                type="search"
                placeholder={t("search_job")}
                className="w-full rounded-xl border border-slate-700 bg-[#161C2D] py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-[#6D4AFF] md:w-72 xl:w-96"
            />
        </label>
    );
}

function NotificationsDropdown() {
    const t = useTranslations("sidebar");

    return (
        <div
            className="absolute right-0 top-14 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-[#161C2D] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
        >
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                <strong className="text-sm">
                    {t("notifications")}
                </strong>

                <button
                    type="button"
                    className="text-xs text-[#15D0A5] hover:underline"
                >
                    {t("markAsRead")}
                </button>
            </div>

            <div className="divide-y divide-slate-700/70">
                <Link
                    href="#"
                    className="flex gap-3 p-4 transition hover:bg-white/5"
                >
                    <span className="rounded-xl bg-[#15D0A5]/10 p-2 text-[#15D0A5]">
                        <CheckCheck className="size-5" />
                    </span>

                    <span>
                        <strong className="block text-sm">
                            Vaga inscrita
                        </strong>

                        <span className="mt-1 block text-xs text-slate-400">
                            Alguma coisa
                        </span>
                    </span>
                </Link>

                <Link
                    href="#"
                    className="flex gap-3 p-4 transition hover:bg-white/5"
                >
                    <span className="rounded-xl bg-[#6D4AFF]/10 p-2 text-[#8B6CFF]">
                        <FileScan className="size-5" />
                    </span>

                    <span>
                        <strong className="block text-sm">
                            CV Analisado
                        </strong>

                        <span className="mt-1 block text-xs text-slate-400">
                            alguma coisa
                        </span>
                    </span>
                </Link>
            </div>
        </div>
    );
}

type ProfileDropdownProps = {
    user: AuthenticatedUser;
};

function ProfileDropdown({
    user,
}: ProfileDropdownProps) {
    const t = useTranslations("sidebar");

    return (
        <div
            className="absolute right-0 top-14 z-30 w-64 overflow-hidden rounded-2xl border border-slate-700 bg-[#161C2D] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
        >
            <div className="border-b border-slate-700 px-4 py-4">
                <strong className="block text-sm">
                    {user.name ?? t("fallbackUser")}
                </strong>

                <span className="mt-1 block truncate text-xs text-slate-400">
                    {user.email}
                </span>
            </div>

            <div className="p-2">
                <DropdownLink
                    href="/profile"
                    icon={UserRound}
                    title={t("myProfile")}
                />

                <DropdownLink
                    href="/billing"
                    icon={CreditCard}
                    title={t("billing")}
                />

                <DropdownLink
                    href="/settings"
                    icon={Settings}
                    title={t("settings")}
                />
            </div>

            <div className="border-t border-slate-700 p-2">
                <LogoutButton />
            </div>
        </div>
    );
}

type DropdownLinkProps = {
    href: string;
    icon: LucideIcon;
    title: string;
};

function DropdownLink({
    href,
    icon: Icon,
    title,
}: DropdownLinkProps) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
            <Icon className="size-4" />
            {title}
        </Link>
    );
}

function getInitials(value: string): string {
    return value
        .split(/[\s.@_-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export function PlatformShell({
    user,
    children,
}: PlatformShellProps) {
    const pathname = usePathname();
    const t = useTranslations("sidebar");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [notificationsOpen, setNotificationsOpen] =
        useState(false);

    const [profileOpen, setProfileOpen] =
        useState(false);

    useEffect(() => {
        document.body.classList.toggle(
            "overflow-hidden",
            sidebarOpen,
        );

        return () => {
            document.body.classList.remove(
                "overflow-hidden",
            );
        };
    }, [sidebarOpen]);

    useEffect(() => {
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key !== "Escape") {
                return;
            }

            setSidebarOpen(false);
            setNotificationsOpen(false);
            setProfileOpen(false);
        }

        window.addEventListener(
            "keydown",
            closeOnEscape,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                closeOnEscape,
            );
        };
    }, []);

    const firstName =
        user.name?.split(" ")[0] ?? t("fallbackUser");

    const initials = getInitials(
        user.name ?? user.email,
    );

    function closeDropdowns() {
        setNotificationsOpen(false);
        setProfileOpen(false);
    }

    return (
        <div className="platform-background min-h-svh text-slate-100">
            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    aria-label={t("closeMenu")}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={[
                    "fixed inset-y-0 left-0 z-50",
                    "flex w-72 flex-col overflow-y-auto overscroll-contain",
                    "border-r border-slate-800/90 bg-[#0B1020]",
                    "px-4 py-5 transition-transform duration-300",
                    "[scrollbar-color:#334155_transparent] [scrollbar-thin]",
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full",
                    "lg:translate-x-0",
                ].join(" ")}
                aria-label={t("mainNavigation")}
            >
                <div className="flex items-center justify-between px-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3"
                        aria-label="Talora Apply"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Image
                            src="/brand/talora-apply-icon.svg"
                            alt=""
                            width={44}
                            height={44}
                            priority
                            className="size-11 shrink-0"
                        />

                        <span className="text-xl font-semibold">
                            talora{" "}
                            <span className="font-medium text-[#15D0A5]">
                                apply
                            </span>
                        </span>
                    </Link>

                    <button
                        type="button"
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
                        aria-label={t("closeMenu")}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <nav className="mt-10 space-y-2">
                    {navigation.map((item) => (
                        <NavigationLink
                            key={item.href}
                            item={item}
                            active={
                                pathname === item.href
                            }
                            onNavigate={() => {
                                setSidebarOpen(false);
                            }}
                        />
                    ))}
                </nav>

                <div className="panel mt-auto md:mt-15 rounded-2xl border border-slate-700/70 p-5">
                    
                    <h2 className="font-semibold flex gap-2">
                        <Sparkles className="size-6 text-[#15D0A5]" />
                        {t("upgrade.title")}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        {t("upgrade.text")}
                    </p>

                    <button
                        type="button"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#15D0A5] px-4 py-3 text-sm font-semibold text-[#0B1020] transition hover:bg-emerald-300"
                    >
                        {t("upgrade.upgrade_now")}
                        <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </aside>

            <main
                className="min-h-svh lg:pl-72"
                onClick={closeDropdowns}
            >
                <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                    <header className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                            <button
                                type="button"
                                className="mt-1 rounded-xl border border-slate-700 bg-[#161C2D] p-2.5 text-slate-200 lg:hidden"
                                aria-label={t("openMenu")}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSidebarOpen(true);
                                }}
                            >
                                <Menu className="size-5" />
                            </button>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    {t("welcome")}, {firstName}!
                                </h1>

                                <p className="mt-1 text-sm text-slate-400 sm:text-base">
                                    {t("subtitle")}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <SearchInput className="hidden md:block" />

                            <LocaleSwitcher compact />

                            <div className="relative">
                                <button
                                    type="button"
                                    className="relative cursor-pointer rounded-xl border border-slate-700 bg-[#161C2D] p-2.5 text-slate-300 transition hover:border-[#6D4AFF] hover:text-white"
                                    aria-label={t("notifications")}
                                    aria-expanded={
                                        notificationsOpen
                                    }
                                    onClick={(event) => {
                                        event.stopPropagation();

                                        setNotificationsOpen(
                                            (current) =>
                                                !current,
                                        );

                                        setProfileOpen(false);
                                    }}
                                >
                                    <Bell className="size-5" />

                                    <span className="status-dot absolute right-2 top-2 size-2 rounded-full bg-[#15D0A5]" />
                                </button>

                                {notificationsOpen && (
                                    <NotificationsDropdown />
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-slate-700 bg-[#161C2D] p-1 pr-2 transition hover:border-[#6D4AFF]"
                                    aria-label={t("openProfile")}
                                    aria-expanded={profileOpen}
                                    onClick={(event) => {
                                        event.stopPropagation();

                                        setProfileOpen(
                                            (current) =>
                                                !current,
                                        );

                                        setNotificationsOpen(
                                            false,
                                        );
                                    }}
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-[#0B1020]">
                                        {initials}
                                    </span>

                                    <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
                                </button>

                                {profileOpen && (
                                    <ProfileDropdown
                                        user={user}
                                    />
                                )}
                            </div>
                        </div>
                    </header>

                    <SearchInput className="relative mt-5 md:hidden" />

                    {children}
                </div>
            </main>
        </div>
    );
}
