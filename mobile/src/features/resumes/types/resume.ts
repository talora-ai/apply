export type ResumeAnalysisOrigin = {
    type: "bot" | "talora_ai";
    label: string;
    provider: string | null;
    model: string | null;
};

export type ResumeSections = {
    summary?: string[];
    skills?: string[];
    experiences?: Array<{ position: string; company: string; period: string; is_current: boolean; description?: string[] }>;
    education?: string[];
    languages?: Array<{ name: string; proficiency?: string | null }>;
    projects?: Array<{ name: string; description?: string[] }>;
    certifications?: string[];
};

export type UserResume = {
    id: number;
    name: string;
    original_filename: string;
    mime_type: string;
    size: number;
    status: string;
    is_primary: boolean;
    ats_friendly: boolean | null;
    processed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type UserResumeDetail = UserResume & {
    analysis_origin: ResumeAnalysisOrigin;
    ats: { ats_friendly?: boolean; score?: number | null; confidence?: number; layout_type?: string; extraction_quality?: string; reason_codes?: string[] } | null;
    content?: { full_text: string; sections: ResumeSections };
    ai_analysis: {
        status: string; professional_title: string | null; seniority_level: string | null;
        overall_score: number | null; ats_score: number | null; completeness_score: number | null;
        professional_summary: string | null; strengths: unknown[]; weaknesses: unknown[]; skills: unknown[]; suggestions: unknown[]; completed_at: string | null;
    } | null;
    processing_error?: string;
};

export type UserResumesResponse = { message: string; data?: { resumes?: UserResume[] } };
export type UserResumeDetailResponse = { message: string; data?: { resume?: UserResumeDetail } };
