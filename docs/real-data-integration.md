# Integração de dados reais — Talora Apply

Nesta revisão, os placeholders e dados de demonstração das áreas autenticadas foram removidos. As telas passam a refletir exclusivamente o estado atual do backend.

## Endpoints adicionados

Todos exigem `auth:sanctum` e usam o prefixo `/api/client` conforme a configuração da aplicação:

- `GET /client/dashboard`
- `GET /client/jobs?q=`
- `GET /client/applications`
- `GET /client/favorites`
- `POST /client/jobs/{job}/favorite`
- `DELETE /client/jobs/{job}/favorite`
- `GET /client/analytics`
- `GET /client/billing`

Os endpoints existentes de usuário e currículos continuam sendo usados normalmente.

## Regra de interface

Quando não houver registros no banco, web e mobile exibem estado vazio real (`0`, `—` ou mensagem de ausência de dados). Nenhuma empresa, vaga, score, candidatura, plano ou skill fictícia é criada no frontend.

## Dashboard

O bloco Talora AI foi ocultado tanto no frontend web quanto no mobile. O componente web foi mantido no código, sem uso, para permitir reativação futura.

## Mobile

Rotas antigas que continham uma dashboard mockada foram removidas. A área protegida atual consome os mesmos endpoints reais usados pelo frontend.
