import Image from "next/image";
import { useTranslations } from "next-intl";

export function AuthHero() {

    const t = useTranslations("Login.Hero");

    return (
        <aside className="relative flex min-h-svh flex-col overflow-hidden border-r border-white/10 bg-[#161C2D] p-12">
            <div className="absolute -left-32 top-20 size-80 rounded-full bg-[#6D4AFF]/20 blur-3xl" />

            <div className="absolute -bottom-32 right-0 size-96 rounded-full bg-[#15D0A5]/10 blur-3xl" />

            <div className="relative z-10 flex items-center gap-3">
                <Image
                    src="/brand/talora-apply-horizontal-negative.svg"
                    alt="Símbolo da Talora"
                    width={350}
                    height={350}
                    priority
                    className="drop-shadow-[0_0_20px_rgba(109,74,255,0.55)]"
                />
            </div>

            <div className="relative z-10 my-auto max-w-xl">
                <span className="mb-6 inline-flex rounded-full border border-[#15D0A5]/20 bg-[#15D0A5]/10 px-4 py-2 text-sm font-medium text-[#15D0A5]">
                    {t('title')}
                </span>

                <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                    Sua próxima oportunidade começa com uma decisão.
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                    Analise seu currículo, encontre vagas compatíveis e acompanhe
                    sua evolução profissional em um único lugar.
                </p>
            </div>

            <p className="relative z-10 text-sm text-slate-500">
                Talora Apply
            </p>
        </aside>
    );
}