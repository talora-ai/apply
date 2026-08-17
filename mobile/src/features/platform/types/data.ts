export type Company = { id:number; name:string; logo_url:string|null; website_url?:string|null };
export type PrimaryResumeRef = { id:number; name:string } | null;
export type Job = {
 id:number; title:string; description:string; location:string|null; workplace_type:string|null; employment_type:string|null; seniority_level:string|null;
 salary_min:number|null; salary_max:number|null; salary_currency:string|null; application_url:string; published_at:string|null; expires_at:string|null;
 compatibility_score:number|null; compatibility_model?:string|null; matching_skills?:string[]; company:Company|null; source?:{id:number;name:string}|null; is_favorite?:boolean;
};
export type ResumeAnalysis = { status:string; professional_title:string|null; seniority_level:string|null; overall_score:number|null; ats_score:number|null; completeness_score:number|null; skills:unknown[]; strengths:unknown[]; weaknesses:unknown[]; suggestions:unknown[] };
export type JobsData = { jobs:Job[]; query:string; primary_resume:PrimaryResumeRef };
export type DashboardData = { statistics:{jobs_found:number;average_compatibility:number|null;applications:number;favorites:number;resumes:number}; primary_resume:PrimaryResumeRef; opportunities:Job[]; resume_analysis:ResumeAnalysis|null };
export type ApplicationData = { id:number;status:string;compatibility_score:number|null;is_automatic:boolean;applied_at:string|null;last_status_at:string|null;failure_reason:string|null;job:Job|null;resume:{id:number;name:string;original_filename:string}|null };
export type FavoriteData = { id:number;created_at:string|null;job:Job };
export type AnalyticsData = { applications_total:number; applications_by_status:Record<string,number>; average_compatibility:number|null; primary_resume:PrimaryResumeRef; resume_analysis:ResumeAnalysis|null; compatibilities:Array<{id:number;status:"runtime"|string;overall_score:number|null;matching_skills:string[];model?:string|null;job:{id:number;title:string;company:string|null}|null}> };
export type BillingData = { subscriptions:Array<{id:number;status:string;provider:string|null;starts_at:string|null;trial_ends_at:string|null;current_period_ends_at:string|null;canceled_at:string|null;plan:{id:number;name:string;slug:string;price:number;currency:string;billing_interval:string;features:unknown[]}|null}>; transactions:Array<{id:number;provider:string;type:string;status:string;amount:number;currency:string;processed_at:string|null;failure_reason:string|null}>; plans:Array<{id:number;name:string;slug:string;description:string|null;price:number;currency:string;billing_interval:string;billing_interval_count:number;features:unknown[]}> };
