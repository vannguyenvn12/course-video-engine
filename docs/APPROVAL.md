# Auto-approval policy (agent)

Human gates in the spec are replaced in this repo by:

1. **Self-review** documented in commit/QA output (weak points + fixes applied).
2. **`pnpm qa`** must pass full gate chain (through geometry lint, review pack, critic, render, final-qa). Use `QA_SKIP_RENDER=1` only for fast local iteration.
3. **`out/<lecture>/review/LOG.md`** records critic scores each run.

Gate 4 VLM: use `src/qa/critic.ts` self-critic until `CRITIC_*` vision env is configured.
