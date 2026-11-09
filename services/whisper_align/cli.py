"""One-shot transcribe to stdout JSON (words + duration_sec)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from app import get_model, TranscribeResponse, WordOut


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "usage: python cli.py <audio_path>"}))
        sys.exit(1)
    audio = Path(sys.argv[1])
    if not audio.is_file():
        print(json.dumps({"ok": False, "error": f"not found: {audio}"}))
        sys.exit(1)

    model = get_model()
    segments, info = model.transcribe(str(audio), word_timestamps=True, vad_filter=True)
    words: list[dict[str, float | str]] = []
    for seg in segments:
        if not seg.words:
            continue
        for w in seg.words:
            token = (w.word or "").strip()
            if token:
                words.append({"word": token, "start": float(w.start), "end": float(w.end)})
    duration = float(info.duration) if info.duration else (words[-1]["end"] if words else 0.0)
    print(
        json.dumps(
            {"ok": True, "duration_sec": duration, "words": words},
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
