<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\JobFavoriteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class JobFavorite extends Model
{
    /** @use HasFactory<JobFavoriteFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'job_posting_id'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function jobPosting(): BelongsTo { return $this->belongsTo(JobPosting::class); }
}
