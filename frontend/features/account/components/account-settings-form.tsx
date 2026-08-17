"use client";

import { LockKeyhole, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updatePasswordAction } from "@/features/account/actions/update-password-action";
import { updateProfileAction, type AccountActionState } from "@/features/account/actions/update-profile-action";
import type { AuthenticatedUser } from "@/features/auth/types/user";

const initialState: AccountActionState = {};

export function AccountSettingsForm({ user }: { user: AuthenticatedUser }) {
    const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, initialState);
    const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, initialState);
    const passwordForm = useRef<HTMLFormElement>(null);

    useEffect(() => { if (profileState.message) (profileState.success ? toast.success : toast.error)(profileState.message); }, [profileState]);
    useEffect(() => { if (passwordState.message) { (passwordState.success ? toast.success : toast.error)(passwordState.message); if (passwordState.success) passwordForm.current?.reset(); } }, [passwordState]);

    return <div className="grid gap-6 xl:grid-cols-2">
        <form action={profileAction} className="rounded-3xl border border-slate-800 bg-[#161C2D]/70 p-6">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-[#6D4AFF]/15 p-2.5 text-[#9B84FF]"><UserRound className="size-5"/></span><div><h2 className="font-semibold">Dados da conta</h2><p className="text-sm text-slate-400">Atualize suas informações pessoais.</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field name="name" label="Nome" defaultValue={user.name}/><Field name="last_name" label="Sobrenome" defaultValue={user.last_name}/></div>
            <label className="mt-4 block"><span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400"><Mail className="size-3.5"/>E-mail</span><input value={user.email} disabled readOnly className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-[#0B1020]/70 px-4 py-3 text-sm text-slate-500 outline-none"/><span className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="size-3.5 text-[#15D0A5]"/>O e-mail da conta não pode ser alterado por esta tela.</span></label>
            <button disabled={profilePending} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6D4AFF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7B5BFF] disabled:opacity-50"><Save className="size-4"/>{profilePending ? "Salvando..." : "Salvar alterações"}</button>
        </form>
        <form ref={passwordForm} action={passwordAction} className="rounded-3xl border border-slate-800 bg-[#161C2D]/70 p-6">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-[#15D0A5]/10 p-2.5 text-[#4BE3BF]"><LockKeyhole className="size-5"/></span><div><h2 className="font-semibold">Alterar senha</h2><p className="text-sm text-slate-400">Confirme sua senha atual antes de definir uma nova.</p></div></div>
            <div className="mt-6 space-y-4"><Field type="password" name="current_password" label="Senha atual" autoComplete="current-password"/><Field type="password" name="password" label="Nova senha" autoComplete="new-password"/><Field type="password" name="password_confirmation" label="Confirmar nova senha" autoComplete="new-password"/></div>
            <p className="mt-3 text-xs leading-5 text-slate-500">A nova senha deve ter pelo menos 8 caracteres e combinar letras e números. Outras sessões ativas serão encerradas.</p>
            <button disabled={passwordPending} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#15D0A5] px-4 py-3 text-sm font-semibold text-[#0B1020] transition hover:bg-emerald-300 disabled:opacity-50"><LockKeyhole className="size-4"/>{passwordPending ? "Alterando..." : "Alterar senha"}</button>
        </form>
    </div>;
}

function Field({ name, label, type = "text", defaultValue, autoComplete }: { name: string; label: string; type?: string; defaultValue?: string; autoComplete?: string }) { return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span><input required name={name} type={type} defaultValue={defaultValue} autoComplete={autoComplete} className="w-full rounded-xl border border-slate-700 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#6D4AFF]"/></label>; }
