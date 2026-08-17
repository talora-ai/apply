# Compatibilidade de vagas em tempo de execução

A compatibilidade entre currículo e vaga não é mais um dado persistido.

## Currículo principal

O upload não define um currículo como principal. Depois que o BOT concluir o processamento (`completed`), o usuário escolhe explicitamente o CV principal na tela **Meus currículos**.

Endpoint:

```http
PATCH /api/client/user/resumes/{resume}/primary
```

Somente currículos processados pertencentes ao usuário podem ser selecionados. A troca é transacional e mantém no máximo um currículo principal.

## Compatibilidade

`RuntimeJobCompatibilityService` compara a vaga com o currículo principal no momento em que o backend monta a resposta. O resultado não é salvo.

As respostas de Dashboard, Vagas, Favoritos, Candidaturas e Analytics usam o currículo principal atual. Ao trocar de currículo, a próxima consulta recalcula os resultados automaticamente.

O payload inclui `compatibility_model` (`runtime-v1`) para identificar o comparador que produziu o resultado. Esse contrato permite substituir o comparador por Talora AI futuramente sem migrar ou invalidar scores históricos.

## Persistência removida

A migration `2026_08_16_230000_remove_persisted_job_compatibility.php` remove:

- `job_compatibility_analyses`;
- `job_applications.compatibility_score`.

Após atualizar uma instalação existente, execute:

```bash
php artisan migrate
```

O score exibido em uma candidatura representa a compatibilidade **atual** da vaga com o CV principal atual, e não o score existente no momento em que a candidatura foi realizada.
