from fastapi import FastAPI

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.modules.resumes.api.router import router as resumes_router


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/docs" if settings.app_env != "production" else None,
        redoc_url=None,
    )

    register_exception_handlers(application)
    application.include_router(resumes_router, prefix="/api/v1")

    @application.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {
            "status": "healthy",
            "service": "talora-apply-bot",
        }

    return application


app = create_app()
