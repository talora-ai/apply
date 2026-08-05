import os
import time
from collections.abc import Callable, Generator
from hashlib import sha256
from hmac import new as new_hmac
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("BOT_SERVICE_TOKEN", "test-service-token-123456789")
os.environ.setdefault("BOT_SIGNING_SECRET", "test-signing-secret-123456789012345")

from app.core.config import get_settings
from app.core.security import get_nonce_store
from app.main import app


@pytest.fixture(autouse=True)
def clear_settings_cache() -> Generator[None, None, None]:
    get_settings.cache_clear()
    get_nonce_store.cache_clear()
    yield
    get_settings.cache_clear()
    get_nonce_store.cache_clear()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def auth_headers() -> Callable[..., dict[str, str]]:
    def create(
        content: bytes,
        *,
        processing_id: str | None = None,
        nonce: str | None = None,
        timestamp: int | None = None,
        token: str = "test-service-token-123456789",
        signing_secret: str = "test-signing-secret-123456789012345",
    ) -> dict[str, str]:
        processing_id = processing_id or str(uuid4())
        nonce = nonce or str(uuid4())
        timestamp_value = timestamp or int(time.time())
        digest = sha256(content).hexdigest()
        canonical = "\n".join([str(timestamp_value), nonce, processing_id, digest])
        signature = new_hmac(signing_secret.encode(), canonical.encode(), sha256).hexdigest()

        return {
            "Authorization": f"Bearer {token}",
            "X-Talora-Processing-Id": processing_id,
            "X-Talora-Timestamp": str(timestamp_value),
            "X-Talora-Nonce": nonce,
            "X-Talora-Content-SHA256": digest,
            "X-Talora-Signature": signature,
        }

    return create
