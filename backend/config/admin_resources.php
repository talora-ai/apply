<?php

declare(strict_types=1);

use App\Models\Admin;
use App\Models\Company;
use App\Models\JobApplication;
use App\Models\JobApplicationEvent;
use App\Models\JobFavorite;
use App\Models\JobPosting;
use App\Models\JobSource;
use App\Models\PaymentTransaction;
use App\Models\ResumeAnalysis;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserResume;
use App\Models\UserSubscription;

$statuses = fn (array $values): array => array_combine($values, $values);

return [
    'groups' => [
        'Acesso' => ['admins', 'users'],
        'Currículos' => ['user-resumes', 'resume-analyses'],
        'Vagas' => ['companies', 'job-sources', 'job-postings', 'job-applications', 'application-events', 'favorites'],
        'Financeiro' => ['subscription-plans', 'subscriptions', 'transactions'],
    ],
    'resources' => [
        'admins' => [
            'label' => 'Administradores', 'singular' => 'Administrador', 'model' => Admin::class,
            'search' => ['name', 'email'], 'columns' => ['id', 'name', 'email', 'is_active', 'last_login_at', 'created_at'],
            'fields' => [
                'name' => ['label' => 'Nome', 'type' => 'text', 'rules' => 'required|string|max:150'],
                'email' => ['label' => 'E-mail', 'type' => 'email', 'rules' => 'required|email|max:190'],
                'password' => ['label' => 'Senha', 'type' => 'password', 'rules_create' => 'required|string|min:8', 'rules_update' => 'nullable|string|min:8'],
                'is_active' => ['label' => 'Ativo', 'type' => 'boolean', 'rules' => 'boolean'],
            ],
        ],
        'users' => [
            'label' => 'Usuários', 'singular' => 'Usuário', 'model' => User::class,
            'search' => ['name', 'last_name', 'email'], 'columns' => ['id', 'name', 'last_name', 'email', 'last_login', 'created_at'],
            'fields' => [
                'name' => ['label' => 'Nome', 'type' => 'text', 'rules' => 'required|string|max:150'],
                'last_name' => ['label' => 'Sobrenome', 'type' => 'text', 'rules' => 'nullable|string|max:150'],
                'email' => ['label' => 'E-mail', 'type' => 'email', 'rules' => 'required|email|max:190'],
                'password' => ['label' => 'Senha', 'type' => 'password', 'rules_create' => 'required|string|min:8', 'rules_update' => 'nullable|string|min:8'],
            ],
        ],
        'user-resumes' => [
            'label' => 'Currículos', 'singular' => 'Currículo', 'model' => UserResume::class,
            'search' => ['status'], 'columns' => ['id', 'user_id', 'name', 'status', 'is_primary', 'processed_at', 'created_at'],
            'special' => 'resume',
            'fields' => [
                'user_id' => ['label' => 'Usuário', 'type' => 'relation', 'model' => User::class, 'option' => 'email', 'rules' => 'required|exists:users,id'],
                'name' => ['label' => 'Nome do currículo', 'type' => 'text', 'rules' => 'required|string|max:190'],
                'file' => ['label' => 'Arquivo', 'type' => 'file', 'only_create' => true, 'rules' => 'required|file|mimes:pdf,doc,docx|max:10240'],
                'status' => ['label' => 'Status', 'type' => 'select', 'options' => $statuses(['pending','processing','completed','failed']), 'only_update' => true, 'rules' => 'required|string'],
                'is_primary' => ['label' => 'Principal', 'type' => 'boolean', 'only_update' => true, 'rules' => 'boolean'],
                'processed_at' => ['label' => 'Processado em', 'type' => 'datetime', 'only_update' => true, 'rules' => 'nullable|date'],
            ],
        ],
        'resume-analyses' => [
            'label' => 'Análises de currículo', 'singular' => 'Análise', 'model' => ResumeAnalysis::class,
            'search' => ['status','professional_title','provider','model'], 'columns' => ['id','user_id','user_resume_id','status','overall_score','ats_score','provider','model','completed_at'],
            'fields' => [
                'user_id' => ['label'=>'Usuário','type'=>'relation','model'=>User::class,'option'=>'email','rules'=>'required|exists:users,id'],
                'user_resume_id' => ['label'=>'Currículo','type'=>'relation','model'=>UserResume::class,'option'=>'name','rules'=>'required|exists:user_resumes,id'],
                'status' => ['label'=>'Status','type'=>'select','options'=>$statuses(['pending','processing','completed','failed']),'rules'=>'required|string'],
                'professional_title' => ['label'=>'Título profissional','type'=>'text','rules'=>'nullable|string|max:190'],
                'seniority_level' => ['label'=>'Senioridade','type'=>'text','rules'=>'nullable|string|max:100'],
                'overall_score' => ['label'=>'Score geral','type'=>'number','step'=>'0.01','rules'=>'nullable|numeric|min:0|max:100'],
                'ats_score' => ['label'=>'Score ATS','type'=>'number','step'=>'0.01','rules'=>'nullable|numeric|min:0|max:100'],
                'completeness_score' => ['label'=>'Completude','type'=>'number','step'=>'0.01','rules'=>'nullable|numeric|min:0|max:100'],
                'professional_summary' => ['label'=>'Resumo profissional','type'=>'textarea','rules'=>'nullable|string'],
                'strengths' => ['label'=>'Pontos fortes (JSON)','type'=>'json','rules'=>'nullable'],
                'weaknesses' => ['label'=>'Pontos fracos (JSON)','type'=>'json','rules'=>'nullable'],
                'skills' => ['label'=>'Skills (JSON)','type'=>'json','rules'=>'nullable'],
                'suggestions' => ['label'=>'Sugestões (JSON)','type'=>'json','rules'=>'nullable'],
                'provider' => ['label'=>'Provider','type'=>'text','rules'=>'nullable|string|max:100'],
                'model' => ['label'=>'Modelo','type'=>'text','rules'=>'nullable|string|max:150'],
                'prompt_version' => ['label'=>'Versão do prompt','type'=>'text','rules'=>'nullable|string|max:100'],
                'input_tokens' => ['label'=>'Tokens entrada','type'=>'number','rules'=>'nullable|integer|min:0'],
                'output_tokens' => ['label'=>'Tokens saída','type'=>'number','rules'=>'nullable|integer|min:0'],
                'estimated_cost' => ['label'=>'Custo estimado','type'=>'number','step'=>'0.000001','rules'=>'nullable|numeric|min:0'],
                'failure_reason' => ['label'=>'Falha','type'=>'textarea','rules'=>'nullable|string'],
                'raw_response' => ['label'=>'Resposta bruta (JSON)','type'=>'json','rules'=>'nullable'],
                'started_at' => ['label'=>'Iniciada em','type'=>'datetime','rules'=>'nullable|date'],
                'completed_at' => ['label'=>'Concluída em','type'=>'datetime','rules'=>'nullable|date'],
            ],
        ],
        'companies' => [
            'label'=>'Empresas','singular'=>'Empresa','model'=>Company::class,'search'=>['name','slug'],'columns'=>['id','name','slug','website_url','created_at'],
            'fields'=>[
                'name'=>['label'=>'Nome','type'=>'text','rules'=>'required|string|max:190'],
                'slug'=>['label'=>'Slug','type'=>'text','rules'=>'required|string|max:190'],
                'logo_url'=>['label'=>'Logo URL','type'=>'url','rules'=>'nullable|url|max:2048'],
                'website_url'=>['label'=>'Site','type'=>'url','rules'=>'nullable|url|max:2048'],
                'description'=>['label'=>'Descrição','type'=>'textarea','rules'=>'nullable|string'],
            ],
        ],
        'job-sources' => [
            'label'=>'Fontes de vagas','singular'=>'Fonte','model'=>JobSource::class,'search'=>['name','slug','base_url'],'columns'=>['id','name','slug','base_url','is_active','created_at'],
            'fields'=>[
                'name'=>['label'=>'Nome','type'=>'text','rules'=>'required|string|max:190'],
                'slug'=>['label'=>'Slug','type'=>'text','rules'=>'required|string|max:190'],
                'base_url'=>['label'=>'URL base','type'=>'url','rules'=>'nullable|url|max:2048'],
                'is_active'=>['label'=>'Ativa','type'=>'boolean','rules'=>'boolean'],
                'configuration'=>['label'=>'Configuração (JSON)','type'=>'json','rules'=>'nullable'],
            ],
        ],
        'job-postings' => [
            'label'=>'Vagas','singular'=>'Vaga','model'=>JobPosting::class,'search'=>['title','description','location','status','external_id'],'columns'=>['id','title','company_id','job_source_id','location','status','published_at','created_at'],
            'fields'=>[
                'company_id'=>['label'=>'Empresa','type'=>'relation','model'=>Company::class,'option'=>'name','nullable'=>true,'rules'=>'nullable|exists:companies,id'],
                'job_source_id'=>['label'=>'Fonte','type'=>'relation','model'=>JobSource::class,'option'=>'name','rules'=>'required|exists:job_sources,id'],
                'external_id'=>['label'=>'ID externo','type'=>'text','rules'=>'nullable|string|max:190'],
                'title'=>['label'=>'Título','type'=>'text','rules'=>'required|string|max:255'],
                'description'=>['label'=>'Descrição','type'=>'textarea','rules'=>'required|string'],
                'location'=>['label'=>'Localização','type'=>'text','rules'=>'nullable|string|max:190'],
                'workplace_type'=>['label'=>'Modelo de trabalho','type'=>'select','options'=>$statuses(['remote','hybrid','onsite']),'nullable'=>true,'rules'=>'nullable|string'],
                'employment_type'=>['label'=>'Tipo de contrato','type'=>'text','rules'=>'nullable|string|max:100'],
                'seniority_level'=>['label'=>'Senioridade','type'=>'text','rules'=>'nullable|string|max:100'],
                'salary_min'=>['label'=>'Salário mínimo','type'=>'number','step'=>'0.01','rules'=>'nullable|numeric|min:0'],
                'salary_max'=>['label'=>'Salário máximo','type'=>'number','step'=>'0.01','rules'=>'nullable|numeric|min:0'],
                'salary_currency'=>['label'=>'Moeda','type'=>'text','rules'=>'nullable|string|size:3'],
                'application_url'=>['label'=>'URL candidatura','type'=>'url','rules'=>'required|url|max:2048'],
                'status'=>['label'=>'Status','type'=>'select','options'=>$statuses(['active','inactive','expired','closed']),'rules'=>'required|string'],
                'published_at'=>['label'=>'Publicada em','type'=>'datetime','rules'=>'nullable|date'],
                'expires_at'=>['label'=>'Expira em','type'=>'datetime','rules'=>'nullable|date'],
                'last_synced_at'=>['label'=>'Sincronizada em','type'=>'datetime','rules'=>'nullable|date'],
                'metadata'=>['label'=>'Metadados (JSON)','type'=>'json','rules'=>'nullable'],
            ],
        ],
        'job-applications' => [
            'label'=>'Candidaturas','singular'=>'Candidatura','model'=>JobApplication::class,'search'=>['status','failure_reason'],'columns'=>['id','user_id','job_posting_id','user_resume_id','status','is_automatic','applied_at','created_at'],
            'fields'=>[
                'user_id'=>['label'=>'Usuário','type'=>'relation','model'=>User::class,'option'=>'email','rules'=>'required|exists:users,id'],
                'job_posting_id'=>['label'=>'Vaga','type'=>'relation','model'=>JobPosting::class,'option'=>'title','rules'=>'required|exists:job_postings,id'],
                'user_resume_id'=>['label'=>'Currículo','type'=>'relation','model'=>UserResume::class,'option'=>'name','nullable'=>true,'rules'=>'nullable|exists:user_resumes,id'],
                'status'=>['label'=>'Status','type'=>'select','options'=>$statuses(['pending','submitted','in_progress','interview','rejected','offer','hired','failed']),'rules'=>'required|string'],
                'is_automatic'=>['label'=>'Automática','type'=>'boolean','rules'=>'boolean'],
                'applied_at'=>['label'=>'Candidatou em','type'=>'datetime','rules'=>'nullable|date'],
                'last_status_at'=>['label'=>'Último status','type'=>'datetime','rules'=>'nullable|date'],
                'failure_reason'=>['label'=>'Motivo da falha','type'=>'textarea','rules'=>'nullable|string'],
                'metadata'=>['label'=>'Metadados (JSON)','type'=>'json','rules'=>'nullable'],
            ],
        ],
        'application-events' => [
            'label'=>'Eventos de candidatura','singular'=>'Evento','model'=>JobApplicationEvent::class,'search'=>['status','description'],'columns'=>['id','job_application_id','status','occurred_at','created_at'],
            'fields'=>[
                'job_application_id'=>['label'=>'Candidatura','type'=>'relation','model'=>JobApplication::class,'option'=>'id','rules'=>'required|exists:job_applications,id'],
                'status'=>['label'=>'Status','type'=>'text','rules'=>'required|string|max:100'],
                'description'=>['label'=>'Descrição','type'=>'textarea','rules'=>'nullable|string'],
                'metadata'=>['label'=>'Metadados (JSON)','type'=>'json','rules'=>'nullable'],
                'occurred_at'=>['label'=>'Ocorreu em','type'=>'datetime','rules'=>'required|date'],
            ],
        ],
        'favorites' => [
            'label'=>'Favoritos','singular'=>'Favorito','model'=>JobFavorite::class,'search'=>[],'columns'=>['id','user_id','job_posting_id','created_at'],
            'fields'=>[
                'user_id'=>['label'=>'Usuário','type'=>'relation','model'=>User::class,'option'=>'email','rules'=>'required|exists:users,id'],
                'job_posting_id'=>['label'=>'Vaga','type'=>'relation','model'=>JobPosting::class,'option'=>'title','rules'=>'required|exists:job_postings,id'],
            ],
        ],
        'subscription-plans' => [
            'label'=>'Planos','singular'=>'Plano','model'=>SubscriptionPlan::class,'search'=>['name','slug'],'columns'=>['id','name','slug','price','currency','billing_interval','is_active','sort_order'],
            'fields'=>[
                'name'=>['label'=>'Nome','type'=>'text','rules'=>'required|string|max:190'],
                'slug'=>['label'=>'Slug','type'=>'text','rules'=>'required|string|max:190'],
                'description'=>['label'=>'Descrição','type'=>'textarea','rules'=>'nullable|string'],
                'price'=>['label'=>'Preço','type'=>'number','step'=>'0.01','rules'=>'required|numeric|min:0'],
                'currency'=>['label'=>'Moeda','type'=>'text','rules'=>'required|string|size:3'],
                'billing_interval'=>['label'=>'Intervalo','type'=>'select','options'=>$statuses(['monthly','yearly','weekly','daily']),'rules'=>'required|string'],
                'billing_interval_count'=>['label'=>'Quantidade do intervalo','type'=>'number','rules'=>'required|integer|min:1'],
                'features'=>['label'=>'Recursos (JSON)','type'=>'json','rules'=>'nullable'],
                'is_active'=>['label'=>'Ativo','type'=>'boolean','rules'=>'boolean'],
                'sort_order'=>['label'=>'Ordem','type'=>'number','rules'=>'required|integer|min:0'],
            ],
        ],
        'subscriptions' => [
            'label'=>'Assinaturas','singular'=>'Assinatura','model'=>UserSubscription::class,'search'=>['provider','provider_customer_id','provider_subscription_id','status'],'columns'=>['id','user_id','subscription_plan_id','provider','status','starts_at','current_period_ends_at'],
            'fields'=>[
                'user_id'=>['label'=>'Usuário','type'=>'relation','model'=>User::class,'option'=>'email','rules'=>'required|exists:users,id'],
                'subscription_plan_id'=>['label'=>'Plano','type'=>'relation','model'=>SubscriptionPlan::class,'option'=>'name','rules'=>'required|exists:subscription_plans,id'],
                'provider'=>['label'=>'Provider','type'=>'text','rules'=>'nullable|string|max:100'],
                'provider_customer_id'=>['label'=>'Customer ID','type'=>'text','rules'=>'nullable|string|max:190'],
                'provider_subscription_id'=>['label'=>'Subscription ID','type'=>'text','rules'=>'nullable|string|max:190'],
                'status'=>['label'=>'Status','type'=>'select','options'=>$statuses(['pending','trialing','active','past_due','canceled','expired']),'rules'=>'required|string'],
                'starts_at'=>['label'=>'Início','type'=>'datetime','rules'=>'nullable|date'],
                'trial_ends_at'=>['label'=>'Fim trial','type'=>'datetime','rules'=>'nullable|date'],
                'current_period_starts_at'=>['label'=>'Início período','type'=>'datetime','rules'=>'nullable|date'],
                'current_period_ends_at'=>['label'=>'Fim período','type'=>'datetime','rules'=>'nullable|date'],
                'canceled_at'=>['label'=>'Cancelada em','type'=>'datetime','rules'=>'nullable|date'],
                'ends_at'=>['label'=>'Encerra em','type'=>'datetime','rules'=>'nullable|date'],
                'metadata'=>['label'=>'Metadados (JSON)','type'=>'json','rules'=>'nullable'],
            ],
        ],
        'transactions' => [
            'label'=>'Transações','singular'=>'Transação','model'=>PaymentTransaction::class,'search'=>['provider','provider_transaction_id','type','status'],'columns'=>['id','user_id','user_subscription_id','provider','type','status','amount','currency','processed_at'],
            'fields'=>[
                'user_id'=>['label'=>'Usuário','type'=>'relation','model'=>User::class,'option'=>'email','rules'=>'required|exists:users,id'],
                'user_subscription_id'=>['label'=>'Assinatura','type'=>'relation','model'=>UserSubscription::class,'option'=>'id','nullable'=>true,'rules'=>'nullable|exists:user_subscriptions,id'],
                'provider'=>['label'=>'Provider','type'=>'text','rules'=>'required|string|max:100'],
                'provider_transaction_id'=>['label'=>'Transaction ID','type'=>'text','rules'=>'nullable|string|max:190'],
                'type'=>['label'=>'Tipo','type'=>'text','rules'=>'required|string|max:100'],
                'status'=>['label'=>'Status','type'=>'select','options'=>$statuses(['pending','paid','failed','refunded','canceled']),'rules'=>'required|string'],
                'amount'=>['label'=>'Valor','type'=>'number','step'=>'0.01','rules'=>'required|numeric|min:0'],
                'currency'=>['label'=>'Moeda','type'=>'text','rules'=>'required|string|size:3'],
                'failure_reason'=>['label'=>'Falha','type'=>'textarea','rules'=>'nullable|string'],
                'processed_at'=>['label'=>'Processada em','type'=>'datetime','rules'=>'nullable|date'],
                'metadata'=>['label'=>'Metadados (JSON)','type'=>'json','rules'=>'nullable'],
            ],
        ],
    ],
];
