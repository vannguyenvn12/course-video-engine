# COURSE VIDEO ENGINE: Build Spec & System Design

> Tài liệu build từ đầu, dùng cho **bất kỳ coding agent nào** (Cursor, Claude Code, Codex, OpenCode, DeepSeek harness...). Đặt file này ở gốc repo, và chép mục "Hướng dẫn cho agent" (mục 0) vào `AGENTS.md`.
>
> Mục tiêu: **(audio + script) → video bài giảng 1080p** phong cách presentation hiện đại, dark đỏ đen, minh họa SVG và animation có chủ đích. Chất lượng không phụ thuộc vào việc model có giỏi tọa độ hay không.

---

## 0. Hướng dẫn cho agent (đọc trước tiên)

1. **Bạn không bao giờ được viết tọa độ, kích thước pixel, hay keyframe bằng tay** trong nội dung bài giảng. Bạn viết *ý định* (scene DSL), engine tính hình học.
2. **Bạn không được tuyên bố xong** khi chưa chạy `pnpm qa` và tất cả gate đều pass (mục 7–8).
3. Sửa lỗi bằng cách sửa DSL hoặc sửa engine/preset, **không bao giờ thêm ngoại lệ hay hạ ngưỡng** để gate pass.
4. Làm theo đúng thứ tự phase (mục 11). Mỗi phase có acceptance criteria; chưa đạt thì không sang phase sau.
5. Khi bế tắc sau số vòng tối đa (mục 8.4), dừng lại và viết báo cáo vào `out/<lecture>/ESCALATION.md`, không đoán bừa.
6. Mọi lệnh CLI trả JSON có cấu trúc trên stdout và exit code ≠ 0 khi fail, để bạn đọc được kết quả bằng máy.

---

## 1. Nguyên lý cốt lõi: vì sao thiết kế này đạt chất lượng với mọi LLM

LLM yếu ở ba việc: (a) tính tọa độ, (b) ước lượng thời gian, (c) tự đánh giá thẩm mỹ khi không nhìn thấy kết quả. Hệ thống này **tước cả ba việc khỏi LLM**:

| Việc khó | Ai làm thay |
|---|---|
| Tọa độ, kích thước, khoảng cách | **Layout engine**: CSS grid/flex trong trình duyệt, `d3-hierarchy` cho cây, `elkjs` cho đồ thị. Engine *đo* bounding box thật sau khi render, không đoán. |
| Mũi tên, đường nối, vị trí camera | Tính từ **bounding box đã đo** của phần tử có `id`. LLM chỉ nói "nối A → B", "focus vào B". |
| Thời điểm animation | **Anchor word** + word timestamps từ forced alignment. LLM chỉ nói "hiện B khi đọc từ *root*". |
| Màu, cỡ chữ, spacing | **Design tokens** cố định. LLM không chọn giá trị, chỉ chọn vai trò (`emphasis`, `muted`...). |
| Bố cục đẹp | **Preset library** được thiết kế và duyệt một lần bằng con người/model mạnh (mục 5). LLM chỉ chọn preset + điền nội dung. |
| Biết kết quả có xấu không | **Lint hình học + lint thời gian (deterministic)**, sau đó **critic thị giác** độc lập chấm theo rubric (mục 7). |

Nói gọn: **LLM là biên tập viên, không phải họa sĩ.** Sự đẹp nằm trong preset và engine; sự đúng được đảm bảo bởi gate; LLM chỉ phải đưa ra quyết định ngữ nghĩa, là việc nó làm tốt.

### 1.1 Phương pháp lấy từ tài liệu công khai của Anthropic

Spec này áp dụng các nguyên lý Anthropic đã công bố về cách Claude làm ra thiết kế tốt (bài "Improving frontend design through Skills", skill `frontend-design` công khai, và mô tả sản phẩm Claude Design):

