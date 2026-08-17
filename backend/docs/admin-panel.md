# Talora Apply Admin

O painel administrativo usa **Blade**, tabela `admins` e guard `admin`, totalmente separado do login/API dos usuários.

## Instalação

Como `composer.lock` precisa ser resolvido no seu ambiente, execute após atualizar o código:

```bash
cd backend
composer update laravel/horizon laravel/pulse --with-all-dependencies
php artisan talora:install-monitoring
php artisan migrate
php artisan admin:create admin@talora.local
```

Acesse `/admin/login`.

## Monitoramento

O Laravel Horizon exige Redis para as filas. O `.env.example` já aponta `QUEUE_CONNECTION=redis` e `CACHE_STORE=redis`. Inicie:

```bash
php artisan horizon
```

O Laravel Pulse registra desempenho, requisições/queries lentas, exceções, filas e uso. Para o card de servidores:

```bash
php artisan pulse:check
```

Pulse first-party requer MySQL, MariaDB ou PostgreSQL para armazenamento. Se o projeto usar SQLite localmente, configure uma conexão compatível para `PULSE_DB_CONNECTION`.

O comando `talora:install-monitoring` publica os arquivos de Horizon/Pulse e injeta `auth:admin` nos middlewares dos dashboards. Os gates `viewHorizon` e `viewPulse` também aceitam apenas administradores ativos.

## CRUD disponível

O painel possui CRUD para:

- Administradores e usuários;
- Currículos e análises;
- Empresas, fontes e vagas;
- Candidaturas, eventos e favoritos;
- Planos, assinaturas e transações.

Currículos criados pelo painel passam pelo mesmo `StoreUserResumeAction`, criptografia e fila de processamento usados pelo cliente. A exclusão também remove o arquivo do storage e promove outro currículo processado caso o principal seja apagado.

## Central operacional

`/admin/monitoring` mostra Redis, driver de filas, jobs falhos, fila database de fallback e atalhos para Pulse/Horizon. Jobs falhos podem ser reprocessados ou removidos pelo painel.
