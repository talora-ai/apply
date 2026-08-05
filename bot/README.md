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
BOT_SIGNING_SECRET=outro-segredo-aleatorio-independente
SIGNATURE_MAX_AGE_SECONDS=60
```

No Backend local:

```env
BOT_URL=http://localhost:9000
```

Em Docker Compose:

```env
BOT_URL=http://bot:9000
```

O Bot usa `127.0.0.1` por padrão. Em containers, defina `APP_HOST=0.0.0.0`
somente dentro de uma rede privada e não publique a porta `9000` na internet.

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
X-Talora-Processing-Id: {UUID}
X-Talora-Timestamp: {UNIX_TIMESTAMP}
X-Talora-Nonce: {UUID}
X-Talora-Content-SHA256: {SHA256}
X-Talora-Signature: {HMAC_SHA256}
Content-Type: multipart/form-data
```

Campo multipart: `file`.

O Bot aceita PDF e DOCX, limita o arquivo a 10 MB, não persiste o documento e
não registra seu conteúdo em logs. A resposta usa o schema `1.4`, confirma o
`processing_id` e o SHA-256 do documento, e entrega:

- competências únicas detectadas no documento inteiro;
- experiências agrupadas por cargo, empresa, período e descrição;
- idiomas em objetos com nome e proficiência;
- formação e certificações separadas;
- projetos agrupados em objetos, com os itens `•` dentro de `description`;
- texto integral para auditoria e futura análise por IA.
- diagnóstico ATS separado, com `ats_friendly`, tipo de layout, qualidade da
  extração, códigos de motivo e métricas do documento.

O Bot não tenta descobrir se o arquivo foi produzido no Canva. Essa origem não é
confiável em todos os PDFs. Em vez disso, diagnostica características objetivas,
como múltiplas colunas, texto convertido em imagem e ordem de leitura ambígua.

O arquivo permanece criptografado no storage e é descriptografado somente pelo
Backend em um stream de memória. O Bot nunca recebe a chave. Antes de analisar,
ele valida a autenticação de serviço, a assinatura, a integridade do conteúdo,
a validade temporal e o nonce contra replay.

O armazenamento de nonce atual protege uma única instância. Antes de escalar o
Bot horizontalmente, ele deve ser substituído por Redis com TTL compartilhado
entre as réplicas.

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
