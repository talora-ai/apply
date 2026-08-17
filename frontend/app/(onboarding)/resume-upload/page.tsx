import Image from "next/image";
import { redirect } from "next/navigation";
import { FileSearch, Sparkles, Target } from "lucide-react";

import { getAuthenticatedUser } from "@/features/auth/services/get-authenticated-user";
import { ResumeUploadForm } from "@/features/resumes/components/resume-upload-form";
import { getUserResumes } from "@/features/resumes/services/get-user-resumes";

export default async function ResumeUploadPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect("/login");

    const resumes = await getUserResumes();
    if (resumes && resumes.length > 0) redirect("/dashboard");

    return (
        <main className="platform-background min-h-svh px-5 py-8 text-slate-100 md:px-8">
            <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
                <section>
                    <Image src="/brand/talora-apply-horizontal-negative.svg" alt="Talora Apply" width={190} height={48} priority />
                    <span className="mt-10 inline-flex rounded-full border border-[#15D0A5]/30 bg-[#15D0A5]/10 px-3 py-1 text-xs font-semibold text-[#4BE3BF]">
                        Primeiro passo
                    </span>
                    <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
                        Olá, {user.name}. Vamos conhecer o seu perfil profissional.
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 md:text-lg">
                        Para liberar a busca inteligente, compatibilidade por habilidades e candidaturas, envie seu primeiro currículo.
                    </p>
                    <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
                        {[
                            [FileSearch, "Leitura", "Extração estruturada do currículo"],
                            [Sparkles, "Análise", "BOT identifica habilidades e contexto"],
                            [Target, "Match", "Oportunidades mais compatíveis"],
                        ].map(([Icon, title, text]) => (
                            <div key={String(title)} className="rounded-2xl border border-slate-800 bg-[#161C2D]/70 p-4">
                                <Icon className="size-5 text-[#8B6CFF]" />
                                <strong className="mt-3 block text-sm">{String(title)}</strong>
                                <span className="mt-1 block text-xs leading-5 text-slate-400">{String(text)}</span>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="rounded-3xl border border-slate-700/80 bg-[#161C2D]/95 p-6 shadow-2xl md:p-8">
                    <h2 className="text-xl font-bold">Envie seu primeiro currículo</h2>
                    <p className="mt-2 mb-6 text-sm leading-6 text-slate-400">O arquivo será processado automaticamente pelo BOT. Depois da análise, você poderá escolhê-lo como currículo principal.</p>
                    <ResumeUploadForm redirectOnSuccess="/dashboard" />
                </section>
            </div>
        </main>
    );
}
