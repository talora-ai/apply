import type { ReactNode } from "react";

type AuthShellProps = {
    hero: ReactNode;
    children: ReactNode;
};

export function AuthShell({
    hero,
    children,
}: AuthShellProps) {
    return (
        <section className="grid h-svh overflow-hidden lg:grid-cols-2">
            <div className="hidden h-svh lg:block">
                {hero}
            </div>

            <div className="h-svh overflow-y-auto overscroll-contain [scrollbar-color:#334155_transparent] [scrollbar-width:thin]">
                <div className="flex min-h-full items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}