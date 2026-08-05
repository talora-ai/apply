import re
from typing import ClassVar

from app.modules.resumes.schemas.response import (
    ExperienceData,
    LanguageData,
    ProjectData,
    ResumeSections,
)
from app.modules.resumes.services.skill_detector import SkillDetector


class ResumeSectionParser:
    headings: ClassVar[dict[str, set[str]]] = {
        "summary": {"resumo", "resumo profissional", "perfil", "profile", "summary"},
        "experience": {
            "experiência",
            "experiencias",
            "experiências",
            "experiência profissional",
            "experience",
            "work experience",
        },
        "skills": {"habilidades", "competências", "skills", "technical skills"},
        "projects": {"projetos", "projetos selecionados", "projects", "selected projects"},
        "education": {"formação", "formação acadêmica", "education", "academic background"},
        "languages": {"idiomas", "languages"},
        "education_languages": {"formação e idiomas", "education and languages"},
        "certifications": {"certificações", "certificados", "certifications"},
    }
    language_names: ClassVar[tuple[str, ...]] = (
        "Português",
        "Inglês",
        "Espanhol",
        "Francês",
        "Alemão",
        "Italiano",
        "Portuguese",
        "English",
        "Spanish",
        "French",
        "German",
        "Italian",
    )

    def parse(self, text: str) -> ResumeSections:
        grouped = self._group_lines(text)

        education_lines = list(grouped["education"])
        combined_education, combined_languages = self._split_education_languages(
            grouped["education_languages"]
        )
        education_lines.extend(combined_education)

        return ResumeSections(
            summary=grouped["summary"],
            skills=SkillDetector().detect(text),
            experiences=self._parse_experiences(grouped["experience"]),
            education=self._unique(education_lines),
            languages=self._parse_languages(text, [*grouped["languages"], *combined_languages]),
            projects=self._parse_projects(grouped["projects"]),
            certifications=grouped["certifications"],
        )

    def _group_lines(self, text: str) -> dict[str, list[str]]:
        grouped: dict[str, list[str]] = {name: [] for name in self.headings}
        current: str | None = None

        for raw_line in text.splitlines():
            line = re.sub(r"\s+", " ", raw_line).strip(" :-\t")
            if not line:
                continue

            heading = self._find_heading(line)
            if heading is not None:
                current = heading
                continue

            if current is not None:
                grouped[current].append(line)

        return grouped

    def _parse_experiences(self, lines: list[str]) -> list[ExperienceData]:
        experiences: list[ExperienceData] = []
        current: ExperienceData | None = None
        header_pattern = re.compile(
            r"^(?P<position>.+?)\s+[\u2014\u2013-]\s+"
            r"(?P<company>.+?)\s*\|\s*(?P<period>.+)$"
        )

        for line in lines:
            match = header_pattern.match(line)
            if match:
                period = match.group("period").strip()
                start_date, end_date, is_current = self._parse_period(period)
                current = ExperienceData(
                    position=match.group("position").strip(),
                    company=match.group("company").strip(),
                    period=period,
                    start_date=start_date,
                    end_date=end_date,
                    is_current=is_current,
                )
                experiences.append(current)
                continue

            if current is not None:
                current.description.append(line.lstrip("•- ").strip())

        return experiences

    @staticmethod
    def _parse_period(period: str) -> tuple[str | None, str | None, bool]:
        parts = re.split(r"\s*[\u2014\u2013-]\s*", period, maxsplit=1)
        start_date = parts[0].strip() or None
        end_date = parts[1].strip() if len(parts) == 2 else None
        is_current = bool(end_date and end_date.casefold() in {"atual", "present", "current"})
        return start_date, None if is_current else end_date, is_current

    def _parse_languages(self, text: str, section_lines: list[str]) -> list[LanguageData]:
        searchable = "\n".join([text, *section_lines])
        alternatives = "|".join(re.escape(name) for name in self.language_names)
        pattern = re.compile(
            rf"(?P<name>{alternatives})\s*:\s*(?P<level>.+?)"
            rf"(?=(?:\s*(?:{alternatives})\s*:)|\||\n|$)",
            flags=re.IGNORECASE,
        )
        languages: list[LanguageData] = []
        seen: set[str] = set()

        for match in pattern.finditer(searchable):
            name = match.group("name").strip().title()
            key = name.casefold()
            if key in seen:
                continue
            seen.add(key)
            languages.append(
                LanguageData(
                    name=name,
                    proficiency=match.group("level").strip(" ;,-"),
                )
            )

        return languages

    @staticmethod
    def _parse_projects(lines: list[str]) -> list[ProjectData]:
        projects: list[ProjectData] = []
        current: ProjectData | None = None

        for line in lines:
            if line.startswith("•"):
                if current is not None:
                    current.description.append(line.lstrip("• ").strip())
                continue

            current = ProjectData(name=line)
            projects.append(current)

        return projects

    def _split_education_languages(self, lines: list[str]) -> tuple[list[str], list[str]]:
        education: list[str] = []
        languages: list[str] = []
        language_pattern = re.compile(
            rf"^(?:{'|'.join(re.escape(name) for name in self.language_names)})\s*:",
            flags=re.IGNORECASE,
        )

        for line in lines:
            for part in (value.strip() for value in line.split("|") if value.strip()):
                if language_pattern.match(part):
                    languages.append(part)
                else:
                    education.append(part)

        return education, languages

    def _find_heading(self, line: str) -> str | None:
        normalized = line.casefold()
        for name, aliases in self.headings.items():
            if normalized in aliases:
                return name
        return None

    @staticmethod
    def _unique(values: list[str]) -> list[str]:
        return list(dict.fromkeys(values))
