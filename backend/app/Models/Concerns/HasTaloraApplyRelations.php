<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\JobApplication;
use App\Models\JobCompatibilityAnalysis;
use App\Models\JobFavorite;
use App\Models\PaymentTransaction;
use App\Models\ResumeAnalysis;
use App\Models\UserResume;
use App\Models\UserSubscription;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasTaloraApplyRelations
{
    public function resumes(): HasMany
    {
        return $this->hasMany(UserResume::class);
    }

    public function resumeAnalyses(): HasMany
    {
        return $this->hasMany(ResumeAnalysis::class);
    }

    public function compatibilityAnalyses(): HasMany
    {
        return $this->hasMany(JobCompatibilityAnalysis::class);
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function jobFavorites(): HasMany
    {
        return $this->hasMany(JobFavorite::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
