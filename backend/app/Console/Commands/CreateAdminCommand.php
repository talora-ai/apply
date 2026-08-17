<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;

final class CreateAdminCommand extends Command
{
    protected $signature = 'admin:create {email?} {--name=} {--password=}';
    protected $description = 'Cria ou atualiza um administrador do Talora Apply.';

    public function handle(): int
    {
        $email = (string) ($this->argument('email') ?: $this->ask('E-mail'));
        $name = (string) ($this->option('name') ?: $this->ask('Nome', 'Talora Admin'));
        $password = (string) ($this->option('password') ?: $this->secret('Senha'));

        if ($email === '' || $password === '') {
            $this->error('E-mail e senha são obrigatórios.');
            return self::FAILURE;
        }

        Admin::query()->updateOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => $password, 'is_active' => true],
        );

        $this->info('Administrador criado/atualizado com sucesso.');
        return self::SUCCESS;
    }
}
