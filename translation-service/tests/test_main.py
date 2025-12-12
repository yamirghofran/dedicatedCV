"""Lightweight tests for translation-service API logic."""

from __future__ import annotations

from typing import Any, List

import pytest
from fastapi.testclient import TestClient

import main


class FakeTranslator:
    """Minimal stub that mimics the transformers pipeline output."""

    def __init__(self) -> None:
        self.calls: List[Any] = []

    def __call__(self, text: str) -> list[dict[str, str]]:
        self.calls.append(text)
        return [{"translation_text": f"translated: {text}"}]


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    """Provide a TestClient with a patched translator to avoid model downloads."""
    translator = FakeTranslator()
    monkeypatch.setattr(main, "load_translator", lambda: translator)
    # Reset any existing translator state so startup uses the patched loader.
    if hasattr(main.app.state, "translator"):
        main.app.state.translator = None

    with TestClient(main.app) as test_client:
        yield test_client

    # Ensure state is clean for subsequent tests.
    if hasattr(main.app.state, "translator"):
        main.app.state.translator = None


def test_health_reports_ready(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_translate_text_returns_translation(client: TestClient) -> None:
    payload = {"source_language": "en", "target_language": "es", "text": "Hello"}
    response = client.post("/translate", json=payload)

    assert response.status_code == 200
    assert response.json()["translation"] == "translated: Hello"


def test_translate_rejects_multiple_payloads(client: TestClient) -> None:
    payload = {
        "source_language": "en",
        "target_language": "es",
        "text": "Hello",
        "cv": {"title": "Hola"},
    }
    response = client.post("/translate", json=payload)

    assert response.status_code == 400
    assert "only one of 'text' or 'cv'" in response.json()["detail"]
