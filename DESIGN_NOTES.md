# Design decisions log

Chronological notes so we do not repeat rejected paths.

## 2026-11-09 — Phase 0.5 kickoff

### Fonts tried / rejected

| Choice | Verdict |
|--------|---------|
| Inter / Roboto / system-ui | Rejected — spec §6.0 convergence |
| Space Grotesk | Rejected — “familiar substitute” |
| JetBrains Mono only | Rejected — single mono without paired sans felt like IDE skin, not course |
| **IBM Plex Sans + Plex Mono** | **Kept** — technicalIBM lineage, distinct from generic startup stacks, good Vietnamese/Latin |

### Color tried / rejected

| Choice | Verdict |
|--------|---------|
| `#0a0a0a` neutral black | Rejected — reads as default template |
| Purple second accent | Rejected — splits attention from signal red |
| Red syntax in Shiki | Rejected — red reserved for diagnostic signal |
| **`vault` `#0c0a0b` + warm seams** | **Kept** — intentional cast |

### Layout tried / rejected

| Choice | Verdict |
|--------|---------|
| Eyebrow “MODULE · LESSON” | Rejected — G-TELLS target |
| 2×2 identical metric cards | Rejected — generic dashboard |
| Full-bleed title only (no visual) | Rejected opener — no topic material |
| **Page stack + table hero** | **Kept** — matches Postgres mental model |

### Measure / QA

- Contrast lint uses brightest-pixel sampling in glyph regions (documented) because averaged rectangles mixed text with empty grid.
- Playwright measure uses mirrored `public/measure/*.html` until layout pass serves Remotion bundle over HTTP in Phase 2.
