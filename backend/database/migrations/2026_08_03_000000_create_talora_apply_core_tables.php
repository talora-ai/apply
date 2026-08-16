<?php

declare(strict_types=1);

use App\Enums\UserResumeStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_sources', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('base_url')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->json('configuration')->nullable();
            $table->timestamps();
        });

        Schema::create('companies', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo_url')->nullable();
            $table->string('website_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('job_postings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->foreignId('job_source_id')
                ->constrained()
                ->restrictOnDelete();
            $table->string('external_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('workplace_type')->nullable()->index();
            $table->string('employment_type')->nullable()->index();
            $table->string('seniority_level')->nullable()->index();
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->char('salary_currency', 3)->nullable();
            $table->string('application_url', 2048);
            $table->string('status')->default('active')->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('last_synced_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(
                ['job_source_id', 'external_id'],
                'job_postings_source_external_unique',
            );
            $table->index(['status', 'published_at']);
        });

        Schema::create('subscription_plans', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->char('currency', 3)->default('BRL');
            $table->string('billing_interval')->default('monthly');
            $table->unsignedInteger('billing_interval_count')->default(1);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('user_resumes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('original_filename');
            $table->string('disk')->default('local');
            $table->string('path');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size');
            $table->string('status')->default(UserResumeStatus::Pending->value)->index();
            $table->boolean('is_primary')->default(false)->index();
            $table->text('extracted_text')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
        });

        Schema::create('job_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('job_posting_id')
                ->constrained()
                ->restrictOnDelete();
            $table->foreignId('user_resume_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('status')->default('pending')->index();
            $table->decimal('compatibility_score', 5, 2)->nullable();
            $table->boolean('is_automatic')->default(false)->index();
            $table->timestamp('applied_at')->nullable()->index();
            $table->timestamp('last_status_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(
                ['user_id', 'job_posting_id'],
                'job_applications_user_posting_unique',
            );
            $table->index(['user_id', 'status']);
        });

        Schema::create('job_application_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('job_application_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('status')->index();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at')->useCurrent()->index();
            $table->timestamps();
        });

        Schema::create('job_favorites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('job_posting_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(
                ['user_id', 'job_posting_id'],
                'job_favorites_user_posting_unique',
            );
        });

        Schema::create('user_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->restrictOnDelete();
            $table->foreignId('subscription_plan_id')
                ->constrained()
                ->restrictOnDelete();
            $table->string('provider')->nullable()->index();
            $table->string('provider_customer_id')->nullable()->index();
            $table->string('provider_subscription_id')->nullable()->unique();
            $table->string('status')->default('pending')->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_starts_at')->nullable();
            $table->timestamp('current_period_ends_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('payment_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->restrictOnDelete();
            $table->foreignId('user_subscription_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('provider')->index();
            $table->string('provider_transaction_id')->nullable()->unique();
            $table->string('type')->default('payment')->index();
            $table->string('status')->default('pending')->index();
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('BRL');
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('user_subscriptions');
        Schema::dropIfExists('job_favorites');
        Schema::dropIfExists('job_application_events');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('user_resumes');
        Schema::dropIfExists('subscription_plans');
        Schema::dropIfExists('job_postings');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('job_sources');
    }
};
