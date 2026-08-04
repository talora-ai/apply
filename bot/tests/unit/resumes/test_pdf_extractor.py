import pymupdf
import pytest

from app.core.exceptions import BotError
from app.modules.resumes.extractors.pdf import PdfResumeExtractor


def test_rejects_a_pdf_without_readable_text() -> None:
    document = pymupdf.open()
    document.new_page()
    content = document.tobytes()
    document.close()

    with pytest.raises(BotError) as captured:
        PdfResumeExtractor(max_pages=50).extract(content)

    assert captured.value.code == "EMPTY_DOCUMENT"
