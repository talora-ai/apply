<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\PaymentTransaction;
use App\Models\ResumeAnalysis;
use App\Models\User;
use App\Models\UserResume;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;

final class DashboardController extends Controller
{
    public function __invoke(): View
    {
        $cards = [
            ['label' => 'Usuários', 'value' => User::count(), 'icon' => 'people', 'resource' => 'users'],
            ['label' => 'Currículos', 'value' => UserResume::count(), 'icon' => 'file-earmark-person', 'resource' => 'user-resumes'],
            ['label' => 'Vagas', 'value' => JobPosting::count(), 'icon' => 'briefcase', 'resource' => 'job-postings'],
            ['label' => 'Empresas', 'value' => Company::count(), 'icon' => 'buildings', 'resource' => 'companies'],
            ['label' => 'Candidaturas', 'value' => JobApplication::count(), 'icon' => 'send-check', 'resource' => 'job-applications'],
            ['label' => 'Análises', 'value' => ResumeAnalysis::count(), 'icon' => 'activity', 'resource' => 'resume-analyses'],
            ['label' => 'Assinaturas', 'value' => UserSubscription::count(), 'icon' => 'credit-card', 'resource' => 'subscriptions'],
            ['label' => 'Transações', 'value' => PaymentTransaction::count(), 'icon' => 'cash-stack', 'resource' => 'transactions'],
        ];

        $failedJobs = Schema::hasTable('failed_jobs') ? DB::table('failed_jobs')->count() : 0;
        $pendingDatabaseJobs = Schema::hasTable('jobs') ? DB::table('jobs')->count() : 0;

        return view('admin.dashboard', [
            'cards' => $cards,
            'failedJobs' => $failedJobs,
            'pendingDatabaseJobs' => $pendingDatabaseJobs,
            'recentUsers' => User::query()->latest()->limit(6)->get(),
            'recentApplications' => JobApplication::query()->with(['user', 'jobPosting'])->latest()->limit(6)->get(),
            'recentResumes' => UserResume::query()->with('user')->latest()->limit(6)->get(),
        ]);
    }
}
