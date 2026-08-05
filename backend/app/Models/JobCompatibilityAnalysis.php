<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\JobCompatibilityAnalysisFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class JobCompatibilityAnalysis extends Model
{
    /** @use HasFactory<JobCompatibilityAnalysisFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'user_resume_id', 'job_posting_id', 'resume_analysis_id',
        'status', 'overall_score', 'skills_score', 'experience_score',
        'education_score', 'location_score', 'recommendation', 'summary',
        'matching_skills', 'missing_skills', 'strengths', 'risks', 'suggestions',
        'provider', 'model', 'prompt_version', 'input_tokens', 'output_tokens',
        'estimated_cost', 'failure_reason', 'raw_response', 'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'overall_score'    => 'decimal:2', 'skills_score' => 'decimal:2',
            'experience_score' => 'decimal:2', 'education_score' => 'decimal:2',
            'location_score'   => 'decimal:2', 'estimated_cost' => 'decimal:6',
            'matching_skills'  => 'array', 'missing_skills' => 'array',
            'strengths'        => 'array', 'risks' => 'array', 'suggestions' => 'array',
            'raw_response'     => 'array', 'started_at' => 'datetime', 'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resume(): BelongsTo
    {
        return $this->belongsTo(UserResume::class, 'user_resume_id');
    }

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function resumeAnalysis(): BelongsTo
    {
        return $this->belongsTo(ResumeAnalysis::class);
    }
}
