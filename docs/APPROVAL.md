# Auto-approval policy (agent)

Human gates in the spec are replaced in this repo by:

1. **Agent self-review** — Cursor agent đọc `out/<lecture>/review/*` + `prompts/critic.md` (see `docs/AGENTIC_OPUS.md`).
2. **`pnpm qa`** must pass full gate chain (geometry, review pack, **agentic critic**, render, final-qa). Use `QA_SKIP_RENDER=1` only for fast iteration.
3. **`out/<lecture>/review/LOG.md`** records critic scores; mode is always `agentic`.

**No API keys** for Gate 4. Optional external VLM is **out of scope** for this repo; agentic visual pass is mandatory before declaring done.
