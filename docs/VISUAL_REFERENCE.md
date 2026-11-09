# Visual reference (VDEV bar)

**Primary:** [POV: Dev nghỉ việc để build sản phẩm](https://www.youtube.com/watch?v=IwG2tFZCs7w) — kinetic story beats, UI/charts có chuyển động, dark + accent đỏ, không “slide tĩnh”.

**Secondary:** [tNWzHYzdPHI](https://www.youtube.com/watch?v=tNWzHYzdPHI) — Postgres / query lesson style (cùng kênh VDEV).

## Patterns engine phải đạt

| Pattern | Mô tả | Engine |
|---------|--------|--------|
| Depth background | Gradient + page lattice + vignette, không flat #000 | `StageBackdrop` |
| One hero / scene | Một visual chính; phần còn lại dim khi focus | `motion.dim`, camera |
| Beat-sync motion | Reveal / scan / emphasize đúng anchor word | `beat-state` + presets |
| Scan hero | Hàng bảng quét + counter đếm + highlight dòng | `ScanBeam` + `TableView` |
| Camera push | Zoom/pan nhẹ vào phần đang dạy | `CameraRig` + compiled `camera` |
| Signal color | Đỏ chỉ cho “sự kiện / con số / dòng đang nói” | tokens `signal` / `flare` |

Không copy literal layout YouTube; giữ `DESIGN.md` tokens và preset DSL.

## Đã wire trong engine (fixture `fixture-seq-scan`)

- Opener: spring vào title/subtitle + page stack trượt từ phải; nhấn đỏ khi `emphasize`.
- Table: `scan-rows` → beam pulse, dim hàng chưa quét, counter spring theo beat.
- Code: panel spring + `highlight-lines` → flare dòng (đã map trong `beat-state`).
- Toàn scene: `StageBackdrop`, fade-in clip, `CameraRig` (focus + ken burn nhẹ).

**QA:** `pnpm qa lectures/postgres/fixture-seq-scan` → `out/fixture-seq-scan/lecture.mp4` + `review/*.png` / filmstrip.

## Engine vừa bổ sung (2026-03-27)

- **Morph transition** (`scene-transition.tsx` + overlap `Sequence` trong `LectureVideo`).
- **ConnectorOverlay** — vẽ nét `connect` từ layout đo thật.
- **Scene start = đầu segment** (compile `startFrame`), không còn đen chờ beat đầu.
- **Lattice / nền** frame-driven + glow mạnh hơn (`stage-backdrop`, `stage-ambient`).
- **Preset thật:** `hero-code-plus-output`, `compare-split`, `metric-callout` (+ fixture EXPLAIN plan).
- **Beat giữ nhịp:** `after` + `count` trong khoảng im lặng transcript (không vi phạm anchor rules).

## Khoảng cách so với VDEV (cần phase tiếp)

| VDEV | Hiện tại |
|------|-----------|
| Chuyển cảnh morph/cut có ý đồ (blur, match element) | Chỉ fade 12 frame / cut DSL chưa render |
| UI mock, chart, path draw liên tục | Một số preset còn stub; connector SVG chưa vẽ trên stage |
| Motion trong mọi khoảng im lặng dài | `T-IDLE` warn scene s02 (~8.3s không beat) |
| Đa layer parallax / typography kinetic | Ken burn + spring cơ bản |

Hướng nâng bar: thêm beat giữ nhịp trong segment dài, `transition.morph` trong Remotion, component `ConnectorOverlay` từ compiled beats, mở rộng preset non-stub theo bảng pattern trên.
