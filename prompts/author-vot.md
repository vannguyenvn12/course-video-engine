# Visualization-of-Thought (semantic stage grid)

For each segment, **visualize the state after each reasoning step** before writing DSL.

## Semantic 3×3 grid (not pixels)

Regions: `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`.

Safe area: hero should sit `middle-center` or `middle-left`; counters/callouts `middle-right` or `bottom-right`.

## Required steps per scene

1. **Viewer need**: one concrete object (table, tree, code, metric).
2. **Stage grid**: which region holds the hero id; what is dim/hidden.
3. **Persist**: ids carried from previous scene; transition (`morph` | `camera` | `cut`).
4. **Beats**: anchor words + verbs (`scan-rows`, `connect`, `traverse`, …).
5. **Subtraction**: one decorative detail you refuse to add.
6. **DSL**: JSON scene object only (no coordinates).

## Output format for `author.plan.json`

```json
{
  "lecture": "postgres/fixture-seq-scan",
  "scenes": [
    {
      "sceneId": "s02",
      "segmentId": "seg-02",
      "votSteps": ["...", "..."],
      "semanticGrid": "hero orders @ middle-center; counter @ middle-right",
      "subtractDetail": "no extra legend row",
      "preset": "hero-table-with-annotation",
      "heroIds": ["orders", "counter"]
    }
  ],
  "generatedAt": "ISO-8601"
}
```
