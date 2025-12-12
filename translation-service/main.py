from datetime import date, datetime
from typing import Any, List, Optional, Union, cast

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from transformers import Pipeline, pipeline

# Model identifier kept constant for clarity and repeatability.
MODEL_NAME = "Helsinki-NLP/opus-mt-en-es"

app = FastAPI(title="Translation Service", version="1.0.0")


class WorkExperience(BaseModel):
    """Partial work experience payload to translate."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class Education(BaseModel):
    """Partial education payload to translate."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    gpa: Optional[float] = Field(default=None, ge=0, le=4.0)
    honors: Optional[str] = None
    relevant_subjects: Optional[str] = None
    thesis_title: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class Project(BaseModel):
    """Partial project payload to translate."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    role: Optional[str] = None
    technologies: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    url: Optional[str] = None
    github_url: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class Skill(BaseModel):
    """Partial skill payload to translate."""

    id: Optional[int] = None
    cv_id: Optional[int] = None
    name: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra="ignore")


class CVPayload(BaseModel):
    """Top-level CV payload supporting partial data."""

    id: Optional[int] = None
    user_id: Optional[int] = None
    title: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    work_experiences: List[WorkExperience] = Field(default_factory=list)
    educations: List[Education] = Field(default_factory=list)
    skills: List[Skill] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class TranslateRequest(BaseModel):
    source_language: str = Field(default="en", description="Source language code")
    target_language: str = Field(default="es", description="Target language code")
    text: Optional[str] = None
    cv: Optional[CVPayload] = None

    model_config = ConfigDict(extra="ignore")


class TranslateResponse(BaseModel):
    translation: Any


def load_translator() -> Pipeline:
    # Force CPU usage; override typecheck.
    return pipeline(  # type: ignore[call-overload]
        "translation_en_to_es",
        model=MODEL_NAME,
        device=-1
    )


def get_translator() -> Pipeline:
    translator: Optional[Pipeline] = getattr(app.state, "translator", None)
    if translator is None:
        raise HTTPException(status_code=503, detail="Translation model not ready")
    return translator


def _normalize_language(lang: str) -> str:
    aliases = {
        "english": "en",
        "en-us": "en",
        "en-gb": "en",
        "spanish": "es",
        "es-es": "es",
        "es-mx": "es",
    }
    cleaned = (lang or "").strip().lower()
    return aliases.get(cleaned, cleaned)


def _translate_text(text: str, translator: Pipeline) -> str:
    cleaned = text.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Text must not be empty")
    output = translator(cleaned)
    return output[0]["translation_text"]


def _translate_field(value: Optional[str], translator: Pipeline) -> Optional[str]:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return value
    output = translator(cleaned)
    return output[0]["translation_text"]


def _translate_work_experiences(
    experiences: List[WorkExperience], translator: Pipeline
) -> List[dict]:
    translated: List[dict] = []
    for exp in experiences:
        data = exp.model_dump()
        data["company"] = _translate_field(exp.company, translator)
        data["position"] = _translate_field(exp.position, translator)
        data["location"] = _translate_field(exp.location, translator)
        data["description"] = _translate_field(exp.description, translator)
        translated.append(data)
    return translated


def _translate_educations(
    educations: List[Education], translator: Pipeline
) -> List[dict]:
    translated: List[dict] = []
    for edu in educations:
        data = edu.model_dump()
        data["institution"] = _translate_field(edu.institution, translator)
        data["degree"] = _translate_field(edu.degree, translator)
        data["field_of_study"] = _translate_field(edu.field_of_study, translator)
        data["description"] = _translate_field(edu.description, translator)
        data["honors"] = _translate_field(edu.honors, translator)
        data["relevant_subjects"] = _translate_field(edu.relevant_subjects, translator)
        data["thesis_title"] = _translate_field(edu.thesis_title, translator)
        translated.append(data)
    return translated


def _translate_projects(projects: List[Project], translator: Pipeline) -> List[dict]:
    translated: List[dict] = []
    for project in projects:
        data = project.model_dump()
        data["name"] = _translate_field(project.name, translator)
        data["description"] = _translate_field(project.description, translator)
        data["role"] = _translate_field(project.role, translator)
        data["technologies"] = _translate_field(project.technologies, translator)
        translated.append(data)
    return translated


def _translate_skills(skills: List[Skill], translator: Pipeline) -> List[dict]:
    translated: List[dict] = []
    for skill in skills:
        data = skill.model_dump()
        data["name"] = _translate_field(skill.name, translator)
        data["category"] = _translate_field(skill.category, translator)
        translated.append(data)
    return translated


def _translate_cv_payload(cv: CVPayload, translator: Pipeline) -> dict:
    translated = cv.model_dump()
    translated["title"] = _translate_field(cv.title, translator)
    translated["full_name"] = _translate_field(cv.full_name, translator)
    translated["location"] = _translate_field(cv.location, translator)
    translated["summary"] = _translate_field(cv.summary, translator)
    translated["work_experiences"] = _translate_work_experiences(
        cv.work_experiences, translator
    )
    translated["educations"] = _translate_educations(cv.educations, translator)
    translated["projects"] = _translate_projects(cv.projects, translator)
    translated["skills"] = _translate_skills(cv.skills, translator)
    return translated


@app.on_event("startup")
def startup_event() -> None:
    # Load once at startup to keep request handling fast and stateless.
    app.state.translator = load_translator()


@app.get("/health")
def health() -> dict:
    # Return 200 only when the app and model are ready.
    _ = get_translator()
    return {"status": "ok"}


@app.post("/translate", response_model=TranslateResponse)
def translate(request: TranslateRequest) -> TranslateResponse:
    source = _normalize_language(request.source_language)
    target = _normalize_language(request.target_language)

    if source != "en" or target != "es":
        raise HTTPException(
            status_code=400, detail="Only English to Spanish translation is supported"
        )

    has_text = bool(request.text)
    has_cv = request.cv is not None

    if not has_text and not has_cv:
        raise HTTPException(
            status_code=400, detail="Provide either 'text' or 'cv' for translation"
        )
    if has_text and has_cv:
        raise HTTPException(
            status_code=400,
            detail="Provide only one of 'text' or 'cv' to translate at a time",
        )

    translator = get_translator()

    translation: Union[str, dict[str, Any]]

    try:
        if has_text:
            translation = _translate_text(request.text or "", translator)
        else:
            translation = _translate_cv_payload(request.cv or CVPayload(), translator)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive guardrail
        raise HTTPException(status_code=500, detail="Translation failed") from exc

    return TranslateResponse(translation=translation)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
    )
