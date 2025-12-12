"""Translation service orchestration."""

from __future__ import annotations

import httpx
from typing import Any, Callable, List, MutableMapping, Optional, cast

from app.core.config import settings
from app.schemas.translation import CVTranslation


def _normalize_language(lang: str) -> str:
    """Normalize language labels to ISO-like short codes."""
    if not lang:
        return ""
    cleaned = lang.lower().strip()
    aliases = {
        "english": "en",
        "en-us": "en",
        "en-gb": "en",
        "spanish": "es",
        "es-es": "es",
        "es-mx": "es",
    }
    return aliases.get(cleaned, cleaned)


class CustomTranslationClient:
    """HTTP client for the in-house translation microservice."""

    def __init__(self, base_url: str):
        if not base_url:
            raise ValueError("TRANSLATION_SERVICE_URL not configured")
        self.base_url = base_url.rstrip("/")

    def translate_cv(
        self, cv: CVTranslation, source_language: str, target_language: str
    ) -> CVTranslation:
        payload = {
            "source_language": source_language,
            "target_language": target_language,
            "cv": cv.model_dump(mode="json"),
        }
        try:
            response = httpx.post(
                f"{self.base_url}/translate", json=payload, timeout=30.0
            )
            response.raise_for_status()
        except httpx.RequestError as exc:
            raise ConnectionError(
                f"Unable to reach translation service at {self.base_url}"
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"Translation service returned {exc.response.status_code}: "
                f"{exc.response.text}"
            ) from exc

        data = response.json()
        if "translation" not in data:
            raise RuntimeError("Translation service response missing 'translation'")

        return CVTranslation.model_validate(data["translation"])


class ExternalTranslationClient:
    """HTTP client for Google Cloud Translation API v2 (API key auth)."""

    GOOGLE_V2_ENDPOINT = "https://translation.googleapis.com/language/translate/v2"

    def __init__(self, base_url: str, api_key: str):
        if not api_key:
            raise ValueError("EXTERNAL_TRANSLATION_API_KEY not configured")

        self.base_url = (base_url or self.GOOGLE_V2_ENDPOINT).rstrip("/")
        self.api_key = api_key

    def _translate_texts(
        self, texts: List[str], source_language: str, target_language: str
    ) -> List[str]:
        """Translate a batch of text strings, preserving order."""
        if not texts:
            return []

        payload = {
            "q": texts,
            "source": source_language,
            "target": target_language,
            "format": "text",
        }

        try:
            response = httpx.post(
                self.base_url,
                params={"key": self.api_key},
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
        except httpx.RequestError as exc:
            raise ConnectionError(
                f"Unable to reach Google Translation API at {self.base_url}"
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"Google Translation API returned {exc.response.status_code}: "
                f"{exc.response.text}"
            ) from exc

        data = response.json()
        translations = data.get("data", {}).get("translations")
        if not translations or len(translations) != len(texts):
            raise RuntimeError("Google Translation API response missing translations")

        return [item.get("translatedText", "") for item in translations]

    def translate_cv(
        self, cv: CVTranslation, source_language: str, target_language: str
    ) -> CVTranslation:
        def _dict_setter(
            container: MutableMapping[str, Any], key: str
        ) -> Callable[[str], None]:
            def setter(value: str) -> None:
                container[key] = value

            return setter

        translated_cv: MutableMapping[str, Any] = cast(
            MutableMapping[str, Any], cv.model_dump(mode="json")
        )

        text_queue: List[str] = []
        setters: List[Callable[[str], None]] = []

        def queue(value: Optional[str], setter: Callable[[str], None]) -> None:
            cleaned = value.strip() if value else ""
            if cleaned:
                text_queue.append(cleaned)
                setters.append(setter)

        queue(cv.title, _dict_setter(translated_cv, "title"))
        queue(cv.full_name, _dict_setter(translated_cv, "full_name"))
        queue(cv.location, _dict_setter(translated_cv, "location"))
        queue(cv.summary, _dict_setter(translated_cv, "summary"))

        for idx, exp in enumerate(cv.work_experiences):
            exp_dict = cast(
                MutableMapping[str, Any], translated_cv["work_experiences"][idx]
            )
            queue(exp.company, _dict_setter(exp_dict, "company"))
            queue(exp.position, _dict_setter(exp_dict, "position"))
            queue(exp.location, _dict_setter(exp_dict, "location"))
            queue(exp.description, _dict_setter(exp_dict, "description"))

        for idx, edu in enumerate(cv.educations):
            edu_dict = cast(MutableMapping[str, Any], translated_cv["educations"][idx])
            queue(edu.institution, _dict_setter(edu_dict, "institution"))
            queue(edu.degree, _dict_setter(edu_dict, "degree"))
            queue(edu.field_of_study, _dict_setter(edu_dict, "field_of_study"))
            queue(edu.description, _dict_setter(edu_dict, "description"))
            queue(edu.honors, _dict_setter(edu_dict, "honors"))
            queue(edu.relevant_subjects, _dict_setter(edu_dict, "relevant_subjects"))
            queue(edu.thesis_title, _dict_setter(edu_dict, "thesis_title"))

        for idx, project in enumerate(cv.projects):
            proj_dict = cast(MutableMapping[str, Any], translated_cv["projects"][idx])
            queue(project.name, _dict_setter(proj_dict, "name"))
            queue(project.description, _dict_setter(proj_dict, "description"))
            queue(project.role, _dict_setter(proj_dict, "role"))
            queue(project.technologies, _dict_setter(proj_dict, "technologies"))

        for idx, skill in enumerate(cv.skills):
            skill_dict = cast(MutableMapping[str, Any], translated_cv["skills"][idx])
            queue(skill.name, _dict_setter(skill_dict, "name"))
            queue(skill.category, _dict_setter(skill_dict, "category"))

        if text_queue:
            translated_texts = self._translate_texts(
                text_queue, source_language, target_language
            )
            for translated_text, setter in zip(translated_texts, setters):
                setter(translated_text)

        return CVTranslation.model_validate(translated_cv)


class TranslationService:
    """Selects the correct translation client based on language direction."""

    def __init__(self):
        self.internal_client: Optional[CustomTranslationClient] = None
        self.external_client: Optional[ExternalTranslationClient] = None

        if settings.TRANSLATION_SERVICE_URL:
            self.internal_client = CustomTranslationClient(
                settings.TRANSLATION_SERVICE_URL
            )
        if (
            settings.EXTERNAL_TRANSLATION_API_URL
            or settings.EXTERNAL_TRANSLATION_API_KEY
        ):
            self.external_client = ExternalTranslationClient(
                settings.EXTERNAL_TRANSLATION_API_URL
                or ExternalTranslationClient.GOOGLE_V2_ENDPOINT,
                api_key=settings.EXTERNAL_TRANSLATION_API_KEY,
            )

    def translate_cv(
        self, cv: CVTranslation, input_language: str, output_language: str
    ) -> CVTranslation:
        source = _normalize_language(input_language)
        target = _normalize_language(output_language)

        if source == "en" and target == "es":
            if not self.internal_client:
                raise ValueError("Internal translation service is not configured")
            return self.internal_client.translate_cv(cv, source, target)

        if source == "es" and target == "en":
            if not self.external_client:
                raise ValueError("External translation API is not configured")
            return self.external_client.translate_cv(cv, source, target)

        raise ValueError(f"Unsupported translation direction: {source} -> {target}")


_translation_service: Optional[TranslationService] = None


def get_translation_service() -> TranslationService:
    """Return singleton translation service instance."""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
