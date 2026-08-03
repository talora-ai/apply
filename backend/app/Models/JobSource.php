<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\JobSourceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class JobSource extends Model
{
    /** @use HasFactory<JobSourceFactory> */
    use HasFactory;

    protected $fillable = ['name', 'slug', 'base_url', 'is_active', 'configuration'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'configuration' => 'array'];
    }

    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class);
    }
}
