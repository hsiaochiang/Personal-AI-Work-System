## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/adapter-docs-update/spec.md` 與 `tasks.md`，並讓內容與 V5 brief 的 adapter docs scope 對齊
- [x] 1.2 執行 `openspec validate --changes adapter-docs-update --strict`，確認 active change 可進入 apply

## 2. Adapter Documentation Update

- [x] 2.1 更新 `docs/workflows/conversation-schema.md`，補齊 `gemini` / `claude` / `chatgpt-api` 的來源命名、支援格式、限制與匯入入口
- [x] 2.2 保持既有 `ConversationMessage` / `ConversationDoc` schema 定義不變，只補 V5 支援來源矩陣與對應範例說明

## 3. `/extract` Support Format Copy

- [x] 3.1 更新 `web/public/extract.html` 與 `web/public/js/extract.js`，讓各來源 panel 與 selector hint 顯示一致的「支援格式」提示
- [x] 3.2 保持既有 `plain` / `chatgpt` / `gemini` / `claude` / `copilot` 匯入路徑與按鈕結構不變，避免 selector / panel regression

## 4. Verification And Evidence

- [x] 4.1 新增 targeted verify，檢查 `conversation-schema.md` 與 `/extract` UI 是否已包含 V5 支援格式文案
- [x] 4.2 補 `docs/qa/`、`docs/uiux/`、`docs/handoff/current-task.md`、`docs/planning/v5-brief.md`、`docs/roadmap.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 狀態與證據
