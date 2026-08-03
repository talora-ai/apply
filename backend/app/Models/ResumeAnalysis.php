<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ResumeAnalysisFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ResumeAnalysis extends Model
{
    /** @use HasFactory<ResumeAnalysisFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'user_resume_id', 'status', 'professional_title', 'seniority_level',
        'overall_score', 'ats_score', 'completeness_score', 'professional_summary',
        'strengths', 'weaknesses', 'skills', 'suggestions', 'provider', 'model',
        'prompt_version', 'input_tokens', 'output_tokens', 'estimated_cost',
        'failure_reason', 'raw_response', 'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'overall_score' => 'decimal:2', 'ats_score' => 'decimal:2',
            'completeness_score' => 'decimal:2', 'estimated_cost' => 'decimal:6',
            'strengths' => 'array', 'weaknesses' => 'array', 'skills' => 'array',
            'suggestions' => 'array', 'raw_response' => 'array',
            'started_at' => 'datetime', 'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function resume(): BelongsTo { return $this->belongsTo(UserResume::class, 'user_resume_id'); }
    public function compatibilityAnalyses(): HasMany { return $this->hasMany(JobCompatibilityAnalysis::class); }
}
