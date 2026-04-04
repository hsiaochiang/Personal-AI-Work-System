## Why

`/extract` 目前已支援 `plain`、`chatgpt` 與 `copilot` 三種來源，但使用 Gemini 的對話仍只能先手動清理成純文字再匯入。這會讓 Gemini 對話失去來源標記、增加整理摩擦，也讓 V5 第一個 change 的工具覆蓋目標無法落地。

這個 change 的目標是用最小安全修改，讓使用者可以直接把 Gemini 對話貼進 `/extract`，由 `GeminiAdapter` 轉成合法 `ConversationDoc`，並保留既有 ChatGPT / Copilot / plain 流程不受影響。

## What Changes

- 新增 `GeminiAdapter`，支援將 Gemini 對話貼上文字正規化為 `ConversationDoc`（`source: gemini`）。
- 擴充共享 adapter 模組的來源白名單、Gemini transcript 偵測與 explicit adapter routing。
- 更新 `/extract` 的來源選單、說明文案與執行路徑，新增「Gemini」來源選項。
- 讓候選審核與 memory writeback 沿用既有來源標記流程，顯示 `Gemini` source badge。
- 新增 Gemini adapter fixture、verify 腳本與對應 QA / UI / UX 證據。

## Capabilities

### New Capabilities
- `gemini-adapter`: 解析 Gemini 對話貼上文字，並以 `source: gemini` 輸出 `ConversationDoc` 供既有 extraction 流程使用。

### Modified Capabilities
- None.

## Non-goals

- 不實作 Claude adapter、ChatGPT API auto-import 或 settings 頁 API key 管理。
- 不支援 Gemini API、自動抓取對話歷史、附件解析或多 conversation picker。
- 不改動既有 extraction heuristics、memory writeback 結構或 `/memory` 頁面主流程。
- 不引入新的 runtime dependency、前端框架或 build tool。

## Impact

- Affected code: `web/public/js/conversation-adapters.js`、`web/public/js/extract.js`、`web/public/extract.html`、`web/public/js/memory-source-utils.js`、`web/public/css/style.css`、驗證腳本與 fixtures。
- Affected docs: `docs/planning/v5-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/roadmap.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 將 V5 從「brief 已確認、尚未開工」推進到第一個 active change，版本狀態由規劃中轉為執行中。
