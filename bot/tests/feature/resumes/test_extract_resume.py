from io import BytesIO

import pymupdf
from docx import Document
from fastapi.testclient import TestClient


def create_pdf(text: str = "Gustavo Martim\nHabilidades\nPHP\nLaravel") -> bytes:
    document = pymupdf.open()
    page = document.new_page()
    page.insert_text((72, 72), text)
    content = document.tobytes()
    document.close()
    return content


def create_docx() -> bytes:
    output = BytesIO()
    document = Document()
    document.add_paragraph("Gustavo Martim")
    document.add_paragraph("Experiência")
    document.add_paragraph("Backend Developer — Talora | 2024\u2013Atual")
    document.add_paragraph("Habilidades")
    document.add_paragraph("PHP, Laravel, PostgreSQL")
    document.add_paragraph("Projetos selecionados")
    document.add_paragraph("Talora Apply")
    document.add_paragraph("• Plataforma de apoio a candidaturas.")
    document.add_paragraph("• Backend Laravel e frontend Next.js.")
    document.add_paragraph("Formação e Idiomas")
    table = document.add_table(rows=1, cols=2)
    table.cell(0, 0).text = "Engenharia de Software"
    table.cell(0, 1).text = "Português: Nativo\nInglês: Leitura técnica"
    document.save(output)
    return output.getvalue()


def test_requires_service_authentication(client: TestClient) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        files={"file": ("resume.pdf", create_pdf(), "application/pdf")},
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_rejects_an_invalid_service_token(client: TestClient) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        headers={"Authorization": "Bearer invalid-service-token"},
        files={"file": ("resume.pdf", create_pdf(), "application/pdf")},
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_extracts_a_pdf_resume(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        headers=auth_headers,
        files={"file": ("resume.pdf", create_pdf(), "application/pdf")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["schema_version"] == "1.3"
    assert payload["document"]["mime_type"] == "application/pdf"
    assert payload["document"]["page_count"] == 1
    assert payload["document"]["ats"]["ats_friendly"] is True
    assert payload["document"]["ats"]["layout_type"] == "single_column"
    assert "Gustavo Martim" in payload["content"]["full_text"]
    assert payload["content"]["sections"]["skills"] == ["PHP", "Laravel"]


def test_extracts_a_docx_resume(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        headers=auth_headers,
        files={
            "file": (
                "resume.docx",
                create_docx(),
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["schema_version"] == "1.3"
    assert "Backend Developer — Talora" in payload["content"]["full_text"]
    sections = payload["content"]["sections"]
    assert payload["document"]["ats"]["ats_friendly"] is True
    assert payload["document"]["ats"]["layout_type"] == "document_flow"
    assert sections["experiences"] == [
        {
            "position": "Backend Developer",
            "company": "Talora",
            "period": "2024\u2013Atual",
            "start_date": "2024",
            "end_date": None,
            "is_current": True,
            "description": [],
        }
    ]
    assert sections["skills"] == ["PHP", "Laravel", "PostgreSQL", "Next.js"]
    assert sections["projects"] == [
        {
            "name": "Talora Apply",
            "description": [
                "Plataforma de apoio a candidaturas.",
                "Backend Laravel e frontend Next.js.",
            ],
        }
    ]
    assert sections["education"] == ["Engenharia de Software"]
    assert sections["languages"] == [
        {"name": "Português", "proficiency": "Nativo"},
        {"name": "Inglês", "proficiency": "Leitura técnica"},
    ]


def test_rejects_an_empty_file(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        headers=auth_headers,
        files={"file": ("resume.pdf", b"", "application/pdf")},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "EMPTY_FILE"


def test_rejects_an_unsupported_file(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        headers=auth_headers,
        files={"file": ("resume.txt", b"plain text", "text/plain")},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "UNSUPPORTED_FILE_TYPE"


def test_rejects_a_file_over_10_mb(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        headers=auth_headers,
        files={"file": ("resume.pdf", b"%PDF-" + b"0" * (10 * 1024 * 1024), "application/pdf")},
    )

    assert response.status_code == 413
    assert response.json()["error"]["code"] == "FILE_SIZE_LIMIT"


def test_rejects_a_mismatched_extension(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/v1/resumes/extract",
        headers=auth_headers,
        files={"file": ("resume.docx", create_pdf(), "application/pdf")},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "UNSUPPORTED_FILE_TYPE"