1. **Distributional convergence.** Không được dẫn hướng, model sẽ chọn lựa chọn "an toàn" phổ biến nhất trong dữ liệu huấn luyện, nên ra thiết kế chung chung. → Phải chỉ rõ những mặc định cần tránh và đưa lựa chọn thay thế cụ thể (mục 6.0).
2. **Dẫn hướng ở đúng "độ cao".** Không quá chi tiết kiểu hardcode từng giá trị, không quá mơ hồ kiểu "làm cho đẹp". Gắn thẩm mỹ với thứ code được: typography, màu/theme, motion, nền.
3. **Lập kế hoạch thiết kế trước, soi lại xem có chung chung không, rồi mới code.** Kế hoạch gồm token màu (4–6 màu có tên), vai trò font, ý tưởng bố cục bằng wireframe ASCII, và nguyên tắc riêng (Phase 0.5).
4. **Design system làm nền.** Claude Design dựng design system (màu, chữ, component) từ đầu rồi áp dụng nhất quán cho mọi output. → `DESIGN.md` + tokens + presets.
5. **Nhìn kết quả và tự phê bình.** Chụp màn hình để review; dùng model có khả năng nhìn tốt; tinh chỉnh lặp lại. → Gate 4 + patch loop.
6. **Một khoảnh khắc chuyển động được dàn dựng tốt hơn nhiều hiệu ứng rải rác.** Fade-slide-up cho mọi phần tử là dấu hiệu "AI làm".
7. **Dồn sự táo bạo vào một chỗ, phần còn lại tiết chế.** Trước khi chốt, bỏ bớt một chi tiết trang trí.
8. **Cho model công cụ thật** (script dựng sẵn boilerplate, framework tốt) thay vì bắt viết mọi thứ thủ công. → CLI, layout engine, motion primitives.
9. **Ghi chú những gì đã thử** để lần sau không lặp lại lựa chọn cũ → `DESIGN_NOTES.md`.

---

## 2. Tech stack

- Node.js 22, TypeScript strict, pnpm, zod cho mọi schema.
- **Remotion** để render video (React → mp4, frame-accurate, deterministic).
- **Playwright (Chromium)** cho layout pass và QA pass (đo DOM, chụp still).
- **Shiki** cho highlight code, với theme riêng khớp tokens.
- **d3-hierarchy** (cây), **elkjs** (đồ thị có hướng), layout bảng/mảng/bộ nhớ tự viết bằng CSS grid.
- **Forced alignment**: faster-whisper (word timestamps) + thuật toán align với script gốc (script là nguồn đúng về chữ; whisper chỉ cấp thời gian).
- **Font**: chọn ở Phase 0.5 theo mục 6.0 (không Inter/Roboto/font hệ thống), file local trong repo, nạp bằng `@font-face` + `delayRender`. Render **fail** nếu `document.fonts.check()` false.
- ffmpeg cho ghép audio, xuất contact sheet và filmstrip.
- Không phụ thuộc mạng khi render.

---

## 3. Kiến trúc tổng thể

```
lectures/<course>/<lecture>/
  script.md  audio.mp3
        │
 (1) ALIGN ─────────────► timeline.json        word timestamps, đoạn, câu
 (2) SEGMENT ───────────► segments.json        đoạn 4–20s theo ngữ nghĩa
 (3) AUTHOR  [LLM] ─────► scenes.dsl.json      ý định: preset + nội dung + beats
 (4) SCHEMA GATE ───────► fail → quay lại (3)
 (5) LAYOUT PASS ───────► layout.json          bounding box đo thật của mọi id, ở mọi beat
 (6) COMPILE ───────────► timeline.compiled.json  keyframes, camera, connectors (từ layout.json)
 (7) LINT GATE ─────────► lint.report.json     hình học + thời gian (deterministic)
 (8) STILLS + FILMSTRIP ► out/review/*.png
 (9) CRITIC [VLM] ──────► critic.report.json   chấm rubric, issue có cấu trúc
(10) PATCH LOOP ────────► quay lại (3)/(5) đến khi pass hoặc hết vòng
(11) RENDER ────────────► out/lecture.mp4
(12) FINAL QA ──────────► kiểm tra file, audio sync, regression
```

Bước (3), (9), (10) dùng LLM. **Mọi bước khác deterministic**: cùng input → cùng output.

---

## 4. Scene DSL: hợp đồng giữa LLM và engine

LLM chỉ viết file này. Không tọa độ, không pixel, không màu hex, không thời gian số.

