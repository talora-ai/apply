import re
from typing import ClassVar


class SkillDetector:
    """Detects canonical skills anywhere in a resume without duplicating them."""

    catalog: ClassVar[dict[str, tuple[str, ...]]] = {
        "PHP": ("PHP",),
        "Laravel": ("Laravel",),
        "JavaScript": ("JavaScript",),
        "TypeScript": ("TypeScript",),
        "React": ("React",),
        "React Native": ("React Native",),
        "Next.js": ("Next.js", "NextJS"),
        "Vue.js": ("Vue.js", "VueJS"),
        "Node.js": ("Node.js", "NodeJS"),
        "Python": ("Python",),
        "FastAPI": ("FastAPI",),
        "MySQL": ("MySQL",),
        "PostgreSQL": ("PostgreSQL", "Postgres"),
        "SQL Server": ("SQL Server",),
        "Redis": ("Redis",),
        "RabbitMQ": ("RabbitMQ",),
        "Docker": ("Docker",),
        "REST APIs": ("APIs REST", "REST API", "REST APIs"),
        "Git": ("Git",),
        "Linux": ("Linux",),
        "PHPUnit": ("PHPUnit",),
        "Pest": ("Pest",),
        "OpenAPI": ("OpenAPI",),
        "Sanctum": ("Sanctum",),
        "Passport": ("Passport",),
        "FilamentPHP": ("FilamentPHP", "Filament"),
        "CI/CD": ("CI/CD",),
        "SOLID": ("SOLID",),
        "Clean Code": ("Clean Code",),
        "Scrum": ("Scrum",),
        "Kanban": ("Kanban",),
        "Expo": ("Expo",),
    }

    def detect(self, text: str) -> list[str]:
        matches: list[tuple[int, str]] = []

        for canonical, aliases in self.catalog.items():
            positions = [
                match.start()
                for alias in aliases
                if (
                    match := re.search(
                        rf"(?<![\w]){re.escape(alias)}(?![\w])",
                        text,
                        flags=re.IGNORECASE,
                    )
                )
            ]
            if positions:
                matches.append((min(positions), canonical))

        return [canonical for _position, canonical in sorted(matches)]
