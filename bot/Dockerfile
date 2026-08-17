FROM ghcr.io/astral-sh/uv:latest AS uv

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

COPY --from=uv /uv /uvx /bin/

# Copy dependency metadata first to keep this layer cacheable.
# README.md is part of the project metadata declared in pyproject.toml.
COPY pyproject.toml uv.lock README.md ./

# Install only runtime dependencies here. The BOT is executed directly from
# /app, so installing the local project itself is unnecessary.
RUN uv sync --frozen --no-dev --no-install-project

COPY app ./app

EXPOSE 9000

CMD ["uv", "run", "--no-sync", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000"]
