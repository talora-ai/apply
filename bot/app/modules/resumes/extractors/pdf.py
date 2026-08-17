from typing import Any

import pymupdf

from app.core.exceptions import BotError
from app.modules.resumes.extractors.base import ExtractedDocument


class PdfResumeExtractor:
    def __init__(self, max_pages: int) -> None:
        self.max_pages = max_pages

    def extract(self, content: bytes) -> ExtractedDocument:
        try:
            document: Any = pymupdf.open(stream=content, filetype="pdf")  # type: ignore[no-untyped-call]
        except Exception as exception:
            raise BotError("INVALID_PDF", "The PDF file is invalid.", 422) from exception

        try:
            if document.needs_pass:
                raise BotError("ENCRYPTED_PDF", "Encrypted PDF files are not supported.", 422)

            if document.page_count > self.max_pages:
                raise BotError("PDF_PAGE_LIMIT", "The PDF exceeds the page limit.", 422)

            pages: list[str] = []
            layout_modes: list[str] = []
            for page in document:
                text, layout_mode = self._extract_page(page)
                if text:
                    pages.append(text)
                layout_modes.append(layout_mode)

            full_text = "\n\n".join(pages).strip()
            if not full_text:
                raise BotError("EMPTY_DOCUMENT", "No readable text was found in the resume.", 422)

            return ExtractedDocument(
                full_text=full_text,
                mime_type="application/pdf",
                page_count=document.page_count,
                metadata={
                    "encrypted": False,
                    "layout_aware_extraction": True,
                    "layout_modes": ",".join(layout_modes),
                },
            )
        finally:
            document.close()

    def _extract_page(self, page: Any) -> tuple[str, str]:
        blocks = [
            block
            for block in page.get_text("blocks")
            if len(block) >= 5 and str(block[4]).strip()
        ]
        page_width = float(page.rect.width)
        left = [block for block in blocks if float(block[2]) <= page_width * 0.38]
        right = [block for block in blocks if float(block[0]) >= page_width * 0.32]

        # Sidebar-style resumes are common: a narrow left column plus a wide main column.
        # Reading each column independently prevents PyMuPDF from interleaving unrelated lines.
        if len(left) >= 4 and len(right) >= 4:
            left_width = max((float(block[2]) for block in left), default=0.0)
            right_start = min((float(block[0]) for block in right), default=page_width)
            narrow_sidebar = left_width <= page_width * 0.42 and right_start >= page_width * 0.30

            primary = right if narrow_sidebar else left
            secondary = left if narrow_sidebar else right
            ordered = [*self._ordered_column(primary), *self._ordered_column(secondary)]
            return "\n".join(ordered).strip(), "multi_column"

        return page.get_text("text", sort=True).strip(), "single_column"

    @staticmethod
    def _ordered_column(blocks: list[Any]) -> list[str]:
        lines: list[str] = []
        for block in sorted(blocks, key=lambda value: (float(value[1]), float(value[0]))):
            for raw_line in str(block[4]).splitlines():
                line = raw_line.strip()
                if line:
                    lines.append(line)
        return lines
