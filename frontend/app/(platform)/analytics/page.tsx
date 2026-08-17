import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { EmptyState, FeaturePage } from "@/features/platform/components/feature-page";
import { getPlatformData } from "@/features/platform/services/get-platform-data";
import type { AnalyticsData } from "@/features/platform/types/data";

export default async function AnalyticsPage(){
 const d=await getPlatformData<AnalyticsData>("/client/analytics");const statuses=d?.applications_by_status??{};
 return <FeaturePage eyebrow="Evolução" title="Análises" description="As compatibilidades são recalculadas em tempo real usando o currículo principal atual." icon={ChartNoAxesColumnIncreasing}>
  {d?.primary_resume?<div className="rounded-2xl border border-[#6D4AFF]/30 bg-[#6D4AFF]/10 p-4 text-sm text-slate-300">Comparando as vagas com <strong className="text-white">{d.primary_resume.name}</strong>. Ao trocar o CV principal, estas métricas mudam automaticamente.</div>:<div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">Selecione um currículo processado como principal para calcular compatibilidade.</div>}
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card l="Compatibilidade média" v={d?.average_compatibility==null?"—":`${Number(d.average_compatibility).toFixed(1)}%`}/><Card l="Candidaturas" v={String(d?.applications_total??0)}/><Card l="Status registrados" v={String(Object.keys(statuses).length)}/><Card l="ATS" v={d?.resume_analysis?.ats_score==null?"—":`${d.resume_analysis.ats_score}%`}/></div>
  {d?.compatibilities?.length?<div className="space-y-3">{d.compatibilities.map(c=><article key={c.id} className="rounded-2xl border border-slate-800 bg-[#161C2D]/70 p-5"><div className="flex justify-between gap-4"><div><strong>{c.job?.title ?? "Vaga indisponível"}</strong><p className="mt-1 text-sm text-slate-400">{c.job?.company ?? "Empresa não informada"}</p></div><span className="font-bold text-[#15D0A5]">{c.overall_score==null?"—":`${c.overall_score}%`}</span></div>{c.matching_skills?.length?<p className="mt-3 text-xs text-slate-500">Correspondências: {c.matching_skills.join(" · ")}</p>:null}</article>)}</div>:<EmptyState title="Nenhuma compatibilidade disponível" text={d?.primary_resume?"Ainda não existem vagas ativas com dados suficientes para comparação.":"Defina um currículo principal para iniciar as comparações."}/>} 
 </FeaturePage>
}
function Card({l,v}:{l:string;v:string}){return <div className="rounded-2xl border border-slate-800 bg-[#161C2D]/70 p-5"><span className="text-xs uppercase tracking-wider text-slate-500">{l}</span><strong className="mt-2 block text-2xl">{v}</strong></div>}
