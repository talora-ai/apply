"use client";

import {
    ArrowRight,
    Sparkles,
} from "lucide-react";
import type { PointerEvent } from "react";
import { useRef } from "react";

export function TaloraAiCard() {
    const cardRef = useRef<HTMLElement>(null);

    function handlePointerMove(
        event: PointerEvent<HTMLElement>,
    ) {
        const card = cardRef.current;

        if (!card) {
            return;
        }

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches
        ) {
            return;
        }

        const rectangle =
            card.getBoundingClientRect();

        const x =
            ((event.clientX - rectangle.left) /
                rectangle.width -
                0.5) *
            7;

        const y =
            ((event.clientY - rectangle.top) /
                rectangle.height -
                0.35) *
            6;

        const eyes =
            card.querySelectorAll<HTMLElement>(
                ".ai-eye",
            );

        eyes.forEach((eye) => {
            eye.style.setProperty(
                "--eye-x",
                `${Math.max(-4, Math.min(4, x))}px`,
            );

            eye.style.setProperty(
                "--eye-y",
                `${Math.max(-3, Math.min(3, y))}px`,
            );
        });
    }

    function resetEyes() {
        const card = cardRef.current;

        if (!card) {
            return;
        }

        const eyes =
            card.querySelectorAll<HTMLElement>(
                ".ai-eye",
            );

        eyes.forEach((eye) => {
            eye.style.setProperty(
                "--eye-x",
                "0px",
            );

            eye.style.setProperty(
                "--eye-y",
                "0px",
            );
        });
    }

    return (
        <article
            ref={cardRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetEyes}
            className="dashboard-card ai-card panel relative flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-[#6D4AFF] shadow-[0_0_32px_rgba(109,74,255,0.18)] sm:col-span-2 xl:col-span-1 xl:col-start-5 xl:row-start-2"
            style={{
                animationDelay: "490ms",
            }}
        >
            <div
                className="ai-aurora"
                aria-hidden="true"
            />

            <div
                className="ai-grid"
                aria-hidden="true"
            />

            <Sparkles
                className="spark absolute right-6 top-24 size-5 text-[#8B6CFF]"
                style={{
                    animationDelay: "400ms",
                }}
                aria-hidden="true"
            />

            <Sparkles
                className="spark absolute left-6 top-52 size-4 text-[#15D0A5]"
                style={{
                    animationDelay: "1.2s",
                }}
                aria-hidden="true"
            />

            <div className="relative flex items-center gap-3 px-5 pt-6">
                <span className="brand-gradient flex size-10 items-center justify-center rounded-xl">
                    <Sparkles className="size-5" />
                </span>

                <h2 className="text-xl font-semibold">
                    Talora AI
                </h2>
            </div>

            <div className="relative mt-7 flex justify-center">
                <div className="ai-core flex size-24 items-center justify-center rounded-full border-[10px] border-slate-100 bg-[#0B1020] shadow-[0_0_32px_rgba(109,74,255,0.18)]">
                    <span className="flex gap-3">
                        <span className="ai-eye size-3 rounded-full bg-[#15D0A5] shadow-[0_0_12px_rgba(21,208,165,0.9)]" />

                        <span className="ai-eye size-3 rounded-full bg-[#15D0A5] shadow-[0_0_12px_rgba(21,208,165,0.9)]" />
                    </span>
                </div>
            </div>

            <div className="relative mt-7 px-5 text-center">
                <h3 className="text-lg font-semibold">
                    Analisei seu currículo
                </h3>

                <div className="my-5 h-px bg-slate-700/70" />

                <p className="text-sm text-slate-400">
                    Perfil identificado
                </p>

                <p className="mt-2 font-semibold text-[#15D0A5]">
                    Backend Developer Pleno
                </p>

                <p className="mt-6 text-sm text-slate-400">
                    Principais competências
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <SkillBadge className="border-red-500/70">
                        Laravel
                    </SkillBadge>

                    <SkillBadge className="border-[#6D4AFF]/70">
                        PHP
                    </SkillBadge>

                    <SkillBadge className="border-sky-500/70">
                        Docker
                    </SkillBadge>

                    <SkillBadge className="border-red-500/70">
                        Redis
                    </SkillBadge>

                    <SkillBadge className="border-orange-500/70">
                        RabbitMQ
                    </SkillBadge>
                </div>
            </div>

            <div className="relative mt-auto px-5 pb-5 pt-6">
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15D0A5] px-4 py-3 text-sm font-semibold text-[#0B1020] transition hover:bg-emerald-300"
                >
                    Ver análise completa
                    <ArrowRight className="size-4" />
                </button>

                <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                    <span className="status-dot size-2 rounded-full bg-[#15D0A5]" />
                    Análise atualizada hoje
                </p>
            </div>
        </article>
    );
}

type SkillBadgeProps = Readonly<{
    children: React.ReactNode;
    className: string;
}>;

function SkillBadge({
    children,
    className,
}: SkillBadgeProps) {
    return (
        <span
            className={`rounded-lg border px-2.5 py-1.5 text-xs ${className}`}
        >
            {children}
        </span>
    );
}