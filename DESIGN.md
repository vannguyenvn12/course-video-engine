# Design direction — Postgres internals course

**Audience:** backend developers learning how PostgreSQL works inside (pages, tuples, btree, WAL, buffers), watching on a laptop at desk distance.

**Job of the video:** make mechanisms visible — not slides of bullet points, but objects that move and connect while the voice explains.

Status: **approved** 2026-11-09 (Phase 0.5 complete). `src/design/tokens.ts` mirrors this file.

---

## Color palette (6 core roles)

| Role | Name | Hex | Use |
|------|------|-----|-----|
| Canvas | `vault` | `#0c0a0b` | Full-frame background; warm black, not neutral gray-black |
| Surface | `ledger` | `#141112` | Panels, table canvas |
| Raised | `slab` | `#1c1817` | Cards, code block background |
| Structure | `seam` | `#302826` | 1px borders, grid lines at ~15% opacity |
| Text | `ink` | `#f0e8e4` | Primary copy, code default foreground |
| Secondary | `ash` | `#b8aea6` | Captions, secondary labels only |

**Signal (attention only, not syntax):**

| Role | Name | Hex |
|------|------|-----|
| Signal | `signal` | `#c41e3a` |
| Signal bright | `flare` | `#e8274b` |
| Signal wash | `signalMist` | `rgba(196, 30, 58, 0.14)` |

Rules:
- Red is **event / focus / path / count** — never decorative title coloring.
- Highlight block = `signalMist` fill + 4px `signal` left bar + `ink` text (no red glyphs on red fill).
- Shiki syntax must **not** use red for keywords (reserved for attention).

---

## Typography

Two families only; deliberately technical, not “startup sans.”

| Role | Family | Weight | Size (1080p) |
|------|--------|--------|----------------|
| Display / title | IBM Plex Sans | 700 | 120–152 |
| Body | IBM Plex Sans | 200–400 | 40 |
| Caption | IBM Plex Sans | 200 | 28 |
| Code / metrics | IBM Plex Mono | 400 | 36 / 56 for hero numbers |

Contrast discipline: display vs caption ≥ 3× size ratio; weight gap display/body uses 700 vs 200 (not 400 vs 600).

**Rejected:** Inter, Roboto, Arial, Space Grotesk, system UI stack (see `DESIGN_NOTES.md`).

---

## Layout grammar

- Safe area **96px**, **12-column** grid, **32px** gutter, spacing scale 8…96.
- **One hero** per scene (table, tree, code, metric) — everything else quiet.
- No default uppercase eyebrow labels; no `Topic · Module · 03`; no decorative `→` in titles; no giant `01/02` unless preset declares a true step sequence.

### Wireframe A — Opener (section title)

```
┌────────────────────────────────────────────────────────────── vault + page grid
│  [ safe 96 ]                                                 │
│   ┌──────────────────────────────┐    ┌─────────────────┐   │
│   │  DISPLAY: section title      │    │  SVG: page stack │   │
│   │  (2–4 words)                 │    │  8KB blocks      │   │
│   │                              │    │  slotty, not icon│   │
│   │  ash: one line subtitle      │    └─────────────────┘   │
│   └──────────────────────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

### Wireframe B — Hero table + annotation (vs rejected “card grid”)

**Chosen:** table spans cols 1–8, metric slab col 9–12 with inset signal bar.

```
┌──────────────────────────────────────────────────────────────┐
│  Title (short)                                               │
│  ┌────────────────────────────────────┐  ┌────────────────┐ │
│  │ TABLE primary (ledger)             │  │ │ counter      │ │
│  │ rows as real data                  │  │ │ mono number  │ │
│  │ scan stripe animation hero         │  │ └────────────────┘ │
│  └────────────────────────────────────┘                       │
└──────────────────────────────────────────────────────────────┘
```

**Rejected:** four equal rounded cards in a 2×2 (reads as generic SaaS dashboard).

### Wireframe C — Hero code

```
┌──────────────────────────────────────────────────────────────┐
│  Keyword title (≤8 words)                                    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ slab block, mono, Shiki                                  ││
│  │ ▌signal bar on active line only                          ││
│  └──────────────────────────────────────────────────────────┘│
│         optional ash hint, no arrow spam                     │
└──────────────────────────────────────────────────────────────┘
```

### Wireframe D — Compare split (future preset)

Side-by-side **equal width** lanes; shared baseline grid; signal only on the lane being spoken to.

---

## Motion & background

- **Background:** `vault` + faint **8KB page lattice** (horizontal banding + vertical seams), ~6% opacity — topic-specific, not flat void.
- **Ambient:** sub-pixel slow drift of lattice only (barely perceptible).
- **Hero motion (one per scene):** row scan, btree path draw, buffer page fill — not universal fade-slide-up entrances.

Easing: `cubic-bezier(0.16, 1, 0.3, 1)`. Durations: 250 / 450 / 900 ms.

---

## Course principles (Postgres-specific)

1. **Show the storage object** — pages and tuples before abstract “performance.”
2. **Red follows the spoken noun** — index row, buffer pin, plan node; never random emphasis in titles.
3. **Reuse the same object** across beats (`persist` + focus) instead of redrawing identical tables.
4. **Numbers are evidence** — counters and `EXPLAIN` figures in mono, large enough to read at 1080p.
5. **Restraint:** remove one decorative element before locking each preset.

---

## One memorable idea

> **“The lecture looks like a live catalog page under a red diagnostic lamp.”**  
> Dark warm vault, tuple/grid texture, and signal red only where attention is diagnostically required — like tracing one path through `pg_catalog`.

---

## Self-review vs generic AI defaults (§6.0)

| Risk | Our counter |
|------|-------------|
| Near-black + one neon accent | Warm `vault`, lattice texture, red only as signal |
| Inter / default sans | IBM Plex Sans + Mono, local files |
| Uppercase letter-spaced eyebrows | Omitted; title is the headline |
| Identical cards + soft shadows | Tiered slab/ledger surfaces, inset signal bar |
| Colored word in title for flair | Only when synced to spoken term (engine rule) |

**Adjusted after self-review:** subtitle stays **sentence case** (not all-caps); page grid uses **horizontal band height** reminiscent of 8KB pages, not uniform square “tech grid.”

---

## Phase 0.5 deliverables

| File | Purpose |
|------|---------|
| `out/phase0.5/sample-01-opener.png` | Wireframe A |
| `out/phase0.5/sample-02-table.png` | Wireframe B |
| `out/phase0.5/sample-03-code.png` | Wireframe C |

Gate 4 (full critic) deferred until human approves this doc and stills.