```jsonc
{
  "lecture": "postgres-index/03-seq-scan",
  "scenes": [
    {
      "id": "s03",
      "segment": "seg-07",                 // gắn với đoạn thoại, engine lấy thời gian từ đây
      "preset": "hero-table-with-annotation",
      "slots": {
        "title": "Every row gets read",
        "table": {
          "id": "orders",
          "columns": ["id", "status", "total"],
          "rows": [["1","pending","42.00"],["2","shipped","18.50"],["3","pending","9.99"],["4","shipped","120.00"]]
        },
        "annotation": { "id": "counter", "kind": "counter", "label": "Rows scanned", "from": 0, "to": 4 }
      },
      "beats": [
        { "at": { "word": "every", "occurrence": 1 }, "do": "reveal", "target": "orders" },
        { "at": { "word": "scans" },  "do": "scan-rows", "target": "orders", "drive": "counter" },
        { "at": { "word": "shipped" }, "do": "emphasize", "target": "orders.row[2]" },
        { "at": { "word": "slow" },   "do": "focus", "target": "counter" }
      ],
      "persist": ["orders"],               // phần tử giữ lại sang cảnh sau (shared element)
      "transition": "morph"                // morph | camera | cut | fade (fade hạn chế)
    }
  ]
}
```

Quy tắc DSL:
- `target` tham chiếu `id` hoặc đường dẫn con (`orders.row[2]`, `code.line[3]`, `tree.node[42]`, `tree.path[42]`).
- Tập động từ `do` là **đóng**: `reveal`, `hide`, `emphasize`, `deemphasize`, `focus` (camera + dim phần còn lại), `draw` (vẽ nét), `connect` (A→B), `scan-rows`, `traverse` (đi theo path trong cây/đồ thị), `type-code`, `highlight-lines`, `count`, `morph-into`, `swap`, `split`, `merge`. Thêm động từ mới = sửa engine + schema + test, không phải "sáng tạo" trong DSL.
- `at` dùng anchor word (+ `occurrence` khi từ lặp lại) hoặc `{ "segmentStart": true }` / `{ "after": "<beat-id>", "gap": "short|medium" }`. Không bao giờ dùng giây.
- Nội dung chữ trên màn hình là **từ khóa**, không chép câu thoại.

---

## 5. Preset library: nơi chứa cái đẹp

**Đây là phần quyết định chất lượng.** Preset là bố cục đã được thiết kế kỹ, có slot đặt tên, có test, có ảnh "golden".

### 5.1 Cấu trúc một preset

```
src/presets/hero-table-with-annotation/
  Preset.tsx          component, chỉ dùng tokens + grid
  schema.ts           zod schema cho slots
  description.md      khi nào dùng, khi nào KHÔNG dùng, ví dụ DSL
  fixtures/*.json     2–4 bộ nội dung mẫu (ngắn, dài, cực đoan)
  golden/*.png        still đã được duyệt cho từng fixture
```

### 5.2 Danh sách preset tối thiểu (khóa học kỹ thuật)

| Preset | Dùng cho |
|---|---|
| `opener` | Mở bài/section: title display cỡ lớn làm chính + hình minh họa liên quan chủ đề tự vẽ (không mặc định eyebrow label) |
| `statement` | Một câu nhấn mạnh, kinetic typography (giới hạn thời lượng) |
| `hero-code` | Code là trung tâm, chú thích mũi tên vào dòng |
| `hero-code-plus-output` | Code trái, kết quả/EXPLAIN phải, nối bằng connector |
| `hero-table-with-annotation` | Bảng dữ liệu + bộ đếm/chú thích |
| `hero-tree` | Cây (B-tree...) full stage, traverse path |
| `hero-graph` | Sơ đồ luồng/kiến trúc (elkjs) |
| `compare-split` | A vs B song song, cùng tỉ lệ |
| `lanes-timeline` | 2–3 làn song song theo thời gian (transaction, request) |
| `memory-blocks` | Page/buffer/heap dạng ô nhớ |
| `metric-callout` | Một con số lớn + ngữ cảnh (latency, rows) |
| `warning-callout` | Lỗi phổ biến, viền đỏ |

### 5.3 Quy trình tạo preset (con người + model mạnh, làm một lần)

