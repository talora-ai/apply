<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\EncryptedResumeData;
use App\Enums\UserResumeStatus;
use Database\Factories\UserResumeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class UserResume extends Model
{
    /** @use HasFactory<UserResumeFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'original_filename', 'disk', 'path', 'mime_type',
        'size', 'status', 'is_primary', 'extracted_text', 'metadata', 'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'name'              => EncryptedResumeData::class . ':string',
            'original_filename' => EncryptedResumeData::class . ':string',
            'is_primary'        => 'boolean',
            'extracted_text'    => EncryptedResumeData::class . ':string',
            'metadata'          => EncryptedResumeData::class . ':array',
            'processed_at'      => 'datetime',
            'status'            => UserResumeStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(ResumeAnalysis::class);
    }

    public function compatibilityAnalyses(): HasMany
    {
        return $this->hasMany(JobCompatibilityAnalysis::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }
}
