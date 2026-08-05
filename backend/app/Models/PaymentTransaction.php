<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PaymentTransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PaymentTransaction extends Model
{
    /** @use HasFactory<PaymentTransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'user_subscription_id', 'provider', 'provider_transaction_id',
        'type', 'status', 'amount', 'currency', 'failure_reason', 'processed_at', 'metadata',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'processed_at' => 'datetime', 'metadata' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(UserSubscription::class, 'user_subscription_id');
    }
}
