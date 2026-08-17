import type { LucideIcon } from "lucide-react";

export function FeaturePage({
    eyebrow,
    title,
    description,
    icon: Icon,
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    icon: LucideIcon;
    children?: React.ReactNode;
}) {
    return (
        <section className="space-y-6">
            <header className="rounded-3xl border border-slate-800 bg-[#161C2D]/75 p-6 md:p-8">
                <div className="flex items-start gap-4">
                    <span className="rounded-2xl bg-[#6D4AFF]/15 p-3 text-[#9B84FF]"><Icon className="size-6" /></span>
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#15D0A5]">{eyebrow}</span>
                        <h1 className="mt-2 text-2xl font-bold md:text-3xl">{title}</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">{description}</p>
                    </div>
                </div>
            </header>
            {children}
        </section>
    );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-[#0F1526]/60 p-8 text-center">
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">{text}</p>
        </div>
    );
}