1. Thiết kế khung tĩnh ở công cụ có mắt nhìn (Claude Design, Figma, hoặc HTML viết tay), xuất ảnh/HTML vào `design-refs/<preset>/`.
2. Agent port sang `Preset.tsx` **chỉ bằng grid/flex + tokens**, không absolute position (trừ lớp connector/camera do engine sinh).
3. Chạy fixtures → still → so với design-ref (contact sheet) → sửa đến khi khớp.
4. Con người duyệt → lưu `golden/*.png`. Từ đây preset bị khóa bằng **visual regression test** (pixel diff ngưỡng nhỏ).

LLM authoring về sau **chỉ chọn trong danh sách preset đã khóa**. Không có preset phù hợp → dùng preset gần nhất + ghi `NEEDS_PRESET.md`, không tự chế layout.

---

## 6. Design system & tokens

`src/design/tokens.ts` là nguồn duy nhất. Preset tham chiếu vai trò, không hex. **Giá trị cụ thể do Phase 0.5 quyết định** và ghi vào `DESIGN.md`; các con số dưới đây là ràng buộc và điểm xuất phát, không phải đáp án cuối.

### 6.0 Mặc định chung chung phải tránh (anti-convergence)

Brief cố định: **nền tối, đỏ và đen**. Đó là yêu cầu, giữ nguyên. Nhưng tổ hợp "nền gần đen + một màu nhấn chói" là một trong những kiểu AI hay hội tụ về, nên mọi trục còn lại phải là lựa chọn có chủ đích:

- **Font**: không dùng Inter, Roboto, Arial, font hệ thống, và không dùng lựa chọn "thay thế quen thuộc" như Space Grotesk. Chọn một họ font có cá tính hợp chủ đề kỹ thuật (ví dụ họ IBM Plex, hoặc một display font kỹ thuật kết hợp monospace), chọn dứt khoát và dùng nhất quán. Tối đa 2 họ, nếu 2 thì phải khác biệt rõ.
- **Tương phản chữ cực đoan**: chênh độ đậm lớn (kiểu 200 vs 800, không phải 400 vs 600), chênh cỡ chữ ≥ 3 lần giữa display và chữ phụ.
- **Không mặc định** nhãn chữ in hoa giãn chữ trên mọi tiêu đề; không chuỗi meta nối bằng dấu chấm giữa ("A · B · C"); không "→" gắn vào chữ; không số thứ tự lớn "01/02" trừ khi nội dung thật sự là chuỗi bước.
- **Không mặc định** một bộ card bo góc giống hệt nhau + bóng xám mềm cho mọi thứ; bo góc và viền theo cấp bậc thông tin.
- **Không tô màu một từ trong tiêu đề chỉ để trang trí.** Ngoại lệ có chức năng duy nhất: thuật ngữ đang được đọc trong lời thoại được nhấn đồng bộ (nó mang thông tin "đang nói tới cái này").
- **Nền** không phẳng: lớp gradient, hoa văn hình học, hoặc hiệu ứng theo ngữ cảnh chủ đề (ví dụ lưới ô nhớ mờ cho chủ đề database), nhưng chìm và không cạnh tranh với nội dung.

### 6.1 Màu (điểm xuất phát, Phase 0.5 tinh chỉnh)
- Nền chính tối có chủ đích (không chỉ là "near-black ngẫu nhiên"), surface, surfaceRaised, border. Đặt tên theo vai trò trong `DESIGN.md`, 4–6 màu lõi.
- `text`, `textMuted` (chữ không bao giờ tối hơn `textMuted`).
- `accent` đỏ chính, `accentBright`, `accentWash` (accent ở opacity thấp, nền highlight).
- Quy tắc: **đỏ là tín hiệu "chú ý"**: viền, thanh nhấn, con số, mũi tên, phần tử đang được nói tới. Chữ thân luôn `text`/`textMuted`. **Cấm chữ đỏ trên nền đỏ.** Highlight = thanh đỏ bên trái + `accentWash` + chữ sáng.
- Theme Shiki riêng khớp palette; không dùng đỏ cho syntax để đỏ chỉ mang nghĩa "chú ý".

### 6.2 Chữ (khung 1920×1080)
- Thang cỡ: display 120–160, h1 72, body 40, chú thích 28, code 36 (line-height 1.5), số trong sơ đồ/bảng ≥ 32.
- Font lấy từ `DESIGN.md`, file local trong repo.

