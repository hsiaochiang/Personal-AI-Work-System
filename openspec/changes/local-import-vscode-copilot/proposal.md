## Why

`chatgpt-adapter` 完成後，V3 仍缺少一個真正的本機 auto-import 來源。對每天在 VS Code / GitHub Copilot Chat 工作的使用者來說，如果 `/extract` 仍要求先手動複製貼上，開發過程中的決策與規則就很難低摩擦地流進記憶系統。

這個 change 的目標是用最小安全修改，讓 `/extract` 可以直接讀取本機 Copilot Chat JSONL session，列出最近可匯入的對話並正規化為 `ConversationDoc`，同時維持既有 ChatGPT / plain text 流程不受破壞。

## What Changes

- 新增 `LocalImportVSCodeCopilot` 能力：讀取本機 VS Code Copilot Chat session JSONL、列出最近 session、載入單一 session 並轉為 `ConversationDoc`（`source: copilot`）。
- 在共享 adapter 模組中加入 Copilot session parser，讓瀏覽器 runtime、Node 驗證腳本與 server 端可共用相同正規化邏輯。
- 擴充 `web/server.js`，提供最小 read-only API 供 `/extract` 查詢本機 session 清單與讀取指定 session 檔案內容。
- 更新 `/extract` 頁面，加入最小 Copilot 本機匯入區塊與可覆寫的 session 路徑輸入，但不擴大為完整 multi-source selector。
- 新增 fixture、驗證腳本與 QA / UI / UX 證據，覆蓋 session 清單、單一 session 載入與既有流程共存。

## Capabilities

### New Capabilities
- `local-import-vscode-copilot`: 從本機 VS Code Copilot Chat JSONL 匯入單一 session，並送入既有 extraction pipeline。

### Modified Capabilities
- None.

## Non-goals

- 不實作 `source-attribution-in-memory`、`import-ui-multi-source` 或 memory source badge。
- 不支援多選 session、跨 session 合併、搜尋、分頁或 richer preview。
- 不新增新的 runtime dependency、前端框架、資料庫或 background watcher。
- 不處理雲端 Copilot API、登入狀態或權限同步；本次只讀取本機已存在的 session 檔案。

## Impact

- Affected code: `web/public/js/conversation-adapters.js`、`web/server.js`、`web/public/extract.html`、`web/public/js/extract.js`、`web/public/css/style.css`、`tools/verify_*`.
- Affected docs: `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-03_README.md`、`docs/qa/`、`docs/uiux/`.
- Roadmap impact: 推進 V3 Change 4，讓 V3 首個真正的本機 auto-import 來源上線；V3 整體狀態仍為進行中。
