import { apiRequest } from "@/lib/api";
import type { AnalyticsData, ApplicationData, BillingData, DashboardData, FavoriteData, JobsData } from "@/features/platform/types/data";

type ApiEnvelope<T>={data?:T};
export async function getDashboard(token:string){const r=await apiRequest<ApiEnvelope<DashboardData>>("/client/dashboard",{token});return r.data??null}
export async function getJobs(token:string,q=""){const suffix=q?`?q=${encodeURIComponent(q)}`:"";const r=await apiRequest<ApiEnvelope<JobsData>>(`/client/jobs${suffix}`,{token});return r.data??{jobs:[],query:q,primary_resume:null}}
export async function getApplications(token:string){const r=await apiRequest<ApiEnvelope<{applications:ApplicationData[]}>>("/client/applications",{token});return r.data?.applications??[]}
export async function getFavorites(token:string){const r=await apiRequest<ApiEnvelope<{favorites:FavoriteData[]}>>("/client/favorites",{token});return r.data?.favorites??[]}
export async function getAnalytics(token:string){const r=await apiRequest<ApiEnvelope<AnalyticsData>>("/client/analytics",{token});return r.data??null}
export async function getBilling(token:string){const r=await apiRequest<ApiEnvelope<BillingData>>("/client/billing",{token});return r.data??null}
export async function favoriteJob(token:string,jobId:number){await apiRequest(`/client/jobs/${jobId}/favorite`,{method:"POST",token})}
export async function unfavoriteJob(token:string,jobId:number){await apiRequest(`/client/jobs/${jobId}/favorite`,{method:"DELETE",token})}
