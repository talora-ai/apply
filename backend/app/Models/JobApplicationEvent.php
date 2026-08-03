<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\JobApplicationEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class JobApplicationEvent extends Model
{
    /** @use HasFactory<JobApplicationEventFactory> */
    use HasFactory;

    protected $fillable = ['job_application_id', 'status', 'description', 'metadata', 'occurred_at'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'occurred_at' => 'datetime'];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }
}
