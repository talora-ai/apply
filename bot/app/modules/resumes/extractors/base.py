from dataclasses import dataclass, field
from typing import Protocol


@dataclass(frozen=True, slots=True)
class ExtractedDocument:
    full_text: str
    mime_type: str
    page_count: int | None = None
    metadata: dict[str, str | int | bool | None] = field(default_factory=dict)


class ResumeExtractor(Protocol):
    def extract(self, content: bytes) -> ExtractedDocument: ...