**Lưới & spacing**
- Safe area 96px. Lưới 12 cột, gutter 32px. Spacing scale 8px (8/16/24/32/48/64/96).
- Bo góc 12px card, 6px chip. Viền 1px. Không đổ bóng nặng; glow đỏ chỉ trên phần tử đang focus.

**Motion**
- **Mỗi cảnh có đúng một khoảnh khắc chuyển động chính được dàn dựng** (ví dụ: con trỏ quét qua bảng, đường tìm kiếm chạy xuống cây). Các chuyển động khác phục vụ nó hoặc không có.
- Cấm mặc định "fade + trượt lên" cho mọi phần tử xuất hiện. Cách vào cảnh phải gắn với ý nghĩa: bảng *được quét*, cây *mọc* từ gốc, mũi tên *được vẽ* từ nguồn tới đích, code *được gõ* hoặc *được soi*.
- Easing chuẩn: `cubic-bezier(0.16, 1, 0.3, 1)`; spring mềm cho morph.
- Thời lượng: micro 250ms, element 450ms, morph/camera 900ms.
- Stagger 60–90ms. Dim phần không focus về opacity 0.45 (không thấp hơn).
- Nền ambient: chuyển động rất chậm, gần như không nhận ra, chỉ để màn hình không chết.

**Restraint**
- Dồn sự táo bạo vào một chỗ mỗi cảnh (thường là hero visual). Mọi thứ khác yên tĩnh, có kỷ luật.
- Quy tắc "bỏ một món phụ kiện": trước khi chốt preset, liệt kê các chi tiết trang trí và bỏ ít nhất một cái không phục vụ việc hiểu bài.

---

## 7. Hệ thống review (quality gates)

### 7.1 Gate 1: Schema
- zod validate DSL. Mọi `target` tồn tại. Mọi anchor word có trong đoạn thoại của segment (đúng `occurrence`). Preset tồn tại và slots hợp lệ.

### 7.2 Gate 2: Lint hình học (Playwright, chạy trên mọi beat ở trạng thái cuối)

Mỗi rule có id, ngưỡng, và **thông báo gợi ý cách sửa bằng DSL**.

| Rule | Ngưỡng |
|---|---|
| `G-FONT` | `document.fonts.check` đúng font cho mọi phần tử chữ |
| `G-SAFE` | Mọi bbox nằm trong safe area (trừ `decorative`) |
| `G-CLIP` | Không phần tử nào có `scrollWidth > clientWidth` hay chữ bị ellipsis ngoài ý muốn |
| `G-OVERLAP` | Không chồng lấn giữa các phần tử chữ; connector không cắt qua chữ |
| `G-MINSIZE` | Cỡ chữ tính toán ≥ ngưỡng theo vai trò (mục 6) |
| `G-CONTRAST` | Tương phản ≥ 4.5:1 cho chữ thường, ≥ 3:1 cho chữ ≥ 48px, đo bằng **pixel sampling** trên still (không chỉ đọc CSS) |
| `G-DENSITY` | ≤ 8 từ hiển thị ngoài code/nhãn sơ đồ; code ≤ 14 dòng |
| `G-COVERAGE` | Bbox nội dung chính chiếm ≥ 45% diện tích safe area (chống "bảng co góc") |
| `G-BALANCE` | Trọng tâm thị giác không lệch quá 20% khỏi trục lưới dự định của preset |
| `G-GRID` | Mép trái các khối căn theo cột lưới (sai số ≤ 4px) |
| `G-RED` | Không có chữ màu đỏ trên nền có thành phần đỏ |
| `G-TELLS` | Phát hiện "dấu hiệu AI" trong DOM: font cấm (6.0), text-transform uppercase + letter-spacing rộng trên nhãn tiêu đề, chuỗi "·" nối meta, "→" cuối chữ, số "01/02" khi preset không khai báo là sequence, ≥ 3 card cùng kích thước + cùng bóng trong một cảnh |
| `G-ENTRANCE` | Cảnh có > 1 phần tử dùng cùng kiểu vào "fade + translateY" → cảnh báo |

### 7.3 Gate 3: Lint thời gian

