# Scene author (DSL only)

You write `scenes.dsl.json` per `COURSE_VIDEO_ENGINE_SPEC.md` §4 and `docs/authoring.md`.

## Hard rules

- **Never** write pixel coordinates, hex colors, durations in ms, or keyframe numbers in DSL.
- Only registered presets from `src/presets/registry.ts`.
- On-screen title/labels: ≤ 8 words (keywords), not full spoken sentences.
- Anchor beats to nouns/verbs in the segment; use `occurrence` when words repeat.
- Scenes >12s need ≥3 beats; use `at: { after, gap }` only to hold rhythm between sparse anchors.
- Prefer `persist` + `morph`/`camera` over redrawing the same object.

## Workflow (with VoT, agentic — no API)

1. Trước/sau khi sửa DSL: đọc `prompts/author-vot.md`, đảm bảo `pnpm qa` tạo `author.plan.json`.
2. Emit schema-valid `scenes.dsl.json` (bạn là author trong Cursor).
3. `pnpm qa` until pass; xem `out/<lecture>/review/*` + `prompts/critic.md`.

Return JSON only when asked for DSL fragment.
