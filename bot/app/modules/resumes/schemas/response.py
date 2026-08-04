from pydantic import BaseModel, ConfigDict, Field


class DocumentData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    filename: str
    mime_type: str
    page_count: int | None = None
    character_count: int = Field(ge=1)
    metadata: dict[str, str | int | bool | None]


class ExperienceData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    position: str
    company: str
    period: str
    start_date: str | None = None
    end_date: str | None = None
    is_current: bool = False
    description: list[str] = Field(default_factory=list)


class LanguageData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    proficiency: str | None = None


class ProjectData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    description: list[str] = Field(default_factory=list)


class ResumeSections(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    experiences: list[ExperienceData] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    languages: list[LanguageData] = Field(default_factory=list)
    projects: list[ProjectData] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)


class ResumeContent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    full_text: str = Field(min_length=1)
    sections: ResumeSections


class ResumeExtractionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: str = "1.2"
    document: DocumentData
    content: ResumeContent
