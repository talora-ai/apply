from dataclasses import dataclass

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


@dataclass(slots=True)
class BotError(Exception):
    code: str
    message: str
    status_code: int


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(BotError)
    async def handle_bot_error(_request: Request, exception: BotError) -> JSONResponse:
        return JSONResponse(
            status_code=exception.status_code,
            content={
                "error": {
                    "code": exception.code,
                    "message": exception.message,
                }
            },
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_request: Request, _exception: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "The resume could not be processed.",
                }
            },
        )
