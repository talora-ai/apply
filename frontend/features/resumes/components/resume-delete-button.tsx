"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteResumeAction } from "@/features/resumes/actions/delete-resume-action";

export function ResumeDeleteButton({ id, name }: { id: number; name: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteResumeAction(id);

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            toast.success(result.message ?? 'Currículo excluído com sucesso.');
            setOpen(false);
        });
    }

    return <>
        <button type="button" disabled={pending} onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"><Trash2 className="size-4" />Excluir currículo</button>
        {open ? <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-resume-title">
            <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-[#161C2D] p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4"><div className="grid size-12 place-items-center rounded-2xl bg-red-500/10 text-red-300"><AlertTriangle className="size-6"/></div><button type="button" onClick={() => setOpen(false)} disabled={pending} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X className="size-5"/></button></div>
                <h2 id="delete-resume-title" className="mt-5 text-xl font-bold text-white">Excluir currículo?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Você está prestes a excluir <strong className="text-slate-200">“{name}”</strong>. O arquivo armazenado e este registro serão removidos. Essa ação não pode ser desfeita.</p>
                <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setOpen(false)} disabled={pending} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50">Cancelar</button><button type="button" onClick={handleDelete} disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"><Trash2 className="size-4"/>{pending ? "Excluindo..." : "Sim, excluir"}</button></div>
            </div>
        </div> : null}
    </>;
}
