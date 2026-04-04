## Why

`/extract` 目前已支援 `plain`、`chatgpt`、`gemini` 與 `copilot` 四種來源，但使用 Claude 的對話仍只能先手動整理成一般純文字再匯入。這會增加匯入摩擦、失去來源標記，也讓 V5 的工具覆蓋缺口仍然存在。

這個 change 的目標是用最小安全修改，讓使用者可以直接把 Claude 對話貼進 `/extract`，由 `ClaudeAdapter` 轉成合法 `ConversationDoc`，並保留既有 `plain` / `chatgpt` / `gemini` / `copilot` 流程不受影響。

## What Changes

- 新增 `ClaudeAdapter`，支援將 Claude 對話貼上文字正規化為 `ConversationDoc`（`source: claude`）。
- 擴充共享 adapter 模組的來源白名單、Claude transcript 偵測與 explicit adapter routing。
- 更新 `/extract` 的來源選單、說明文案與執行路徑，新增「Claude」來源選項。
- 讓候選審核與 memory writeback 沿用既有來源標記流程，顯示 `Claude` source badge。
- 新增 Claude adapter fixture、verify 腳本與對應 QA / UI / UX 證據。

## Capabilities

### New Capabilities
- `claude-adapter`: 解析 Claude 對話貼上文字，並以 `source: claude` 輸出 `ConversationDoc` 供既有 extraction 流程使用。

### Modified Capabilities
- None.

## Non-goals

- 不實作 ChatGPT API auto-import、settings API key 管理或 adapter docs 全面整理。
- 不支援 Claude API、自動抓取對話歷史、附件解析或多 conversation picker。
- 不改動既有 extraction heuristics、memory writeback 結構或 `/memory` 頁面主流程。
- 不引入新的 runtime dependency、前端框架或 build tool。

## Impact

- Affected code: `web/public/js/conversation-adapters.js`、`web/public/js/extract.js`、`web/public/extract.html`、`web/public/js/memory-source-utils.js`、`web/public/css/style.css`、驗證腳本與 fixtures。
- Affected docs: `docs/planning/v5-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/roadmap.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 將 V5 的第二個 planned change 從「規劃完成」推進到 active executor，下一步轉為 `claude-adapter` 的 strict validate / apply / verify。
