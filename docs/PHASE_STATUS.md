# Build phase status (auto-reviewed)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 | Done | Font still, geometry lint |
| 0.5 | Approved | DESIGN.md + 3 stills (`pnpm design:stills`) |
| 1 | Done | align/segment + fixture; `transcribe` when `audio.mp3` present |
| 2 | Done | DSL, **DOM layout measure** (`measure-preset-dom.ts` + Playwright), compile |
| 3 | Partial | 4 preset views wired in `PresetStage`; 12 schemas registered |
| 4 | Done | `pnpm qa`, timing lint, self-critic, **review-pack** PNGs |
| 5 | Partial | `preset:test`; golden PNG regression not yet |
| 6 | Partial | `pnpm batch`; `lecture … render` + `final:qa` when mp4 exists |

**Whisper (no Docker):** `pnpm whisper:install`, `pnpm whisper:serve`, `pnpm lecture <dir> transcribe`.

**Audio fixture:** `pnpm fixture:audio` creates silence `audio.mp3` for fixture lecture.

**Auto-approval:** `docs/APPROVAL.md`. Fixture: `pnpm qa lectures/postgres/fixture-seq-scan` → critic avg **4.5**, layout from measured DOM.
