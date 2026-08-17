<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('job_compatibility_analyses');

        if (Schema::hasColumn('job_applications', 'compatibility_score')) {
            Schema::table('job_applications', function (Blueprint $table): void {
                $table->dropColumn('compatibility_score');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('job_applications', 'compatibility_score')) {
            Schema::table('job_applications', function (Blueprint $table): void {
                $table->decimal('compatibility_score', 5, 2)->nullable();
            });
        }

        if (! Schema::hasTable('job_compatibility_analyses')) {
            Schema::create('job_compatibility_analyses', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_resume_id')->constrained()->cascadeOnDelete();
                $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
                $table->foreignId('resume_analysis_id')->nullable()->constrained()->nullOnDelete();
                $table->string('status')->default('pending')->index();
                $table->decimal('overall_score', 5, 2)->nullable();
                $table->decimal('skills_score', 5, 2)->nullable();
                $table->decimal('experience_score', 5, 2)->nullable();
                $table->decimal('education_score', 5, 2)->nullable();
                $table->decimal('location_score', 5, 2)->nullable();
                $table->string('recommendation')->nullable()->index();
                $table->text('summary')->nullable();
                $table->json('matching_skills')->nullable();
                $table->json('missing_skills')->nullable();
                $table->json('strengths')->nullable();
                $table->json('risks')->nullable();
                $table->json('suggestions')->nullable();
                $table->string('provider')->nullable();
                $table->string('model')->nullable();
                $table->string('prompt_version')->nullable();
                $table->unsignedInteger('input_tokens')->nullable();
                $table->unsignedInteger('output_tokens')->nullable();
                $table->decimal('estimated_cost', 12, 6)->nullable();
                $table->text('failure_reason')->nullable();
                $table->json('raw_response')->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'job_posting_id', 'status'], 'compatibility_user_job_status_index');
                $table->index(['user_resume_id', 'overall_score'], 'compatibility_resume_score_index');
            });
        }
    }
};
