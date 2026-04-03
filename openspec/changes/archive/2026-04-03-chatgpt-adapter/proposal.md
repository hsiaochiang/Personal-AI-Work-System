## Why

V3 Change 2 已讓 `/extract` 入口改吃 `ConversationDoc`，但目前 runtime 仍只支援 `PlainTextAdapter`。若不在這一階段補上 `ChatGPTAdapter`，使用者從 ChatGPT 帶回來的分享頁內容或官方 JSON 匯出仍要手動清理成 plain text，V3 的跨工具整合就會停在 schema 文件層，沒有真正可用的第二個來源。

這個 change 的目標是用最小安全修改，讓 `/extract` 能直接接住 ChatGPT 的兩種半自動輸入：分享頁文字貼上與 JSON 匯出上傳，同時保留既有純文字流程作為 fallback。

## What Changes

- 新增 `ChatGPTAdapter`，支援將 ChatGPT 分享頁複製文字與官方 conversation JSON 正規化為合法 `ConversationDoc`（`source: chatgpt`）。
- 擴充 `/extract` 的輸入入口，保留既有 textarea，並加入最小 `.json` / `.txt` 上傳輔助與自動偵測邏輯，不引入多來源 selector。
- 讓 extraction 流程可在 ChatGPT 與 plain text 之間自動選擇 adapter，並維持既有 heuristics / review / writeback 行為。
- 新增可重跑的 ChatGPT adapter 驗證腳本與 fixture，並補上 UI/UX/smoke 證據。
- 同步更新 V3 brief、handoff、system manual 與 runlog，反映 Change 3 已進入 executor 階段。

## Capabilities

### New Capabilities
- `chatgpt-adapter`: 解析 ChatGPT 分享頁貼上與官方 JSON conversation 匯出，並輸出符合 `conversation-schema` v1 的 `ConversationDoc`。

### Modified Capabilities
- None.

## Non-goals

- 不實作 `local-import-vscode-copilot`、`source-attribution-in-memory`、`import-ui-multi-source`。
- 不新增工具來源下拉、跨多 conversation 的完整挑選 UI，若 JSON 含多筆 conversation 僅採最小 deterministic 選擇策略。
- 不改動 memory 寫回格式、memory badge、或 `/memory` 頁面呈現。
- 不引入新的 runtime dependency、前端框架或 build tool。

## Impact

- Affected code: `web/public/js/conversation-adapters.js`、`web/public/js/extract.js`、`web/public/extract.html`、驗證腳本與 fixtures。
- Affected docs: `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-03_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 推進 V3 Change 3，讓 V3 首個非 plain-text 的實際匯入來源可用；V3 整體狀態仍為進行中。