| Rule | Ngưỡng |
|---|---|
| `T-SYNC` | Reveal bắt đầu trong khoảng [-150ms, +100ms] quanh anchor word |
| `T-IDLE` | Không quá 3s không có chuyển động có nghĩa (ambient không tính) |
| `T-HOLD` | Mỗi trạng thái quan trọng được giữ ≥ 1.2s trước khi đổi |
| `T-CONCURRENT` | ≤ 2 chuyển động lớn cùng lúc |
| `T-SCENE` | Cảnh dài 2.5–25s; cảnh > 12s phải có ≥ 3 beat |
| `T-REPEAT` | Không 2 cảnh liền nhau cùng preset; `statement` ≤ 20% thời lượng |
| `T-COVER` | Timeline phủ kín audio, không khoảng trống, không chồng cảnh |

### 7.4 Gate 4: Critic thị giác (VLM)

**Đầu vào cho critic** (tạo bởi `pnpm review:pack`):
- `contact-sheet.png`: still trạng thái cuối của mọi cảnh, đánh số.
- `filmstrip-<scene>.png`: 8–12 frame rải đều trong từng cảnh (để đánh giá motion).
- `context.md`: câu thoại của từng cảnh + DSL rút gọn + kết quả lint.
- Nếu có: golden/design-ref của preset tương ứng.

**Rubric** (mỗi tiêu chí 1–5, kèm bằng chứng):
1. Legibility: đọc được ngay, không căng mắt.
2. Hierarchy: biết nhìn vào đâu trước trong ≤ 1 giây.
3. Composition: cân đối, có chủ đích, không trống vô nghĩa, không chật.
4. Explanation fit: hình **giải thích đúng** câu thoại, không chỉ trang trí.
5. Motion: chuyển động dẫn mắt, nhịp đều, không giật/thừa (đánh giá qua filmstrip).
6. Consistency: đồng bộ với các cảnh khác và với golden.
7. Not-a-slideshow: không có cảm giác PowerPoint (bullet, layout lặp, cắt cứng).
8. Not-generic: có phải thứ một AI sẽ làm ra cho *bất kỳ* bài nào không? Có dấu hiệu nào ở mục 6.0 không? Cảnh có một điểm nhấn đáng nhớ hay sự táo bạo bị rải đều khắp nơi?

Critic phải kết thúc mỗi cảnh bằng câu hỏi "bỏ đi một chi tiết nào thì cảnh tốt hơn?" và ghi câu trả lời vào issues (severity `minor`) nếu có.

**Ngưỡng pass**: mọi tiêu chí ≥ 4 **và** trung bình ≥ 4.3.

**Đầu ra critic** bắt buộc dạng JSON:
```jsonc
{
  "scene": "s03",
  "scores": { "legibility": 4, "hierarchy": 3, ... },
  "issues": [
    {
      "severity": "major",
      "evidence": "Bảng chỉ chiếm 1/4 khung, mắt không biết tập trung vào đâu",
      "fix": { "type": "dsl", "op": "change-preset", "to": "hero-table-with-annotation" }
    },
    {
      "severity": "minor",
      "evidence": "Connector đi xuyên qua nhãn 'total'",
      "fix": { "type": "engine", "area": "connector-routing", "note": "tránh bbox chữ" }
    }
  ]
}
```
`fix.type` chỉ được là `dsl` (đổi preset, đổi nội dung, đổi/bỏ beat, rút gọn chữ) hoặc `engine`/`preset` (lỗi hệ thống). **Critic không bao giờ đề xuất tọa độ.**

**Tách vai**: critic chạy như một lượt/agent **riêng**, không thấy lập luận của author, chỉ thấy ảnh + context. Prompt critic nằm ở `prompts/critic.md`, phải yêu cầu critic khắt khe, tìm lỗi trước, chấm sau.

**Nếu model đang dùng không có khả năng nhìn ảnh**: dùng critic VLM cấu hình qua `CRITIC_*` env (bất kỳ model vision nào). Nếu không có VLM nào, Gate 4 chuyển trạng thái `PENDING_HUMAN` và pipeline dừng trước render cuối, kèm contact sheet để người duyệt. Không bao giờ tự cho pass.

### 7.5 Gate 5: Final QA
- File mp4 đúng 1920×1080, 30fps, H.264/AAC, độ dài khớp audio ±1 frame.
- Kiểm tra sync ngẫu nhiên 5 beat (frame tại anchor có phần tử đích visible).
- Visual regression của các preset đã dùng không vỡ.

---

## 8. Vòng lặp tự sửa (patch loop)

