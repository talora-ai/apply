import pymupdf

from app.modules.resumes.diagnostics.ats_analyzer import PdfAtsAnalyzer


def create_two_column_pdf() -> bytes:
    document = pymupdf.open()
    page = document.new_page()

    for index in range(6):
        page.insert_text((40, 80 + index * 45), f"Left column content number {index}")
        page.insert_text((330, 80 + index * 45), f"Right column content number {index}")

    content = document.tobytes()
    document.close()
    return content


def test_marks_a_multi_column_pdf_as_not_ats_friendly() -> None:
    diagnostic = PdfAtsAnalyzer().analyze(create_two_column_pdf())

    assert diagnostic.ats_friendly is False
    assert diagnostic.layout_type == "multi_column"
    assert diagnostic.extraction_quality == "partial"
    assert "multi_column_layout" in diagnostic.reason_codes
    assert diagnostic.metrics["multi_column_pages"] == 1
