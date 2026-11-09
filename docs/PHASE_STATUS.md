# Build phase status (auto-reviewed)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 | Done | Font still, geometry lint |
| 0.5 | Approved | DESIGN.md + 3 stills |
| 1 | Done | align/segment/transcribe |
| 2 | Done | DSL, DOM layout, compile |
| 3 | Done | Motion + 12 preset views; morph, persist echo, Shiki |
| 4 | Done* | `pnpm qa` through critic + render + final-qa |
| 5 | Done* | Fixtures, golden, `preset-regression` in qa |
| 6 | In progress | `pnpm batch lectures/postgres` (5 lectures), `out/batch-report.json`, input hash cache |

**Full pipeline:** `pnpm qa lectures/postgres/fixture-seq-scan`

**Batch (fast):** `BATCH_SKIP_RENDER=1 pnpm batch lectures/postgres`  
**Batch (full mp4):** `pnpm batch lectures/postgres`

**Lectures (postgres course shell):**
- `fixture-seq-scan` (canonical DSL)
- `fixture-index-predicate`, `fixture-plan-tree`, `fixture-io-latency`, `fixture-heap-pages` (same audio/script; swap lecture id for batch/regression)

**Whisper:** `pnpm whisper:install` + `pnpm whisper:serve` + `pnpm lecture <dir> transcribe`
