import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    Braces,
    BriefcaseBusiness,
    ChevronRight,
    Code2,
    Container,
    Database,
    FileCheck2,
    Sparkles,
    Target,
    Workflow,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { TaloraAiCard } from "@/features/platform/components/talora-ai-card";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata.dashboard");

    return {
        title: t("title"),
        description: t("description"),
    };
}

type Statistic = {
    title: string;
    value: string;
    icon: LucideIcon;
    iconClassName: string;
    stroke: string;
    path: string;
};

type Opportunity = {
    title: string;
    company: string;
    initials: string;
    workModel: string;
    contract: string;
    compatibility: number;
    logoClassName: string;
};

type Skill = {
    name: string;
    compatibility: number;
    icon: LucideIcon;
    iconClassName: string;
};

const statisticsData: Statistic[] = [
    {
        title: "jobsFound",
        value: "245",
        icon: BriefcaseBusiness,
        iconClassName:
            "bg-[#6D4AFF]/15 text-[#8B6CFF]",
        stroke: "#6D4AFF",
        path: "M2 38 C25 38 27 29 45 30 S64 39 82 28 S110 26 126 20 S150 27 169 16 S194 20 218 8",
    },
    {
        title: "averageCompatibility",
        value: "84%",
        icon: Target,
        iconClassName:
            "bg-[#15D0A5]/15 text-[#15D0A5]",
        stroke: "#15D0A5",
        path: "M2 34 C24 34 31 31 45 24 S65 37 82 28 S105 19 121 24 S145 13 161 18 S190 16 218 7",
    },
    {
        title: "applications",
        value: "12",
        icon: FileCheck2,
        iconClassName:
            "bg-[#6D4AFF]/15 text-[#8B6CFF]",
        stroke: "#6D4AFF",
        path: "M2 35 C20 29 34 24 49 31 S76 36 91 27 S117 19 134 27 S158 25 174 17 S197 19 218 8",
    },
];

const opportunitiesData: Opportunity[] = [
    {
        title: "Desenvolvedor Backend Pleno",
        company: "Nubank",
        initials: "nu",
        workModel: "remote",
        contract: "CLT",
        compatibility: 96,
        logoClassName:
            "bg-gradient-to-br from-fuchsia-600 to-purple-800 text-white",
    },
    {
        title: "Software Engineer Backend",
        company: "Mercado Livre",
        initials: "ML",
        workModel: "hybrid",
        contract: "CLT",
        compatibility: 91,
        logoClassName:
            "bg-amber-300 text-slate-900",
    },
    {
        title: "Desenvolvedor PHP",
        company: "iFood",
        initials: "iFood",
        workModel: "remote",
        contract: "CLT",
        compatibility: 88,
        logoClassName:
            "bg-red-500 text-sm italic text-white",
    },
];

const skills: Skill[] = [
    {
        name: "Laravel",
        compatibility: 98,
        icon: Code2,
        iconClassName:
            "bg-red-500/15 text-red-400",
    },
    {
        name: "PHP",
        compatibility: 92,
        icon: Braces,
        iconClassName:
            "bg-indigo-500/15 text-indigo-300",
    },
    {
        name: "Docker",
        compatibility: 85,
        icon: Container,
        iconClassName:
            "bg-sky-500/15 text-sky-400",
    },
    {
        name: "Redis",
        compatibility: 80,
        icon: Database,
        iconClassName:
            "bg-red-500/15 text-red-400",
    },
    {
        name: "RabbitMQ",
        compatibility: 75,
        icon: Workflow,
        iconClassName:
            "bg-orange-500/15 text-orange-400",
    },
];

export default async function DashboardPage() {
    const t = await getTranslations("Dashboard");

    const statistics = statisticsData.map((statistic) => ({
        ...statistic,
        title: t(`statistics.${statistic.title}`),
        value: statistic.value,
    }));

    const opportunities = opportunitiesData.map((opportunity) => ({
        ...opportunity,
        workModel: t(`opportunities.${opportunity.workModel}`),
    }));

    return (
        <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            
            <div className="col-span-1 sm:col-span-2 xl:col-span-5 w-full flex gap-5">
                {statistics.map((statistic, index) => (
                    <StatisticCard
                        key={statistic.title}
                        statistic={statistic}
                        delay={(index + 1) * 70}
                    />
                ))}
            </div>

            <OpportunitiesCard opportunities={opportunities} />

            <SkillsCard />

            <TaloraAiCard />
        </section>
    );
}

type StatisticCardProps = {
    statistic: Statistic;
    delay: number;
};

