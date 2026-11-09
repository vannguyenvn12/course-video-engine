# Opus bar — agentic (no API keys)

Chất lượng Opus trong repo này **không** cần `CRITIC_*`, `AUTHOR_*`, hay DeepSeek/VLM riêng. Bạn dùng **coding agent trong Cursor** làm vai trò author + visual critic; pipeline cung cấp bằng chứng và gate số.

## Ai làm gì

| Việc | Agent (Cursor) | Engine (deterministic) |
|------|----------------|-------------------------|
| Viết/sửa `scenes.dsl.json` | Có — theo `prompts/author.md` + VoT `prompts/author-vot.md` | Schema gate |
| VoT / spatial nháp | Đọc `out/<lecture>/author.plan.json` (sync từ DSL) | `runAuthor` trong `pnpm qa` |
| Tọa độ, connector, camera | Không | layout + compile + G-lint |
| “Có đẹp không?” | Mở `out/<lecture>/review/*.png` + `prompts/critic.md` rubric | `agentic-critic` (pack đủ, T-IDLE, G-TELLS) |
| Pass ship | Sửa DSL/engine đến `pnpm qa` pass | Toàn bộ gate §7–8 |

## Quy trình một lecture

1. Chỉnh `script.md` / DSL (agent).
2. `pnpm qa lectures/...` — hoặc `QA_SKIP_RENDER=1` khi iterate nhanh.
3. Mở `out/<lecture>/review/AGENT_CHECKLIST.md` và **contact-sheet + filmstrips**.
4. Nếu rubric tâm lý <4 ở composition/motion → patch, không hạ lint.
5. Render ship: `pnpm qa` không skip.

## Gate 4 trong repo

`src/qa/run-critic.ts` gộp:

- Heuristic (`critic.ts`) — beats, presets, hero verbs  
- Spatial — VoT plan, connect/traverse, G-rules  
- Agentic — review pack tồn tại, filmstrip/still đủ, morph count, T-IDLE/G-TELLS  

Mode luôn là **`agentic`**. Không gọi HTTP.

## VoT / geometry / SVG-Sophia (không train, không API)

- **VoT:** pattern trong `author-vot.md`; plan JSON là sidecar.
- **Geometry tools:** `src/geometry/execute-tool-call.ts` — agent hoặc `svg-asset.ts` tạo file SVG, không nhét pixel vào DSL.
- **SVG-Sophia:** few-shot trong `prompts/fewshot/svg-sophia/` để agent **đọc khi viết** asset/preset, không embed model.

## Định nghĩa “đủ Opus” (agentic)

- `pnpm qa` full pass (G/T + critic agentic + render + final-qa).  
- Agent đã xem review pack và không còn issue major trong rubric `prompts/critic.md`.  
- `author.plan.json` mỗi scene ≥3 `votSteps`.  
- Batch course: `pnpm batch lectures/postgres` (tùy chọn skip render khi CI nhanh).

Xem lộ trình chi tiết: `docs/PLAN_OPUS_90.md` (bản agentic, không API).
