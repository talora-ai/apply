from app.modules.resumes.services.section_parser import ResumeSectionParser


def test_returns_structured_resume_entities_and_respects_section_boundaries() -> None:
    text = """
    Resumo profissional
    Backend Engineer com Laravel e Docker.
    Experiência profissional
    Backend Developer — Talora | 2024\u2013Atual
    • Desenvolvimento de APIs REST com PHP.
    Projetos selecionados
    Talora Apply
    • Plataforma inteligente para candidaturas.
    • Backend Laravel e frontend Next.js.
    Formação e Idiomas
    Engenharia de Software | Português: Nativo
    Inglês: Leitura técnica
    """

    sections = ResumeSectionParser().parse(text)

    assert sections.summary == ["Backend Engineer com Laravel e Docker."]
    assert sections.skills == ["Laravel", "Docker", "REST APIs", "PHP", "Next.js"]
    assert [experience.model_dump() for experience in sections.experiences] == [
        {
            "position": "Backend Developer",
            "company": "Talora",
            "period": "2024\u2013Atual",
            "start_date": "2024",
            "end_date": None,
            "is_current": True,
            "description": ["Desenvolvimento de APIs REST com PHP."],
        }
    ]
    assert [project.model_dump() for project in sections.projects] == [
        {
            "name": "Talora Apply",
            "description": [
                "Plataforma inteligente para candidaturas.",
                "Backend Laravel e frontend Next.js.",
            ],
        }
    ]
    assert sections.education == ["Engenharia de Software"]
    assert [language.model_dump() for language in sections.languages] == [
        {"name": "Português", "proficiency": "Nativo"},
        {"name": "Inglês", "proficiency": "Leitura técnica"},
    ]


def test_detects_skills_from_anywhere_and_removes_duplicates() -> None:
    text = """
    Resumo
    Desenvolvimento backend com Laravel, Redis e Docker.
    Experiência
    PHP Developer — Company | 2020\u20132024
    • APIs REST utilizando Laravel, PostgreSQL e Redis.
    """

    sections = ResumeSectionParser().parse(text)

    assert sections.skills == [
        "Laravel",
        "Redis",
        "Docker",
        "PHP",
        "REST APIs",
        "PostgreSQL",
    ]
