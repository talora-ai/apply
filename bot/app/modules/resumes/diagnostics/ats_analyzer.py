from io import BytesIO
from itertools import pairwise
from typing import Any
from zipfile import ZipFile

import pymupdf

from app.modules.resumes.schemas.response import AtsDiagnosticData


class AtsAnalyzer:
    def analyze(self, content: bytes, suffix: str) -> AtsDiagnosticData:
        if suffix == ".pdf":
            return PdfAtsAnalyzer().analyze(content)
        if suffix == ".docx":
            return DocxAtsAnalyzer().analyze(content)

        return AtsDiagnosticData(
            ats_friendly=False,
            confidence=1.0,
            layout_type="unsupported",
            extraction_quality="unavailable",
            reason_codes=["unsupported_file_type"],
            metrics={},
        )


class PdfAtsAnalyzer:
    def analyze(self, content: bytes) -> AtsDiagnosticData:
        document: Any = pymupdf.open(  # type: ignore[no-untyped-call]
            stream=content,
            filetype="pdf",
        )

        try:
            blocks_count = 0
            images_count = 0
            drawings_count = 0
            selectable_characters = 0
            multi_column_pages = 0

            for page in document:
                blocks = [
                    block
                    for block in page.get_text("blocks")
                    if len(block) >= 5 and str(block[4]).strip()
                ]
                text = "".join(str(block[4]) for block in blocks)
                words = page.get_text("words")
                blocks_count += len(blocks)
                selectable_characters += len(text.strip())
                images_count += len(page.get_images(full=True))
                drawings_count += len(page.get_drawings())

                if self._has_multiple_columns(blocks, words, float(page.rect.width)):
                    multi_column_pages += 1

            pages = max(int(document.page_count), 1)
            average_characters = selectable_characters // pages
            image_only = selectable_characters < 20 * pages
            multi_column = multi_column_pages > 0
            high_visual_density = drawings_count > 20 * pages or images_count > 2 * pages

            if image_only:
                return AtsDiagnosticData(
                    ats_friendly=False,
                    confidence=0.99,
                    layout_type="image_based",
                    extraction_quality="unavailable",
                    reason_codes=["insufficient_selectable_text", "ocr_required"],
                    metrics=self._metrics(
                        blocks_count,
                        images_count,
                        drawings_count,
                        selectable_characters,
                        multi_column_pages,
                    ),
                )

            if multi_column:
                reasons = ["multi_column_layout", "ambiguous_reading_order"]
                if high_visual_density:
                    reasons.append("high_visual_density")
                if images_count:
                    reasons.append("contains_images")

                return AtsDiagnosticData(
                    ats_friendly=False,
                    confidence=0.96,
                    layout_type="multi_column",
                    extraction_quality="partial" if average_characters >= 300 else "low",
                    reason_codes=reasons,
                    metrics=self._metrics(
                        blocks_count,
                        images_count,
                        drawings_count,
                        selectable_characters,
                        multi_column_pages,
                    ),
                )

            reasons = ["selectable_text", "single_column_reading_order"]
            if images_count:
                reasons.append("contains_images")

            return AtsDiagnosticData(
                ats_friendly=True,
                confidence=0.9,
                layout_type="single_column",
                extraction_quality="high" if average_characters >= 300 else "medium",
                reason_codes=reasons,
                metrics=self._metrics(
                    blocks_count,
                    images_count,
                    drawings_count,
                    selectable_characters,
                    multi_column_pages,
                ),
            )
        finally:
            document.close()

    @staticmethod
    def _has_multiple_columns(
        blocks: list[Any],
        words: list[Any],
        page_width: float,
    ) -> bool:
        substantial = [block for block in blocks if len(str(block[4]).strip()) >= 12]
        left = [block for block in substantial if float(block[2]) <= page_width * 0.38]
        right = [block for block in substantial if float(block[0]) >= page_width * 0.32]

        if len(left) >= 4 and len(right) >= 4:
            return True

        lines: dict[int, list[Any]] = {}
        for word in words:
            line_key = round(float(word[1]) / 6)
            lines.setdefault(line_key, []).append(word)

        separated_lines = 0
        for line_words in lines.values():
            ordered = sorted(line_words, key=lambda word: float(word[0]))
            gaps = [
                float(current[0]) - float(previous[2]) for previous, current in pairwise(ordered)
            ]
            if gaps and max(gaps) >= page_width * 0.18:
                separated_lines += 1

        return separated_lines >= 4

    @staticmethod
    def _metrics(
        blocks_count: int,
        images_count: int,
        drawings_count: int,
        selectable_characters: int,
        multi_column_pages: int,
    ) -> dict[str, int | float | bool | str | None]:
        return {
            "text_blocks": blocks_count,
            "images": images_count,
            "drawings": drawings_count,
            "selectable_characters": selectable_characters,
            "multi_column_pages": multi_column_pages,
        }


class DocxAtsAnalyzer:
    def analyze(self, content: bytes) -> AtsDiagnosticData:
        with ZipFile(BytesIO(content)) as archive:
            document_xml = archive.read("word/document.xml")
            table_count = document_xml.count(b"<w:tbl>")
            paragraph_count = document_xml.count(b"<w:p")

        complex_tables = table_count > 2
        reason_codes = ["editable_text", "linear_document_structure"]
        if table_count:
            reason_codes.append("contains_tables")
        if complex_tables:
            reason_codes.append("complex_table_layout")

        return AtsDiagnosticData(
            ats_friendly=not complex_tables,
            confidence=0.9,
            layout_type="complex_tables" if complex_tables else "document_flow",
            extraction_quality="medium" if complex_tables else "high",
            reason_codes=reason_codes,
            metrics={
                "paragraphs": paragraph_count,
                "tables": table_count,
            },
        )
