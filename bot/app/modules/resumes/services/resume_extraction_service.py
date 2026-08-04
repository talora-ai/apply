from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import BotError
from app.modules.resumes.extractors.base import ExtractedDocument
from app.modules.resumes.extractors.docx import DocxResumeExtractor
from app.modules.resumes.extractors.pdf import PdfResumeExtractor
from app.modules.resumes.schemas.response import (
    DocumentData,
    ResumeContent,
    ResumeExtractionResponse,
)
from app.modules.resumes.services.section_parser import ResumeSectionParser


class ResumeExtractionService:
    async def extract(self, file: UploadFile) -> ResumeExtractionResponse:
        settings = get_settings()
        content = await file.read(settings.max_file_size_bytes + 1)
        await file.close()

        if not content:
            raise BotError("EMPTY_FILE", "The uploaded file is empty.", 422)

        if len(content) > settings.max_file_size_bytes:
            raise BotError("FILE_SIZE_LIMIT", "The resume exceeds the 10 MB limit.", 413)

        suffix = Path(file.filename or "").suffix.casefold()
        extracted = self._extract_document(content, suffix)

        return ResumeExtractionResponse(
            document=DocumentData(
                filename=Path(file.filename or "resume").name,
                mime_type=extracted.mime_type,
                page_count=extracted.page_count,
                character_count=len(extracted.full_text),
                metadata=extracted.metadata,
            ),
            content=ResumeContent(
                full_text=extracted.full_text,
                sections=ResumeSectionParser().parse(extracted.full_text),
            ),
        )

    @staticmethod
    def _extract_document(content: bytes, suffix: str) -> ExtractedDocument:
        settings = get_settings()

        if content.startswith(b"%PDF-") and suffix == ".pdf":
            return PdfResumeExtractor(settings.max_pdf_pages).extract(content)

        if content.startswith(b"PK") and suffix == ".docx":
            return DocxResumeExtractor(settings.max_docx_uncompressed_bytes).extract(content)

        raise BotError(
            "UNSUPPORTED_FILE_TYPE",
            "Only valid PDF and DOCX files are supported.",
            422,
        )
