## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/chatgpt-adapter/spec.md` 與 `tasks.md`（驗收：artifact 內容與 V3 brief / planner handoff 的最小 scope 對齊）

## 2. ChatGPT Adapter Runtime

- [x] 2.1 擴充共享 adapter 模組，加入 ChatGPT JSON / share transcript parser 與 auto-detection（驗收：可輸出合法 `ConversationDoc`，且 `source = chatgpt`）
- [x] 2.2 保留 `PlainTextAdapter` fallback，避免非 ChatGPT 輸入被破壞（驗收：既有 plain-text 驗證案例仍通過）
- [x] 2.3 更新 `web/public/js/extract.js`，讓 extraction 入口根據輸入內容自動選擇 ChatGPT 或 plain adapter（驗收：程式內不再寫死只走 `adaptPlainTextConversation`）

## 3. `/extract` Minimal Input Support

- [x] 3.1 更新 `web/public/extract.html`，加入最小 `.json` / `.txt` 上傳入口與說明文案（驗收：不新增 multi-source selector，仍保留現有 textarea 主流程）
- [x] 3.2 在前端加入檔案讀取與狀態回饋（驗收：上傳後可把內容載入現有輸入區並進入 extraction）

## 4. Verification And Evidence

- [x] 4.1 新增 ChatGPT adapter fixture 與驗證腳本（驗收：可用 Node 執行，覆蓋 share transcript、JSON conversation、plain fallback）
- [x] 4.2 執行驗證並留下 QA / UI / UX 證據（驗收：至少包含 adapter verify、`/extract` smoke、UI/UX review）
- [x] 4.3 更新 `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-03_README.md` 的本 change 狀態（驗收：能反映 Change 3 已進入 executor 並說明 user-facing impact）
