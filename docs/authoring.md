# Authoring (LLM)

See `COURSE_VIDEO_ENGINE_SPEC.md` §9. Write only `scenes.dsl.json`.

Per segment:

1. What object must the viewer see?
2. Persist from previous scene if possible.
3. Pick preset from `src/presets/registry.ts`.
4. On-screen text ≤ 8 words (keywords).
5. Anchor beats to main nouns/verbs with `occurrence` when words repeat.
6. Scenes >12s need ≥3 beats.

Anti-patterns: bullets, duplicate adjacent presets, full spoken sentence on screen.
