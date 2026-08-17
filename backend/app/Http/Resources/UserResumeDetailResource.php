<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\UserResumeStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class UserResumeDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $metadata = is_array($this->metadata) ? $this->metadata : [];
        $analysis = $this->relationLoaded('latestAnalysis') ? $this->latestAnalysis : null;
        $aiAvailable = $analysis !== null && $analysis->status === 'completed';

        return [
            ...(new UserResumeResource($this->resource))->resolve($request),
            'analysis_origin' => $aiAvailable
                ? [
                    'type' => 'talora_ai',
                    'label' => 'TALORA AI',
                    'provider' => $analysis->provider,
                    'model' => $analysis->model,
                ]
                : [
                    'type' => 'bot',
                    'label' => 'BOT Talora',
                    'provider' => null,
                    'model' => null,
                ],
            'ats' => $metadata['ats'] ?? null,
            'content' => $this->when(
                $this->status === UserResumeStatus::Completed,
                [
                    'full_text' => $this->extracted_text,
                    'sections' => $metadata['sections'] ?? [],
                ],
            ),
            'ai_analysis' => $aiAvailable ? [
                'status' => $analysis->status,
                'professional_title' => $analysis->professional_title,
                'seniority_level' => $analysis->seniority_level,
                'overall_score' => $analysis->overall_score !== null ? (float) $analysis->overall_score : null,
                'ats_score' => $analysis->ats_score !== null ? (float) $analysis->ats_score : null,
                'completeness_score' => $analysis->completeness_score !== null ? (float) $analysis->completeness_score : null,
                'professional_summary' => $analysis->professional_summary,
                'strengths' => $analysis->strengths ?? [],
                'weaknesses' => $analysis->weaknesses ?? [],
                'skills' => $analysis->skills ?? [],
                'suggestions' => $analysis->suggestions ?? [],
                'completed_at' => $analysis->completed_at,
            ] : null,
            'processing_error' => $this->when(
                $this->status === UserResumeStatus::Failed,
                $metadata['processing']['failure_code'] ?? 'BOT_PROCESSING_FAILED',
            ),
        ];
    }
}
