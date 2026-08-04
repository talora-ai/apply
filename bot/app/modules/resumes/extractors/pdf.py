from typing import Any

import pymupdf

from app.core.exceptions import BotError
from app.modules.resumes.extractors.base import ExtractedDocument


class PdfResumeExtractor:
    def __init__(self, max_pages: int) -> None:
        self.max_pages = max_pages

    def extract(self, content: bytes) -> ExtractedDocument:
        try:
            document: Any = pymupdf.open(  # type: ignore[no-untyped-call]
                stream=content,
                filetype="pdf",
            )
        except Exception as exception:
            raise BotError("INVALID_PDF", "The PDF file is invalid.", 422) from exception

        try:
            if document.needs_pass:
                raise BotError("ENCRYPTED_PDF", "Encrypted PDF files are not supported.", 422)

            if document.page_count > self.max_pages:
                raise BotError("PDF_PAGE_LIMIT", "The PDF exceeds the page limit.", 422)

            pages = [page.get_text("text", sort=True).strip() for page in document]
            full_text = "\n\n".join(page for page in pages if page).strip()

            if not full_text:
                raise BotError("EMPTY_DOCUMENT", "No readable text was found in the resume.", 422)

            return ExtractedDocument(
                full_text=full_text,
                mime_type="application/pdf",
                page_count=document.page_count,
                metadata={
                    "encrypted": False,
                },
            )
        finally:
            document.close()
