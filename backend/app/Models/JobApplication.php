<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\JobApplicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class JobApplication extends Model
{
    /** @use HasFactory<JobApplicationFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'job_posting_id', 'user_resume_id', 'status',
        'compatibility_score', 'is_automatic', 'applied_at', 'last_status_at',
        'failure_reason', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'compatibility_score' => 'decimal:2', 'is_automatic' => 'boolean',
            'applied_at'          => 'datetime', 'last_status_at' => 'datetime', 'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function resume(): BelongsTo
    {
        return $this->belongsTo(UserResume::class, 'user_resume_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(JobApplicationEvent::class);
    }
}