function StatisticCard({
    statistic,
    delay,
}: StatisticCardProps) {
    const Icon = statistic.icon;

    return (
        <article
            className="dashboard-card panel flex-1 w-full rounded-2xl border border-slate-700/70 p-5"
            style={{
                animationDelay: `${delay}ms`,
            }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400">
                        {statistic.title}
                    </p>

                    <strong className="mt-2 block text-3xl text-[#15D0A5]">
                        {statistic.value}
                    </strong>
                </div>

                <span
                    className={`rounded-full p-3 ${statistic.iconClassName}`}
                >
                    <Icon className="size-5" />
                </span>
            </div>

            <svg
                viewBox="0 0 220 45"
                className="mt-7 h-10 w-full"
                aria-hidden="true"
            >
                <path
                    d={statistic.path}
                    fill="none"
                    stroke={statistic.stroke}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
        </article>
    );
}

type OpportunitiesCardProps = {
    opportunities: Opportunity[];
};

async function OpportunitiesCard({
    opportunities,
}: OpportunitiesCardProps) {
    const t = await getTranslations("Dashboard.opportunities");

    return (
        <article
            className="dashboard-card panel flex min-h-130 flex-col overflow-hidden rounded-2xl border border-slate-700/70 sm:col-span-2 xl:col-span-2 xl:col-start-1 xl:row-start-2"
            style={{
                animationDelay: "350ms",
            }}
        >
            <div className="border-b border-slate-700/60 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold sm:text-xl">
                    {t("title")}
                </h2>
            </div>

            <div className="divide-y divide-slate-700/60 px-5 sm:px-6">
                {opportunities.map((opportunity) => (
                    <OpportunityItem
                        key={`${opportunity.company}-${opportunity.title}`}
                        opportunity={opportunity}
                    />
                ))}
            </div>

            <Link
                href="/jobs/search"
                className="mt-auto flex items-center justify-center gap-2 border-t border-slate-700/60 px-5 py-5 text-sm font-medium text-[#15D0A5] transition hover:bg-[#15D0A5]/5"
            >
                {t("viewAll")}
                <ArrowRight className="size-4" />
            </Link>
        </article>
    );
}

type OpportunityItemProps = {
    opportunity: Opportunity;
};

async function OpportunityItem({
    opportunity,
}: OpportunityItemProps) {
    const t = await getTranslations("Dashboard.opportunities");

    return (
        <Link
            href="#"
            className="group flex items-center gap-4 py-5"
        >
            <span
                className={[
                    "flex size-14 shrink-0 items-center justify-center rounded-xl",
                    "text-lg font-bold",
                    opportunity.logoClassName,
                ].join(" ")}
            >
                {opportunity.initials}
            </span>

            <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                    {opportunity.title}
                </span>

                <span className="mt-1 block text-sm text-slate-400">
                    {opportunity.company}
                </span>

                <span className="mt-2 flex flex-wrap gap-2">
                    <OpportunityBadge>
                        {opportunity.workModel}
                    </OpportunityBadge>

                    <OpportunityBadge>
                        {opportunity.contract}
                    </OpportunityBadge>
                </span>
            </span>

            <span className="hidden text-right sm:block">
                <strong className="text-xl text-[#15D0A5]">
                    {opportunity.compatibility}%
                </strong>

                <span className="block text-xs text-slate-500">
                    {t("compatibility")}
                </span>
            </span>

            <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-1" />
        </Link>
    );
}

type OpportunityBadgeProps = Readonly<{
    children: React.ReactNode;
}>;

function OpportunityBadge({
    children,
}: OpportunityBadgeProps) {
    return (
        <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
            {children}
        </span>
    );
}

async function SkillsCard() {
    const t = await getTranslations("Dashboard.skills");

    return (
        <article
            className="dashboard-card panel flex min-h-130 flex-col rounded-2xl border border-slate-700/70 sm:col-span-2 xl:col-span-2 xl:col-start-3 xl:row-start-2"
            style={{
                animationDelay: "420ms",
            }}
        >
            <div className="border-b border-slate-700/60 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold sm:text-xl">
                    {t("title")}
                </h2>
            </div>

            <div className="flex flex-1 flex-col justify-evenly gap-4 px-5 py-4 sm:px-6">
                {skills.map((skill) => (
                    <SkillItem
                        key={skill.name}
                        skill={skill}
                    />
                ))}
            </div>

            <Link
                href="/skills"
                className="flex items-center justify-center gap-2 border-t border-slate-700/60 px-5 py-5 text-sm font-medium text-[#15D0A5] transition hover:bg-[#15D0A5]/5"
            >
                {t("viewAll")}
                <ArrowRight className="size-4" />
            </Link>
        </article>
    );
}

type SkillItemProps = {
    skill: Skill;
};

function SkillItem({
    skill,
}: SkillItemProps) {
    const Icon = skill.icon;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-3 font-medium">
                    <span
                        className={`rounded-full p-2 ${skill.iconClassName}`}
                    >
                        <Icon className="size-4" />
                    </span>

                    {skill.name}
                </span>

                <strong className="text-[#15D0A5]">
                    {skill.compatibility}%
                </strong>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                    className="h-full rounded-full bg-[#15D0A5]"
                    style={{
                        width: `${skill.compatibility}%`,
                    }}
                />
            </div>
        </div>
    );
}
