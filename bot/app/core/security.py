import re
import time
from dataclasses import dataclass
from functools import lru_cache
from hashlib import sha256
from hmac import compare_digest
from hmac import new as new_hmac
from threading import Lock
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.exceptions import BotError

bearer = HTTPBearer(auto_error=False)
HEX_64 = re.compile(r"^[a-f0-9]{64}$")


@dataclass(frozen=True, slots=True)
class BackendRequestContext:
    processing_id: str
    timestamp: str
    nonce: str
    content_sha256: str
    signature: str
    signing_secret: str

    def verify_content(self, content: bytes, nonce_store: "NonceStore") -> str:
        digest = sha256(content).hexdigest()
        if not compare_digest(digest, self.content_sha256):
            raise BotError("CONTENT_INTEGRITY_FAILED", "Invalid request integrity.", 401)

        canonical = "\n".join([self.timestamp, self.nonce, self.processing_id, self.content_sha256])
        expected = new_hmac(
            self.signing_secret.encode(),
            canonical.encode(),
            sha256,
        ).hexdigest()

        if not compare_digest(expected, self.signature):
            raise BotError("INVALID_SIGNATURE", "Invalid request signature.", 401)

        nonce_store.consume(self.nonce, int(self.timestamp))
        return digest


class NonceStore:
    """Rejects replay on one Bot instance; use a shared Redis store when horizontally scaled."""

    def __init__(self) -> None:
        self._used: dict[str, int] = {}
        self._lock = Lock()

    def consume(self, nonce: str, timestamp: int) -> None:
        now = int(time.time())
        with self._lock:
            self._used = {value: expiry for value, expiry in self._used.items() if expiry >= now}
            if nonce in self._used:
                raise BotError("REPLAY_DETECTED", "The request was already processed.", 409)
            self._used[nonce] = timestamp + 300


@lru_cache
def get_nonce_store() -> NonceStore:
    return NonceStore()


async def authenticate_backend(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    settings: Annotated[Settings, Depends(get_settings)],
    processing_id: Annotated[str | None, Header(alias="X-Talora-Processing-Id")] = None,
    timestamp: Annotated[str | None, Header(alias="X-Talora-Timestamp")] = None,
    nonce: Annotated[str | None, Header(alias="X-Talora-Nonce")] = None,
    content_sha256: Annotated[str | None, Header(alias="X-Talora-Content-SHA256")] = None,
    signature: Annotated[str | None, Header(alias="X-Talora-Signature")] = None,
) -> BackendRequestContext:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise BotError("UNAUTHORIZED", "Invalid service credentials.", 401)

    if not compare_digest(credentials.credentials, settings.bot_service_token):
        raise BotError("UNAUTHORIZED", "Invalid service credentials.", 401)

    if (
        processing_id is None
        or timestamp is None
        or nonce is None
        or content_sha256 is None
        or signature is None
    ):
        raise BotError("INVALID_SIGNATURE", "Missing request signature.", 401)

    try:
        UUID(processing_id)
        UUID(nonce)
        timestamp_value = int(timestamp)
    except (TypeError, ValueError, AttributeError) as exception:
        raise BotError("INVALID_SIGNATURE", "Invalid request signature.", 401) from exception

    if abs(int(time.time()) - timestamp_value) > settings.signature_max_age_seconds:
        raise BotError("EXPIRED_SIGNATURE", "The request signature has expired.", 401)

    if not HEX_64.fullmatch(content_sha256) or not HEX_64.fullmatch(signature):
        raise BotError("INVALID_SIGNATURE", "Invalid request signature.", 401)

    return BackendRequestContext(
        processing_id=processing_id,
        timestamp=timestamp,
        nonce=nonce,
        content_sha256=content_sha256,
        signature=signature,
        signing_secret=settings.bot_signing_secret,
    )
