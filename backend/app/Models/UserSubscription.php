<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserSubscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class UserSubscription extends Model
{
    /** @use HasFactory<UserSubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'subscription_plan_id', 'provider', 'provider_customer_id',
        'provider_subscription_id', 'status', 'starts_at', 'trial_ends_at',
        'current_period_starts_at', 'current_period_ends_at', 'canceled_at',
        'ends_at', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'starts_at'                => 'datetime', 'trial_ends_at' => 'datetime',
            'current_period_starts_at' => 'datetime', 'current_period_ends_at' => 'datetime',
            'canceled_at'              => 'datetime', 'ends_at' => 'datetime', 'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
