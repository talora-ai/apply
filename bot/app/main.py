from hmac import compare_digest

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.modules.resumes.api.router import router as resumes_router


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version="0.2.0",
        docs_url="/docs" if settings.app_env != "production" else None,
        redoc_url=None,
    )

    register_exception_handlers(application)
    application.include_router(resumes_router, prefix="/api/v1")

    @application.middleware("http")
    async def secure_internal_requests(request: Request, call_next):  # type: ignore[no-untyped-def]
        if request.url.path == "/api/v1/resumes/extract":
            authorization = request.headers.get("authorization", "")
            expected = f"Bearer {settings.bot_service_token}"
            if not compare_digest(authorization, expected):
                return JSONResponse(
                    status_code=401,
                    content={
                        "error": {
                            "code": "UNAUTHORIZED",
                            "message": "Invalid service credentials.",
                        }
                    },
                    headers={"Cache-Control": "no-store"},
                )

        response = await call_next(request)
        if request.url.path.startswith("/api/v1/resumes"):
            response.headers["Cache-Control"] = "no-store"
            response.headers["Pragma"] = "no-cache"
        return response

    @application.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {
            "status": "healthy",
            "service": "talora-apply-bot",
        }

    return application


app = create_app()
