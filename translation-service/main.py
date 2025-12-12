import uvicorn

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline, Pipeline
from typing import Optional

# Model identifier kept constant for clarity and repeatability.
MODEL_NAME = "Helsinki-NLP/opus-mt-en-es"

app = FastAPI(title="Translation Service", version="1.0.0")


class TranslateRequest(BaseModel):
    text: str


class TranslateResponse(BaseModel):
    translation: str


def load_translator() -> Pipeline:
    # Force CPU usage
    return pipeline("translation_en_to_es", model=MODEL_NAME, device=-1)


def get_translator() -> Pipeline:
    translator: Optional[Pipeline] = getattr(app.state, "translator", None)
    if translator is None:
        raise HTTPException(status_code=503, detail="Translation model not ready")
    return translator


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
    text = request.text.strip() if request.text else ""
    if not text:
        raise HTTPException(status_code=400, detail="Text must not be empty")

    translator = get_translator()

    try:
        output = translator(text)
        translation = output[0]["translation_text"]
    except Exception as exc:  # pragma: no cover - defensive guardrail
        raise HTTPException(status_code=500, detail="Translation failed") from exc

    return TranslateResponse(translation=translation)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