### 8.1 Thứ tự
```
author → schema → layout → compile → lint(G,T) → stills → critic → patch → (lặp)
```
Luôn sửa **lỗi rẻ trước**: schema → lint hình học → lint thời gian → critic. Không chạy critic khi lint còn fail.

### 8.2 Phân loại sửa
- Lỗi do nội dung (chữ dài, chọn preset sai, beat thừa) → sửa DSL.
- Lỗi lặp lại ở nhiều cảnh/bài (connector cắt chữ, preset vỡ với nội dung dài) → **sửa engine/preset**, thêm fixture tái hiện lỗi, thêm test, cập nhật golden sau khi người duyệt.
- Không bao giờ sửa bằng cách hạ ngưỡng lint hoặc thêm ngoại lệ cho một cảnh.

### 8.3 Ghi nhận
Mỗi vòng ghi vào `out/<lecture>/review/LOG.md`: vòng số, gate fail, issue, cách sửa, điểm critic trước/sau. Điểm phải tăng hoặc giữ; nếu một sửa làm điểm giảm thì revert.

### 8.4 Giới hạn và thoát
- Tối đa 6 vòng/lecture cho sửa DSL; tối đa 3 vòng cho mỗi sửa engine.
- Hết vòng mà chưa pass → viết `ESCALATION.md` (cảnh nào, tiêu chí nào, đã thử gì, đề xuất preset mới) và dừng.
- Pass hết → render cuối → Final QA → xong.

---

## 9. Hướng dẫn authoring (cho LLM viết DSL)

Lưu ở `docs/authoring.md`, AGENTS.md tham chiếu tới.

Với mỗi segment, trả lời theo thứ tự:
1. **Người xem cần *thấy* gì để hiểu câu này?** (một vật thể cụ thể: bảng, cây, dòng code, con số, hai thứ so sánh).
2. Vật thể đó đã có trên stage từ cảnh trước chưa? Có → `persist` + `morph`/`focus`, không vẽ lại.
3. Chọn preset có hero visual phù hợp nhất (đọc `description.md` của preset).
4. Chữ trên màn hình: tối đa 8 từ, là từ khóa.
5. Đặt beat theo anchor word ở **động từ hoặc danh từ chính** của câu ("scans", "root", "index").
6. Mỗi cảnh > 12s cần ≥ 3 beat; nếu không đủ ý → chia segment.

Anti-patterns (lint/critic sẽ bắt): tiêu đề + bullet; 2 cảnh liền nhau cùng preset; hình không liên quan câu thoại; chép nguyên câu thoại lên màn hình; cảnh không có hero visual; fade đen giữa hai cảnh cùng chủ đề; vẽ lại vật thể đã có thay vì persist.

---

## 10. Cấu trúc repo

```
AGENTS.md                       hướng dẫn agent (mục 0 + trỏ tới docs)
COURSE_VIDEO_ENGINE_SPEC.md     file này
DESIGN.md                       design direction đã duyệt (Phase 0.5)
DESIGN_NOTES.md                 nhật ký lựa chọn đã thử / bị loại, để không lặp lại
docs/authoring.md  docs/presets.md  docs/qa-rules.md
prompts/author.md  prompts/critic.md
design-refs/<preset>/           ảnh/HTML tham chiếu
src/
  design/tokens.ts  design/shiki-theme.json  design/fonts/
  dsl/schema.ts  dsl/resolve.ts            (target path, anchor → word)
  align/  segment/
  layout/ measure.ts  tree.ts  graph.ts  connectors.ts  camera.ts
  compile/ beats.ts  keyframes.ts  sharedElements.ts
  motion/ primitives (DrawPath, Stagger, WordReveal, Highlighter, CountUp, Morph, CameraRig, Ambient)
  presets/<name>/ (Preset.tsx, schema.ts, description.md, fixtures/, golden/)
  qa/ lint-geometry.ts  lint-timing.ts  contrast.ts  pack.ts  regression.ts  critic.ts
  remotion/ Root.tsx  Lecture.tsx  Stage.tsx
scripts/cli.ts
lectures/<course>/<lecture>/ script.md audio.mp3 scenes.dsl.json
out/<lecture>/ timeline.json segments.json layout.json timeline.compiled.json review/ lecture.mp4
```

