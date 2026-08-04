# Talora Apply Bot

Serviço interno responsável pelo processamento de currículos e, futuramente,
pela busca e extração de vagas.

## Portas do ecossistema

| Serviço | Porta |
| --- | ---: |
| Frontend | 3000 |
| Backend | 8000 |
| Bot | 9000 |

## Instalação

```bash
cp .env.example .env
uv sync
```

Gere um token compartilhado entre Backend e Bot:

```bash
openssl rand -hex 32
```

Defina o mesmo valor em `bot/.env` e `backend/.env`:

```env
BOT_SERVICE_TOKEN=token-gerado
```

No Backend local:

```env
BOT_URL=http://localhost:9000
```

Em Docker Compose:

```env
BOT_URL=http://bot:9000
```

## Desenvolvimento

```bash
uv run fastapi dev app/main.py --port 9000
```

Ou:

```bash
uv run uvicorn app.main:app --reload --port 9000
```

Documentação: `http://localhost:9000/docs`

## Endpoints

### Health check

```http
GET /health
```

### Extração de currículo

```http
POST /api/v1/resumes/extract
Authorization: Bearer {BOT_SERVICE_TOKEN}
Content-Type: multipart/form-data
```

Campo multipart: `file`.

O Bot aceita PDF e DOCX, limita o arquivo a 10 MB, não persiste o documento e
não registra seu conteúdo em logs. A resposta usa o schema `1.2` e entrega:

- competências únicas detectadas no documento inteiro;
- experiências agrupadas por cargo, empresa, período e descrição;
- idiomas em objetos com nome e proficiência;
- formação e certificações separadas;
- projetos agrupados em objetos, com os itens `•` dentro de `description`;
- texto integral para auditoria e futura análise por IA.

## Qualidade

```bash
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy app
```

## Limite desta entrega

Este módulo extrai e organiza o conteúdo do currículo. Pontuação, recomendações
e análise generativa serão executadas posteriormente pelo Job de IA do Backend.
