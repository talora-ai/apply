import { BriefcaseBusiness, FileCheck2, Heart, Target } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/features/platform/components/feature-page";
import { getPlatformData } from "@/features/platform/services/get-platform-data";
import type { DashboardData, Job } from "@/features/platform/types/data";

export default async function DashboardPage(){
 const data=await getPlatformData<DashboardData>("/client/dashboard");
 const stats=data?.statistics;
 const cards=[
  {label:"Vagas disponíveis",value:String(stats?.jobs_found ?? 0),icon:BriefcaseBusiness},
  {label:"Compatibilidade média",value:stats?.average_compatibility==null?"—":`${stats.average_compatibility}%`,icon:Target},
  {label:"Candidaturas",value:String(stats?.applications ?? 0),icon:FileCheck2},
  {label:"Favoritas",value:String(stats?.favorites ?? 0),icon:Heart},
 ];
 return <section className="mt-7 space-y-5">
  {data?.primary_resume?<div className="rounded-2xl border border-[#6D4AFF]/30 bg-[#6D4AFF]/10 px-5 py-4 text-sm text-slate-300">Compatibilidade calculada agora com <strong className="text-white">{data.primary_resume.name}</strong>. Trocar o currículo principal recalcula as vagas na próxima consulta.</div>:<div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">Nenhum currículo principal selecionado. Escolha um CV processado em <Link className="font-bold underline" href="/resumes">Meus currículos</Link> para calcular compatibilidade.</div>}
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({label,value,icon:Icon})=><article key={label} className="panel rounded-2xl border border-slate-700/70 p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-400">{label}</p><strong className="mt-2 block text-3xl text-[#15D0A5]">{value}</strong></div><span className="rounded-full bg-[#6D4AFF]/15 p-3 text-[#9B84FF]"><Icon className="size-5"/></span></div></article>)}</div>
  <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
   <article className="panel overflow-hidden rounded-2xl border border-slate-700/70"><div className="border-b border-slate-700/60 px-6 py-5"><h2 className="text-xl font-semibold">Oportunidades recentes</h2><p className="mt-1 text-sm text-slate-400">A compatibilidade não é salva: ela é calculada com o CV principal sempre que estes dados vêm do backend.</p></div><div className="divide-y divide-slate-700/60">{data?.opportunities?.length?data.opportunities.map(job=><JobRow key={job.id} job={job}/>):<div className="p-5"><EmptyState title="Nenhuma vaga disponível" text="Ainda não existem vagas ativas cadastradas no banco."/></div>}</div><Link href="/jobs/search" className="block border-t border-slate-700/60 px-6 py-4 text-center text-sm font-semibold text-[#15D0A5]">Ver todas as vagas</Link></article>
   <article className="panel rounded-2xl border border-slate-700/70 p-6"><h2 className="text-xl font-semibold">Análise do currículo</h2>{data?.resume_analysis?<div className="mt-5 space-y-4"><Metric label="Título profissional" value={data.resume_analysis.professional_title ?? "Não identificado"}/><Metric label="Senioridade" value={data.resume_analysis.seniority_level ?? "Não identificada"}/>{data.resume_analysis.overall_score!=null?<Metric label="Score geral" value={`${data.resume_analysis.overall_score}%`}/>:null}{data.resume_analysis.ats_score!=null?<Metric label="ATS" value={`${data.resume_analysis.ats_score}%`}/>:null}{data.resume_analysis.completeness_score!=null?<Metric label="Completude" value={`${data.resume_analysis.completeness_score}%`}/>:null}</div>:<p className="mt-4 text-sm leading-6 text-slate-400">Nenhuma análise do currículo principal concluída ainda.</p>}</article>
  </div>
 </section>
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-slate-800 bg-[#0B1020]/50 p-4"><span className="text-xs uppercase tracking-wider text-slate-500">{label}</span><strong className="mt-1 block">{value}</strong></div>}
function JobRow({job}:{job:Job}){return <a href={job.application_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-6 py-5 transition hover:bg-white/[.02]"><span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#6D4AFF]/15 font-bold text-[#B9ABFF]">{(job.company?.name ?? "?").slice(0,2).toUpperCase()}</span><span className="min-w-0 flex-1"><strong className="block truncate">{job.title}</strong><span className="mt-1 block text-sm text-slate-400">{job.company?.name ?? "Empresa não informada"}{job.location?` · ${job.location}`:""}</span></span><span className="text-sm font-semibold text-[#15D0A5]">{job.compatibility_score==null?"—":`${job.compatibility_score}%`}</span></a>}