CLI:
```
pnpm lecture <path> align|segment|layout|compile|lint|pack|critic|render|qa
pnpm qa <path>              chạy toàn bộ gate theo thứ tự, dừng ở gate fail đầu tiên
pnpm preset:test [name]     fixtures + visual regression
pnpm preset:golden <name>   cập nhật golden (chỉ khi người đã duyệt)
```

---

## 11. Lộ trình build (từng phase, có acceptance criteria)

**Phase 0: Nền móng**
Repo, tokens, fonts local + kiểm tra font, Remotion render 1 frame tĩnh, Playwright đo được bbox theo `data-id`.
✅ Một still test font đúng, lint `G-FONT`, `G-SAFE`, `G-CONTRAST` chạy và có test.

**Phase 0.5: Design direction (làm trước mọi preset)**
Theo quy trình "lập kế hoạch → soi tính chung chung → mới build":
1. Xác định chủ đề, người xem, nhiệm vụ chính của video (khóa học Postgres cho backend dev, xem trên laptop, mục tiêu là *hiểu cơ chế bên trong*). Tìm chất liệu thị giác từ chính thế giới chủ đề: page, tuple, B-tree, WAL, buffer, plan tree.
2. Viết `DESIGN.md`: 4–6 màu có tên + hex, font và vai trò, khái niệm bố cục (mô tả một câu + **wireframe ASCII** cho 3–4 kiểu cảnh chính, so sánh 2 phương án), nguyên tắc riêng của khóa học (3–5 câu), và **"một điều đáng nhớ"** của phong cách này.
3. **Tự soi**: với từng phần của kế hoạch, hỏi "nếu đưa một brief tương tự cho AI, nó có ra đúng thứ này không?". Phần nào giống mặc định ở 6.0 thì sửa, và ghi rõ đã sửa gì, tại sao.
4. Dựng 3 still mẫu tĩnh từ kế hoạch, review bằng mắt (Gate 4 rút gọn), chỉnh.
5. Ghi những lựa chọn đã thử và bị loại vào `DESIGN_NOTES.md`.
✅ `DESIGN.md` được người duyệt; 3 still mẫu đạt rubric ≥ 4 ở mọi tiêu chí, kể cả "Not-generic".

**Phase 1: Align + segment**
✅ Với audio + script mẫu: word timestamps khớp script, code block không bị tính là lời đọc, test cho từ lặp (`occurrence`).

**Phase 2: DSL + layout pass + compile**
Schema, resolve target, layout đo thật, connector và camera tính từ bbox, anchor → frame.
✅ Unit test: connector không cắt chữ, camera giữ target trong safe area, anchor sai báo lỗi rõ.

**Phase 3: Motion primitives + 4 preset đầu tiên** (`opener`, `statement`, `hero-code`, `hero-table-with-annotation`)
Theo quy trình 5.3, có design-ref, fixtures, golden.
✅ Toàn bộ lint G/T pass trên mọi fixture; golden được người duyệt.

**Phase 4: QA pack + critic + patch loop**
Contact sheet, filmstrip, critic prompt, JSON issues, LOG.md, escalation.
✅ Chạy trên lecture mẫu ~2 phút: vòng lặp tự đưa lên ngưỡng pass hoặc escalate có lý do.

**Phase 5: Preset còn lại** (tree, graph, compare, lanes, memory, callouts)
✅ Mỗi preset qua quy trình 5.3 và regression test.

**Phase 6: Batch cả khóa**
Nhiều lecture, cache theo hash, báo cáo tổng.
✅ Một section 5+ lecture render xong, mọi lecture có REVIEW pass hoặc ESCALATION.

Sau mỗi phase: dừng, tóm tắt, đưa still/contact sheet, chờ người duyệt.

---

## 12. Định nghĩa "xong" cho một lecture

- [ ] Gate 1–5 pass, không ngoại lệ, không hạ ngưỡng.
- [ ] Critic: mọi tiêu chí ≥ 4, trung bình ≥ 4.3 (hoặc người duyệt thủ công).
- [ ] `review/LOG.md` đầy đủ, điểm không giảm qua các vòng.
- [ ] Không có `NEEDS_PRESET.md` chưa xử lý cho lecture này.
- [ ] mp4 đúng spec, sync kiểm tra ngẫu nhiên đạt.
