# Whisper align service

Lightweight **faster-whisper** HTTP API for word timestamps (no Docker).

## Setup (once)

```powershell
cd services/whisper_align
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

First run downloads the model (~500MB for `small` on CPU).

## Server

```powershell
$env:WHISPER_MODEL="small"
$env:WHISPER_DEVICE="cpu"
python -m uvicorn app:app --host 127.0.0.1 --port 8765
```

## CLI (no server)

```powershell
python cli.py E:\path\to\audio.mp3
```

## Node

`WHISPER_SERVICE_URL=http://127.0.0.1:8765` or `pnpm lecture <dir> transcribe`
