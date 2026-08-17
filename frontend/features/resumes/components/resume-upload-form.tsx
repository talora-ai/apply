"use client";

import { FileUp, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    uploadResumeAction,
    type UploadResumeState,
} from "@/features/resumes/actions/upload-resume-action";

const initialState: UploadResumeState = {
    success: false,
    message: undefined,
};

type Props = {
    compact?: boolean;
    redirectOnSuccess?: string;
};

export function ResumeUploadForm({
    compact = false,
    redirectOnSuccess,
}: Props) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const [state, action, pending] = useActionState(
        uploadResumeAction,
        initialState
    );

    useEffect(() => {
        if (!state.message) {
            return;
        }

        if (state.success) {
            toast.success(state.message);

            formRef.current?.reset();
            setFileName(null);

            if (redirectOnSuccess) {
                router.replace(redirectOnSuccess);
            } else {
                router.refresh();
            }

            return;
        }

        toast.error(state.message);
    }, [state, redirectOnSuccess, router]);

    return (
        <form
            ref={formRef}
            action={action}
            className="space-y-5"
        >
            <div>
                <label
                    htmlFor="resume-name"
                    className="mb-2 block text-sm font-medium text-slate-200"
                >
                    Nome do currículo
                </label>

                <input
                    id="resume-name"
                    name="name"
                    type="text"
                    placeholder="Ex.: Currículo Backend"
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1020]/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#6D4AFF]"
                />
            </div>

            <label className="group block cursor-pointer rounded-2xl border border-dashed border-slate-600 bg-[#0B1020]/60 p-6 text-center transition hover:border-[#6D4AFF] hover:bg-[#6D4AFF]/5">
                <FileUp className="mx-auto mb-3 size-9 text-[#8B6CFF]" />

                <span className="block font-semibold text-white">
                    {fileName ?? "Selecionar currículo"}
                </span>

                <span className="mt-1 block text-sm text-slate-400">
                    PDF ou DOCX, até 10 MB
                </span>

                <input
                    name="file"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    required
                    className="sr-only"
                    onChange={(event) =>
                        setFileName(
                            event.target.files?.[0]?.name ?? null
                        )
                    }
                />
            </label>

            {!compact ? (
                <div className="flex items-start gap-2 text-xs text-slate-400">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#15D0A5]" />

                    Seu arquivo é armazenado de forma privada e seguirá
                    para o processamento seguro do Talora Apply. Depois
                    de analisado, você poderá escolhê-lo como currículo
                    principal.
                </div>
            ) : null}

            <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#6D4AFF] to-[#4822C7] px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? (
                    <LoaderCircle className="size-5 animate-spin" />
                ) : (
                    <FileUp className="size-5" />
                )}

                {pending
                    ? "Enviando currículo..."
                    : "Enviar currículo"}
            </button>
        </form>
    );
}