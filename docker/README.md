# Talora Apply - ambiente Docker

O Docker Compose cobre **somente as aplicações servidoras do Talora Apply** e a infraestrutura necessária para executá-las:

- Backend Laravel + painel Admin
- Frontend Next.js
- Talora BOT / FastAPI
- PostgreSQL 16
- Redis 7
- Laravel Horizon
- Laravel Scheduler
- Laravel Pulse (`pulse:check`)
- Mailpit

> O aplicativo **mobile Expo/React Native não faz parte do Docker Compose**. Ele continua independente e deve ser instalado, executado e compilado pelo fluxo próprio do Expo/EAS.

## Primeiro uso

Na raiz do projeto:

```bash
./docker/talora init
```

Ou:

```bash
make init
```

O comando:

1. cria `.env.docker` a partir de `.env.docker.example`;
2. gera `APP_KEY`;
3. gera as duas chaves permanentes de criptografia dos currículos;
4. gera `BOT_SERVICE_TOKEN` e `BOT_SIGNING_SECRET`;
5. constrói as imagens do Backend, Frontend e BOT;
6. aguarda PostgreSQL, Redis e BOT ficarem saudáveis;
7. configura Pulse/Horizon;
8. executa as migrations;
9. cria/atualiza o administrador configurado em `.env.docker`;
10. inicia Laravel API/Admin, Horizon, Scheduler, Pulse check, Next.js, BOT e os serviços de infraestrutura.

As chaves de currículo ficam persistidas em `.env.docker`. Não as regenere se houver currículos criptografados que precisem continuar legíveis.

## Serviços do Compose

```text
postgres
redis
mailpit
bot
backend-init
backend
horizon
scheduler
pulse-check
frontend
```

`backend`, `horizon`, `scheduler` e `pulse-check` usam a mesma imagem Laravel. Eles são processos separados para facilitar supervisão, restart e logs.

## URLs

| Serviço | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Admin | http://localhost:8000/admin/login |
| Horizon | http://localhost:8000/horizon |
| Pulse | http://localhost:8000/pulse |
| Mailpit | http://localhost:8025 |
| BOT Swagger | http://localhost:9000/docs |

## Currículos / Horizon

O Horizon possui supervisors separados:

- `supervisor-default` -> `default`;
- `supervisor-resumes` -> `resume-processing`.

Assim, os jobs `ProcessUserResumeJob` enviados para `resume-processing` são efetivamente consumidos pelo Horizon.

Para acompanhar:

```bash
./docker/talora horizon
```

ou:

```bash
./docker/talora artisan horizon:status
```

## Comandos úteis

```bash
./docker/talora init
./docker/talora up
./docker/talora down
./docker/talora restart
./docker/talora ps
./docker/talora logs
./docker/talora logs backend
./docker/talora logs frontend
./docker/talora logs bot
./docker/talora backend
./docker/talora artisan migrate:status
./docker/talora artisan queue:failed
./docker/talora artisan horizon:status
./docker/talora npm run build
```

Também estão disponíveis os atalhos do `Makefile`:

```bash
make init
make up
make down
make restart
make ps
make logs
make horizon
make build
```

## Mobile fora do Docker

A pasta `mobile/` permanece no repositório, mas nenhum serviço, volume, porta ou Dockerfile de mobile é utilizado pelo Compose.

Para desenvolvimento do aplicativo, execute-o diretamente pelo Node/Expo no host, conforme o README do próprio mobile. A API deverá apontar para uma URL acessível pelo emulador/aparelho.

O `MOBILE_URL` presente no ambiente do backend **não inicia o mobile**: ele é apenas o deep link usado pelo Laravel em fluxos como recuperação de senha. O padrão no Docker é:

```env
MOBILE_URL=talora-apply://
```

## Reset total local

```bash
./docker/talora reset
```

Esse comando remove os volumes Docker de PostgreSQL, Redis, storage privado e dependências. O `.env.docker` não é apagado para preservar as chaves de criptografia.

## Produção

Este Compose é orientado ao desenvolvimento. Em produção, não use `artisan serve`, não exponha PostgreSQL/Redis, configure TLS/reverse proxy, secrets externos, imagens imutáveis e supervisão adequada dos processos.

## BOT / uv

The BOT image installs its Python dependencies from `uv.lock` during build using
`uv sync --frozen --no-dev --no-install-project`. The local project is not
installed as a package because Uvicorn imports `app.main` directly from the
container working directory. Runtime uses `uv run --no-sync` so container startup
does not modify the locked environment.
