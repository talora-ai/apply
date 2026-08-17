import { ChevronRight, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { EmptyState, FeaturePage } from "@/features/platform/components/feature-page";
import { ResumePrimaryButton } from "@/features/resumes/components/resume-primary-button";
import { ResumeUploadForm } from "@/features/resumes/components/resume-upload-form";
import { getUserResumes } from "@/features/resumes/services/get-user-resumes";

function formatBytes(bytes: number) { return `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
const statusLabel: Record<string, string> = { pending: "Na fila", processing: "Processando", completed: "Analisado", failed: "Falhou" };

export default async function ResumesPage() {
    const resumes = (await getUserResumes()) ?? [];
    const hasCompleted = resumes.some((resume) => resume.status === "completed");
    const hasPrimary = resumes.some((resume) => resume.is_primary);

    return <FeaturePage eyebrow="Perfil profissional" title="Meus currículos" description="Escolha entre os CVs já processados qual deve ser usado como principal nas comparações com vagas." icon={FileText}>
        {!hasPrimary && hasCompleted ? <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">Você possui currículo processado, mas ainda não escolheu um principal. Selecione um abaixo para habilitar a compatibilidade dinâmica com as vagas.</div> : null}
        <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
            <div className="space-y-3">
                {resumes.length === 0 ? <EmptyState title="Nenhum currículo enviado" text="Envie seu primeiro CV para que o BOT possa extrair e estruturar seus dados profissionais." /> : resumes.map((resume) => <article key={resume.id} className="group rounded-2xl border border-slate-800 bg-[#161C2D]/70 p-5 transition hover:border-slate-700">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2"><strong className="truncate text-white">{resume.name}</strong>{resume.is_primary ? <span className="rounded-full bg-[#15D0A5]/10 px-2 py-1 text-[11px] font-semibold text-[#4BE3BF]">Principal</span> : null}{resume.ats_friendly === true ? <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-300"><ShieldCheck className="size-3" />ATS friendly</span> : null}</div>
                            <p className="mt-1 truncate text-xs text-slate-400">{resume.original_filename} · {formatBytes(resume.size)}</p>
                            <p className="mt-2 text-xs text-slate-500">Enviado em {formatDate(resume.created_at)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">{statusLabel[resume.status] ?? resume.status}</span>
                            {resume.status === "completed" && !resume.is_primary ? <ResumePrimaryButton resumeId={resume.id} /> : null}
                            <Link href={`/resumes/${resume.id}`} className="inline-flex items-center gap-1 rounded-xl bg-[#6D4AFF] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#7B5BFF]">Ver detalhes <ChevronRight className="size-4" /></Link>
                        </div>
                    </div>
                </article>)}
            </div>
            <div className="h-fit rounded-3xl border border-slate-800 bg-[#161C2D]/70 p-6"><h2 className="font-semibold">Enviar novo currículo</h2><p className="mb-5 mt-1 text-sm text-slate-400">O arquivo entrará na fila de processamento. Quando estiver analisado, você poderá escolhê-lo como principal na listagem ao lado.</p><ResumeUploadForm compact /></div>
        </div>
    </FeaturePage>;
}
