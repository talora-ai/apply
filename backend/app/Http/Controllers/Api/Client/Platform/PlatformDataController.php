<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Client\Platform;

use App\Helpers\ResponseApi;
use App\Http\Controllers\Controller;
use App\Models\JobFavorite;
use App\Models\JobPosting;
use App\Models\SubscriptionPlan;
use App\Models\UserResume;
use App\Services\Jobs\RuntimeJobCompatibilityService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PlatformDataController extends Controller
{
    public function __construct(
        private readonly RuntimeJobCompatibilityService $compatibility,
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $primaryResume = $this->primaryResume($user);
        $latestResumeAnalysis = $primaryResume?->latestAnalysis;

        $allActiveJobs = JobPosting::query()
            ->with(['company:id,name,logo_url,website_url', 'source:id,name'])
            ->where('status', 'active')
            ->orderByDesc('published_at')
            ->get();

        $runtime = $this->runtimeResults($allActiveJobs, $primaryResume);
        $scores = collect($runtime)->pluck('score')->filter(fn ($score) => $score !== null);

        return ResponseApi::success('Dashboard retrieved successfully.', [
            'statistics' => [
                'jobs_found' => $allActiveJobs->count(),
                'average_compatibility' => $scores->isNotEmpty() ? round((float) $scores->avg(), 1) : null,
                'applications' => $user->jobApplications()->count(),
                'favorites' => $user->jobFavorites()->count(),
                'resumes' => $user->resumes()->count(),
            ],
            'primary_resume' => $primaryResume ? [
                'id' => $primaryResume->id,
                'name' => $primaryResume->name,
            ] : null,
            'opportunities' => $allActiveJobs->take(5)->map(
                fn (JobPosting $job): array => $this->jobPayload($job, $runtime[$job->id] ?? null),
            )->values(),
            'resume_analysis' => $latestResumeAnalysis ? [
                'id' => $latestResumeAnalysis->id,
                'status' => $latestResumeAnalysis->status,
                'professional_title' => $latestResumeAnalysis->professional_title,
                'seniority_level' => $latestResumeAnalysis->seniority_level,
                'overall_score' => $latestResumeAnalysis->overall_score !== null ? (float) $latestResumeAnalysis->overall_score : null,
                'ats_score' => $latestResumeAnalysis->ats_score !== null ? (float) $latestResumeAnalysis->ats_score : null,
                'completeness_score' => $latestResumeAnalysis->completeness_score !== null ? (float) $latestResumeAnalysis->completeness_score : null,
                'skills' => $latestResumeAnalysis->skills ?? [],
                'strengths' => $latestResumeAnalysis->strengths ?? [],
                'weaknesses' => $latestResumeAnalysis->weaknesses ?? [],
                'suggestions' => $latestResumeAnalysis->suggestions ?? [],
                'completed_at' => $latestResumeAnalysis->completed_at?->toISOString(),
            ] : null,
        ]);
    }

    public function jobs(Request $request): JsonResponse
    {
        $user = $request->user();
        $primaryResume = $this->primaryResume($user);
        $search = trim((string) $request->query('q', ''));

        $jobs = JobPosting::query()
            ->with(['company:id,name,logo_url,website_url', 'source:id,name'])
            ->where('status', 'active')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhereHas('company', fn ($company) => $company->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('published_at')
            ->get();

        $favorites = $user->jobFavorites()
            ->whereIn('job_posting_id', $jobs->pluck('id'))
            ->pluck('job_posting_id')
            ->flip();
        $runtime = $this->runtimeResults($jobs, $primaryResume);

        return ResponseApi::success('Jobs retrieved successfully.', [
            'jobs' => $jobs->map(function (JobPosting $job) use ($favorites, $runtime): array {
                return [
                    ...$this->jobPayload($job, $runtime[$job->id] ?? null),
                    'is_favorite' => $favorites->has($job->id),
                ];
            }),
            'primary_resume' => $primaryResume ? ['id' => $primaryResume->id, 'name' => $primaryResume->name] : null,
            'query' => $search,
        ]);
    }

    public function applications(Request $request): JsonResponse
    {
        $user = $request->user();
        $primaryResume = $this->primaryResume($user);
        $applications = $user->jobApplications()
            ->with(['jobPosting.company:id,name,logo_url,website_url', 'jobPosting.source:id,name', 'resume:id,name,original_filename'])
            ->latest()
            ->get();

        return ResponseApi::success('Applications retrieved successfully.', [
            'applications' => $applications->map(function ($application) use ($primaryResume): array {
                $runtime = $application->jobPosting
                    ? $this->compatibility->compare($primaryResume, $application->jobPosting)
                    : null;

                return [
                    'id' => $application->id,
                    'status' => $application->status,
                    'compatibility_score' => $runtime['score'] ?? null,
                    'is_automatic' => $application->is_automatic,
                    'applied_at' => $application->applied_at?->toISOString(),
                    'last_status_at' => $application->last_status_at?->toISOString(),
                    'failure_reason' => $application->failure_reason,
                    'job' => $application->jobPosting ? $this->jobPayload($application->jobPosting, $runtime) : null,
                    'resume' => $application->resume ? [
                        'id' => $application->resume->id,
                        'name' => $application->resume->name,
                        'original_filename' => $application->resume->original_filename,
                    ] : null,
                ];
            }),
            'primary_resume' => $primaryResume ? ['id' => $primaryResume->id, 'name' => $primaryResume->name] : null,
        ]);
    }

    public function favorites(Request $request): JsonResponse
    {
        $user = $request->user();
        $primaryResume = $this->primaryResume($user);
        $favorites = $user->jobFavorites()
            ->with(['jobPosting.company:id,name,logo_url,website_url', 'jobPosting.source:id,name'])
            ->latest()
            ->get();

        return ResponseApi::success('Favorites retrieved successfully.', [
            'favorites' => $favorites->map(function ($favorite) use ($primaryResume): array {
                $runtime = $this->compatibility->compare($primaryResume, $favorite->jobPosting);

                return [
                    'id' => $favorite->id,
                    'created_at' => $favorite->created_at?->toISOString(),
                    'job' => $this->jobPayload($favorite->jobPosting, $runtime),
                ];
            }),
            'primary_resume' => $primaryResume ? ['id' => $primaryResume->id, 'name' => $primaryResume->name] : null,
        ]);
    }

    public function storeFavorite(Request $request, JobPosting $job): JsonResponse
    {
        $favorite = JobFavorite::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'job_posting_id' => $job->id,
        ]);

        return ResponseApi::success('Job added to favorites.', ['favorite_id' => $favorite->id], 201);
    }

    public function destroyFavorite(Request $request, JobPosting $job): JsonResponse
    {
        JobFavorite::query()
            ->where('user_id', $request->user()->id)
            ->where('job_posting_id', $job->id)
            ->delete();

        return ResponseApi::success('Job removed from favorites.');
    }

    public function analytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $primaryResume = $this->primaryResume($user);
        $latestResumeAnalysis = $primaryResume?->latestAnalysis;
        $jobs = JobPosting::query()
            ->with('company:id,name')
            ->where('status', 'active')
            ->orderByDesc('published_at')
            ->get();
        $runtime = $this->runtimeResults($jobs, $primaryResume);
        $scores = collect($runtime)->pluck('score')->filter(fn ($score) => $score !== null);

        $statusCounts = $user->jobApplications()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $ranked = $jobs
            ->map(fn (JobPosting $job): array => [
                'job' => $job,
                'result' => $runtime[$job->id] ?? null,
            ])
            ->filter(fn (array $item): bool => $item['result'] !== null)
            ->sortByDesc(fn (array $item): float => (float) $item['result']['score'])
            ->take(20)
            ->values();

        return ResponseApi::success('Analytics retrieved successfully.', [
            'applications_total' => $user->jobApplications()->count(),
            'applications_by_status' => $statusCounts,
            'average_compatibility' => $scores->isNotEmpty() ? round((float) $scores->avg(), 1) : null,
            'primary_resume' => $primaryResume ? ['id' => $primaryResume->id, 'name' => $primaryResume->name] : null,
            'resume_analysis' => $latestResumeAnalysis ? [
                'status' => $latestResumeAnalysis->status,
                'professional_title' => $latestResumeAnalysis->professional_title,
                'seniority_level' => $latestResumeAnalysis->seniority_level,
                'overall_score' => $latestResumeAnalysis->overall_score !== null ? (float) $latestResumeAnalysis->overall_score : null,
                'ats_score' => $latestResumeAnalysis->ats_score !== null ? (float) $latestResumeAnalysis->ats_score : null,
                'completeness_score' => $latestResumeAnalysis->completeness_score !== null ? (float) $latestResumeAnalysis->completeness_score : null,
                'skills' => $latestResumeAnalysis->skills ?? [],
                'strengths' => $latestResumeAnalysis->strengths ?? [],
                'weaknesses' => $latestResumeAnalysis->weaknesses ?? [],
                'suggestions' => $latestResumeAnalysis->suggestions ?? [],
            ] : null,
            'compatibilities' => $ranked->map(function (array $item): array {
                /** @var JobPosting $job */
                $job = $item['job'];
                $result = $item['result'];

                return [
                    'id' => $job->id,
                    'status' => 'runtime',
                    'overall_score' => $result['score'],
                    'matching_skills' => $result['matching_skills'],
                    'model' => $result['model'],
                    'job' => [
                        'id' => $job->id,
                        'title' => $job->title,
                        'company' => $job->company?->name,
                    ],
                ];
            }),
        ]);
    }

    public function billing(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscriptions = $user->subscriptions()->with('plan')->latest()->get();
        $transactions = $user->paymentTransactions()->latest('processed_at')->limit(20)->get();
        $plans = SubscriptionPlan::query()->where('is_active', true)->orderBy('sort_order')->get();

        return ResponseApi::success('Billing retrieved successfully.', [
            'subscriptions' => $subscriptions->map(fn ($subscription): array => [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'provider' => $subscription->provider,
                'starts_at' => $subscription->starts_at?->toISOString(),
                'trial_ends_at' => $subscription->trial_ends_at?->toISOString(),
                'current_period_ends_at' => $subscription->current_period_ends_at?->toISOString(),
                'canceled_at' => $subscription->canceled_at?->toISOString(),
                'plan' => $subscription->plan ? [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'slug' => $subscription->plan->slug,
                    'price' => (float) $subscription->plan->price,
                    'currency' => $subscription->plan->currency,
                    'billing_interval' => $subscription->plan->billing_interval,
                    'features' => $subscription->plan->features ?? [],
                ] : null,
            ]),
            'transactions' => $transactions->map(fn ($transaction): array => [
                'id' => $transaction->id,
                'provider' => $transaction->provider,
                'type' => $transaction->type,
                'status' => $transaction->status,
                'amount' => (float) $transaction->amount,
                'currency' => $transaction->currency,
                'processed_at' => $transaction->processed_at?->toISOString(),
                'failure_reason' => $transaction->failure_reason,
            ]),
            'plans' => $plans->map(fn ($plan): array => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => (float) $plan->price,
                'currency' => $plan->currency,
                'billing_interval' => $plan->billing_interval,
                'billing_interval_count' => $plan->billing_interval_count,
                'features' => $plan->features ?? [],
            ]),
        ]);
    }

    private function primaryResume($user): ?UserResume
    {
        return $user->resumes()
            ->with('latestAnalysis')
            ->where('is_primary', true)
            ->where('status', 'completed')
            ->first();
    }

    /** @param Collection<int, JobPosting> $jobs @return array<int, array{score: float, matching_skills: array<int, string>, model: string}|null> */
    private function runtimeResults(Collection $jobs, ?UserResume $resume): array
    {
        $results = [];
        foreach ($jobs as $job) {
            $results[$job->id] = $this->compatibility->compare($resume, $job);
        }

        return $results;
    }

    /** @param array{score: float, matching_skills: array<int, string>, model: string}|null $compatibility */
    private function jobPayload(JobPosting $job, ?array $compatibility = null): array
    {
        return [
            'id' => $job->id,
            'title' => $job->title,
            'description' => $job->description,
            'location' => $job->location,
            'workplace_type' => $job->workplace_type,
            'employment_type' => $job->employment_type,
            'seniority_level' => $job->seniority_level,
            'salary_min' => $job->salary_min !== null ? (float) $job->salary_min : null,
            'salary_max' => $job->salary_max !== null ? (float) $job->salary_max : null,
            'salary_currency' => $job->salary_currency,
            'application_url' => $job->application_url,
            'published_at' => $job->published_at?->toISOString(),
            'expires_at' => $job->expires_at?->toISOString(),
            'compatibility_score' => $compatibility['score'] ?? null,
            'compatibility_model' => $compatibility['model'] ?? null,
            'matching_skills' => $compatibility['matching_skills'] ?? [],
            'company' => $job->company ? [
                'id' => $job->company->id,
                'name' => $job->company->name,
                'logo_url' => $job->company->logo_url,
                'website_url' => $job->company->website_url,
            ] : null,
            'source' => $job->source ? [
                'id' => $job->source->id,
                'name' => $job->source->name,
            ] : null,
        ];
    }
}
