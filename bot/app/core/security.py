from hmac import compare_digest
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.exceptions import BotError

bearer = HTTPBearer(auto_error=False)


async def authenticate_backend(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise BotError("UNAUTHORIZED", "Invalid service credentials.", 401)

    if not compare_digest(credentials.credentials, settings.bot_service_token):
        raise BotError("UNAUTHORIZED", "Invalid service credentials.", 401)
