<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SubscriptionPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SubscriptionPlan extends Model
{
    /** @use HasFactory<SubscriptionPlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'currency', 'billing_interval',
        'billing_interval_count', 'features', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'features' => 'array', 'is_active' => 'boolean'];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }
}
