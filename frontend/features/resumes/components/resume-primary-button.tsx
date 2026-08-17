"use client";

import { LoaderCircle, Star } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    setPrimaryResumeAction,
    type SetPrimaryResumeState,
} from "@/features/resumes/actions/set-primary-resume-action";

const initialState: SetPrimaryResumeState = {
    success: false,
    message: undefined,
};

export function ResumePrimaryButton({ resumeId }: { resumeId: number }) {
    const router = useRouter();
    const [state, action, pending] = useActionState(setPrimaryResumeAction, initialState);

    useEffect(() => {
        if (!state.message) return;
        if (state.success) {
            toast.success(state.message);
            router.refresh();
        } else toast.error(state.message);
    }, [state, router]);

    return <form action={action}>
        <input type="hidden" name="resume_id" value={resumeId} />
        <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 rounded-xl border border-[#6D4AFF]/50 bg-[#6D4AFF]/10 px-3.5 py-2 text-xs font-semibold text-[#B9ABFF] transition hover:bg-[#6D4AFF]/20 disabled:opacity-60">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Star className="size-4" />}
            {pending ? "Alterando..." : "Definir como principal"}
        </button>
    </form>;
}
