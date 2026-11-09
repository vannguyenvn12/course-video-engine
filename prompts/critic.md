# Visual critic (Gate 4 — agentic, no API)

**You** (coding agent in Cursor) are Gate 4 when `pnpm qa` has produced:

- `out/<lecture>/review/contact-sheet.png`
- `out/<lecture>/review/filmstrip-<scene>.png`
- `out/<lecture>/review/context.md`
- `out/<lecture>/author.plan.json` (VoT sidecar)

Score each scene 1–5: legibility, hierarchy, composition, explanationFit, motion, consistency, notASlideshow, notGeneric.

Pass: every score ≥ 4 and average ≥ 4.3.

If below pass: fix DSL or engine (`fix.type` dsl | preset | engine). **Never** pixel coordinates in fixes.

Deterministic pre-check already ran (`agentic-critic.ts`); your job is the editorial pass on stills/filmstrips before shipping mp4.
