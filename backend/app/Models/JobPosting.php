<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\JobPostingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class JobPosting extends Model
{
    /** @use HasFactory<JobPostingFactory> */
    use HasFactory;

    protected $fillable = [
        'company_id', 'job_source_id', 'external_id', 'title', 'description',
        'location', 'workplace_type', 'employment_type', 'seniority_level',
        'salary_min', 'salary_max', 'salary_currency', 'application_url',
        'status', 'published_at', 'expires_at', 'last_synced_at', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'salary_min'     => 'decimal:2', 'salary_max' => 'decimal:2',
            'published_at'   => 'datetime', 'expires_at' => 'datetime',
            'last_synced_at' => 'datetime', 'metadata' => 'array',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(JobSource::class, 'job_source_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(JobFavorite::class);
    }
}
