"""
Local faster-whisper alignment service (no Docker).
Start: python -m uvicorn app:app --app-dir services/whisper_align --host 127.0.0.1 --port 8765
Env: WHISPER_MODEL=base|small|medium (default small), WHISPER_DEVICE=cpu|cuda
"""
from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from faster_whisper import WhisperModel

app = FastAPI(title="course-video-whisper-align", version="1.0.0")

_model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        size = os.environ.get("WHISPER_MODEL", "small")
        device = os.environ.get("WHISPER_DEVICE", "cpu")
        compute_type = "int8" if device == "cpu" else "float16"
        _model = WhisperModel(size, device=device, compute_type=compute_type)
    return _model


class TranscribeRequest(BaseModel):
    audio_path: str = Field(description="Absolute path to mp3/wav on this machine")
    language: str = "en"


class WordOut(BaseModel):
    word: str
    start: float
    end: float


class TranscribeResponse(BaseModel):
    ok: bool = True
    duration_sec: float
    words: list[WordOut]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/transcribe", response_model=TranscribeResponse)
def transcribe(body: TranscribeRequest) -> TranscribeResponse:
    path = Path(body.audio_path)
    if not path.is_file():
        raise HTTPException(status_code=400, detail=f"audio not found: {path}")

    model = get_model()
    segments, info = model.transcribe(
        str(path),
        language=body.language,
        word_timestamps=True,
        vad_filter=True,
    )
    words: list[WordOut] = []
    for seg in segments:
        if seg.words:
            for w in seg.words:
                token = (w.word or "").strip()
                if not token:
                    continue
                words.append(WordOut(word=token, start=float(w.start), end=float(w.end)))

    duration = float(info.duration) if info.duration else (words[-1].end if words else 0.0)
    return TranscribeResponse(duration_sec=duration, words=words)

