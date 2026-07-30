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
        <section className="grid min-h-svh lg:grid-cols-2">
            <div className="hidden lg:block">
                {hero}
            </div>

            <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </section>
    );
}