# Kế hoạch đạt ~90% bar Opus (spatial + editorial)

Tài liệu này **tổng hợp**:
- Bar Opus / VDEV trong repo (`COURSE_VIDEO_ENGINE_SPEC.md` §7–8, §12; `docs/VISUAL_REFERENCE.md`).
- Ba ý tưởng bên ngoài: [VoT](https://github.com/microsoft/visualization-of-thought), geometry tool-use (Shapely/Turf), few-shot từ [SVG-Sophia / CTRL-S](https://github.com/hmwang2002/CTRL-S).

**Nguyên tắc không đổi (spec §0, §1):** LLM là biên tập viên — **không** ghi tọa độ trong `scenes.dsl.json`. Spatial “Opus-grade” = **suy luận đúng vai trò + công cụ tính hình học**, không phải Flash tự bắn pixel.

> **Agentic (mặc định repo):** Không `AUTHOR_*` / `CRITIC_*`. Gate 4 = **Cursor agent** + `agentic-critic.ts` + rubric `prompts/critic.md`. Chi tiết: [`docs/AGENTIC_OPUS.md`](./AGENTIC_OPUS.md).

---

## 1. Opus làm gì (mô hình áp vào engine này)

| Hành vi Opus (frontend/video editorial) | Engine đã có | Còn thiếu cho ~90% |
|----------------------------------------|--------------|---------------------|
| Lập kế hoạch layout trước khi “vẽ” | `docs/authoring.md`, `DESIGN.md` | **Harness author** có CoT/VoT → `author.plan.json` (không commit vào DSL) |
| Không đoán metric; dùng framework thật | Playwright layout, `compile`, G-/T-lint | Giữ; mở rộng motion/morph (VDEV gaps) |
| Nhìn kết quả, chỉnh lặp | `review-pack`, agentic critic | **Agent** xem contact-sheet + filmstrip (`docs/AGENTIC_OPUS.md`) |
| Design system nhất quán | tokens + 12 preset + golden | 5 lecture Postgres **nội dung riêng**, full render |
| Một điểm nhấn / cảnh, bớt trang trí | critic rubric `notGeneric` | Author prompt + T-IDLE / hero beats |

**VoT + Shapely + SVG-Sophia** không thay Remotion/layout — chúng nâng **bước (3) AUTHOR** và **tầng asset SVG tùy chọn**, trong khi **bước (5)–(7)** vẫn là nguồn sự thật về hình học video.

---

## 2. Bản đồ ba ý tưởng → pipeline hiện tại

```
script.md + segments.json
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ (3) AUTHOR HARNESS [DeepSeek / Opus-class]                    │
│  ┌─────────────┐   ┌──────────────────┐   ┌─────────────────┐ │
│  │ VoT layer   │ → │ Semantic spatial │ → │ scenes.dsl.json │ │
│  │ (mind map)  │   │ (preset/slots/   │   │ (NO coordinates)│ │
│  └─────────────┘   │  beat targets)   │   └─────────────────┘ │
│                     └──────────────────┘                       │
│  Optional sidecar: author.plan.json (grid ASCII, CoT, bỏ đi 1)│
│  Few-shot: 3–5 SVG-Sophia *structure* (reasoning→SVG), chỉ    │
│            cho slot decorative / preset author, không vào DSL │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
 schema → layout (Playwright) → compile → lint G,T → pack → critic → patch → render
        ▲
        │ “Geometry engine” chính thức — đã là engine repo
        │
┌───────┴───────────────────────────────────────────────────────┐
│ OPTIONAL: geometry-tool service (chỉ asset / connector path)    │
│ DeepSeek function-call → Turf.js / Shapely (polygon, buffer…) │
│ Output: path d / keyframes JSON → ingest preset hoặc SVG file   │
│ KHÔNG ghi thẳng vào beats của lecture DSL                       │
└───────────────────────────────────────────────────────────────┘
```

### 2.1 VoT (Microsoft) — “Prompt compiler” thực chất

- Repo: [microsoft/visualization-of-thought](https://github.com/microsoft/visualization-of-thought).
- Cơ chế: **“Visualize the state after each reasoning step”** (lưới ASCII, tiling, navigation) — không phải compiler Cartesian chung cho mọi video.
- **Cách dùng trong course-video-engine:**
  1. Fork **pattern** VoT, không fork toàn bộ task VoT (navigation 2D không map 1920×1080 lecture).
  2. Định nghĩa **lưới ngữ nghĩa 3×3** trên stage: `top-left | top-center | … | bottom-right` + safe area + “hero occupies center-weight”.
  3. Mỗi segment author phải in:
     - Trạng thái stage sau bước 1: preset + id hero ở vùng nào (chữ).
     - Sau bước 2: persist gì, beat nối id nào → id nào.
     - Sau bước 3: JSON DSL thuần (schema-valid).
  4. Lưu trace vào `out/<lecture>/author.plan.json` (debug + critic context), **không** merge vào `scenes.dsl.json`.

**Deliverable code:** `prompts/author-vot.md` + `scripts/author-harness.ts` (gọi API `AUTHOR_*`).

### 2.2 Geometry tool-use — 90% Opus qua máy tính, không qua Flash đoán

- Opus “giỏi hình học” trong chat vì model lớn + tool; **Flash** cần **function calling** tới code deterministics.
- **Hai tầng:**

| Tầng | Công cụ | Ai gọi | Output |
|------|---------|--------|--------|
| **A (bắt buộc)** | `runLayout`, `connectors.ts`, `camera.ts`, lint G-* | Pipeline `pnpm qa` | `layout.json`, compiled timeline |
| **B (tùy chọn)** | Turf.js (Node) hoặc Shapely (Python microservice) | Author/asset agent only | SVG path, decorative poly, arrow geometry |

**Quy tắc function schema (ví dụ Turf):**
- `place_polygon(sides, centerNorm, radiusNorm)` — center/radius **chuẩn hóa 0–1** relative safe area, service expand sang pixel nội bộ.
- `route_connector(fromId, toId, layoutJson)` — đọc bbox từ layout đã đo, không từ LLM.

DeepSeek chỉ emit: `{ "tool": "place_polygon", "args": {...} }` → executor trả `{ "path": "M ..." }` → ghi `lectures/.../assets/*.svg` hoặc slot `svgRef` (schema mở rộng có kiểm schema gate).

**Không** làm: LLM gọi `create_polygon(center=(960,540))` rồi nhét vào DSL beat.

### 2.3 SVG-Sophia — chỉ data few-shot, không train CTRL-S trong repo

- Dataset: SVG-Sophia (~145K) trên HuggingFace (theo paper CTRL-S).
- **Mục đích:** 3–5 ví dụ **cấu trúc** `[brief] → [spatial CoT text] → [clean SVG]` trong system prompt của:
  - `author-harness` (khi preset cần hero vector), hoặc
  - `services/svg-asset` (sinh file một lần, golden bởi người).
- **Không** fine-tune GRPO / verl trong pipeline Node render.
- Chọn mẫu theo **domain Postgres**: page stack, btree level, buffer blocks — không chọn animation GSAP phức tạp ngoài phạm vi Remotion.

**Deliverable:** `prompts/fewshot/svg-sophia/001-page-stack.md` … `005-btree.md` (trích rút tay từ dataset, license-aware).

---

## 3. Định nghĩa “90% Opus” (đo được)

| # | Tiêu chí | Pass |
|---|----------|------|
| 1 | Spec §12 lecture done | Gate 1–5, không ngoại lệ lint |
| 2 | Critic thật | Rubric §7.4 ≥ 4, TB ≥ 4.3 — agent đọc ảnh + deterministic `agentic` gate pass |
| 3 | Canonical gold | 1 lecture ~2–3 phút, filmstrip motion ≥ 4 |
| 4 | Phase 6 | ≥5 lecture Postgres: script + DSL + audio riêng; batch **full render** |
| 5 | Spatial | 0 major G-OVERLAP; connector không cắt chữ; author plan có VoT trace/scene |
| 6 | Anti-slideshow | 0 T-IDLE >3s trên gold; ≥2 morph/camera có chủ đích |

**Không** tính: self-critic heuristic pass; clone DSL 4 lecture; `BATCH_SKIP_RENDER=1` làm bằng chứng ship.

---

## 4. Kiến trúc harness (mới, tách khỏi render)

```
services/ or scripts/
  author-harness.ts      # VoT + DSL validate loop
  geometry-tools/        # Turf wrappers + zod schemas
  svg-asset.ts           # optional: few-shot + write assets

prompts/
  author-vot.md          # template VoT semantic grid
  author.md                # DSL contract (tạo nếu chưa có)
  fewshot/svg-sophia/*.md
  critic.md              # (đã có)

Không env bắt buộc — chỉ optional `GEOMETRY_SERVICE=local` nếu mở rộng tool.
```

**Luồng một segment:**
1. Input: `segment text`, `prev scene summary`, preset registry excerpt.
2. VoT: 3–6 bước ASCII semantic grid.
3. Tool (optional): nếu preset khai báo `allowsDecorativeSvg`, gọi geometry → asset path.
4. Output: `scenes.dsl.json` fragment → merge + `runSchemaGate`.
5. Fail schema → harness sửa tối đa N lần (≤6 như patch loop).

---

## 5. Lộ trình triển khai (phase con — sau Phase 6 spec)

### Phase O0 — Documentation & contracts (½ ngày)

- [ ] Review `PLAN_OPUS_90.md` với bar trên.
- [ ] Thêm `prompts/author.md` mirror `docs/authoring.md` + cấm tọa độ.
- [ ] Schema sidecar `author.plan.json` (zod, optional file).

**Exit:** AGENTS.md trỏ tới plan; không đổi gate ngưỡng.

### Phase O1 — VoT author harness (3–5 ngày)

- [ ] `prompts/author-vot.md`: semantic 3×3 + persist + một câu “bỏ chi tiết nào”.
- [x] `scripts/author-harness.ts`: VoT `author.plan.json` từ DSL (agent viết DSL).
- [ ] CLI: `pnpm lecture <dir> author` (trước schema trong qa tùy chọn).
- [ ] Test: 1 segment fixture — output pass schema, plan có ≥3 VoT steps.

**Exit:** Regen **một scene** `fixture-seq-scan` bằng harness, `pnpm qa` pass (có thể so sánh diff DSL thủ công).

### Phase O2 — Gate 4 agentic (2–4 ngày)

- [x] `src/qa/agentic-critic.ts` + `run-critic.ts` mode `agentic`.
- [x] `review/AGENT_CHECKLIST.md` + `prompts/critic.md` cho Cursor agent.
- [x] `review/LOG.md` ghi mode + scores.

**Exit:** Gold lecture `pnpm qa` pass + agent xem review pack theo `docs/AGENTIC_OPUS.md`.

### Phase O3 — Geometry tools tầng B (3–5 ngày, song song O2)

- [ ] `@turf/turf` hoặc wrapper: polygon, lineString, buffer — zod args normalized.
- [ ] `src/geometry/execute-tool-call.ts` + manifest cho DeepSeek OpenAPI-style.
- [ ] Pilot: `memory-blocks` hoặc opener nhận `assets/*.svg` từ tool, layout vẫn đo bbox.

**Exit:** 1 preset có SVG từ tool; preset regression golden cập nhật sau human approve.

### Phase O4 — SVG-Sophia few-shot (1–2 ngày)

- [ ] Tải subset dataset; chọn 3–5 mẫu; anonymize/trích trong `prompts/fewshot/`.
- [ ] Gắn vào harness chỉ khi `preset.requiresVectorHero`.

**Exit:** A/B harness với/không few-shot trên 1 asset — human chọn tốt hơn.

### Phase O5 — Editorial gold + Phase 6 thật (1–2 tuần)

- [ ] Nâng `fixture-seq-scan`: length ~2–3 phút audio/script, xóa T-IDLE, morph DSL.
- [ ] 4 lecture còn lại: script + `scenes.dsl.json` + audio riêng (transcribe).
- [x] `pnpm batch lectures/postgres`; critic agentic từng bài hoặc ESCALATION.

**Exit:** `out/batch-report.json` — 5/5 pass hoặc escalation có lý do.

### Phase O6 — VDEV polish (ongoing)

- [ ] Morph shared-element; connector visible; idle holds (`after` beats).
- [ ] (Tuỳ chọn) CTRL-S API refine SVG sau critic fail `notGeneric`.

**Exit:** `VISUAL_REFERENCE.md` gap table còn ≤2 hàng chưa xanh trên gold.

---

## 6. Rủi ro & anti-patterns

| Anti-pattern | Hậu quả | Thay bằng |
|--------------|---------|-----------|
| Flash sinh pixel trong DSL | Phá phase 2, lint fail | VoT semantic + layout engine |
| Bê VoT navigation task nguyên xi | Không map lecture | Template VoT custom §2.1 |
| Train CTRL-S trong CI | GPU, drift, không deterministic render | Few-shot + optional refine service |
| Heuristic critic = Opus | Pass ảo | Agentic critic + agent xem review pack |
| Shapely thay Playwright measure | Hai nguồn sự thật | Turf chỉ asset; layout vẫn DOM |

---

## 7. Thứ tự ưu tiên nếu chỉ làm một phần

1. **O2 + O5** (critic thật + nội dung 5 bài) — impact Opus cao nhất.
2. **O1** (VoT harness) — giảm DSL sai semantic/preset.
3. **O3 + O4** — polish hero / notGeneric, không chặn ship pilot.

---

## 8. Lệnh kiểm tra (sau triển khai)

```bash
pnpm lecture lectures/postgres/fixture-seq-scan author   # O1
pnpm qa lectures/postgres/fixture-seq-scan               # full chain
pnpm batch lectures/postgres                             # O5, no SKIP_RENDER
```

---

## 9. Trạng thái triển khai (automated verify)

Chạy: `pnpm opus:verify` (O0–O5 artifacts) + `BATCH_SKIP_RENDER=1 pnpm batch lectures/postgres` (5 lectures QA).

| Phase | Status | Verify |
|-------|--------|--------|
| O0 | Done | `prompts/author.md`, `author-vot.md`, `src/dsl/author-plan.ts` |
| O1 | Done | `pnpm lecture <dir> author`, `out/*/author.plan.json` |
| O2 | Done | `src/qa/run-critic.ts` mode `agentic` (spatial + heuristic + review-pack) |
| O3 | Done | `src/geometry/execute-tool-call.ts`, `scripts/svg-asset.ts` |
| O4 | Done | `prompts/fewshot/svg-sophia/*.md` (5) |
| O5 | Done* | 5 distinct `scenes.dsl.json`; batch 5/5 pass |
| O6 | Partial | T-IDLE beats improved on gold; morph VDEV gaps remain in `VISUAL_REFERENCE.md` |

Render đầy đủ: `pnpm qa lectures/postgres/fixture-seq-scan` (không set `QA_SKIP_RENDER`).

---

## 10. Tham chiếu

- Spec: `COURSE_VIDEO_ENGINE_SPEC.md` §7.4, §8, §11 Phase 6, §12.
- Visual bar: `docs/VISUAL_REFERENCE.md`.
- VoT: [microsoft/visualization-of-thought](https://github.com/microsoft/visualization-of-thought).
- CTRL-S / SVG-Sophia: [hmwang2002/CTRL-S](https://github.com/hmwang2002/CTRL-S).
