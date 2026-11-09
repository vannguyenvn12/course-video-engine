# Hướng dẫn cho agent

Đọc `COURSE_VIDEO_ENGINE_SPEC.md` trước khi làm bất cứ việc gì. Authoring: `docs/authoring.md`, VoT: `prompts/author-vot.md`, **Opus agentic (không API)**: `docs/AGENTIC_OPUS.md`. Gates → `docs/APPROVAL.md` + `pnpm qa` + xem `out/<lecture>/review/*`.

1. **Bạn không bao giờ được viết tọa độ, kích thước pixel, hay keyframe bằng tay** trong nội dung bài giảng. Bạn viết *ý định* (scene DSL), engine tính hình học.
2. **Bạn không được tuyên bố xong** khi chưa chạy `pnpm qa` và tất cả gate đều pass (mục 7–8 trong spec).
3. Sửa lỗi bằng cách sửa DSL hoặc sửa engine/preset, **không bao giờ thêm ngoại lệ hay hạ ngưỡng** để gate pass.
4. Làm theo đúng thứ tự phase (mục 11). Mỗi phase có acceptance criteria; chưa đạt thì không sang phase sau.
5. Khi bế tắc sau số vòng tối đa (mục 8.4), dừng lại và viết báo cáo vào `out/<lecture>/ESCALATION.md`, không đoán bừa.
6. Mọi lệnh CLI trả JSON có cấu trúc trên stdout và exit code ≠ 0 khi fail, để bạn đọc được kết quả bằng máy.
