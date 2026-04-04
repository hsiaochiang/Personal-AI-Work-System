## Why

`/extract` 的 ChatGPT 匯入目前只支援貼上 transcript 或上傳 conversation JSON / TXT。對於需要反覆匯入同一批 OpenAI platform conversations 的使用者，這仍然是高度手動的流程，而且 repo 目前沒有任何 server-side API key 管理、`/settings` 入口或 local conversation tracking。

V5 已明確把這個 change 的 scope 收斂為「使用 OpenAI API key 載入本工作台建立或追蹤的 OpenAI platform conversations」，而不是直接讀取 ChatGPT 產品網站 / app 的既有聊天歷史。本 change 的目標是用最小安全修改補上這條官方可支援的路徑，並保留既有 `plain` / `chatgpt` / `gemini` / `claude` / `copilot` 匯入流程不回歸。

## What Changes

- 新增 `/settings` 頁面與最小 API Keys 設定 UI，讓使用者可在 local-only 範圍內儲存 / 清除 OpenAI API key。
- 在 server 端新增 API key storage、local tracked conversation index，以及 OpenAI conversation proxy helpers。
- 新增 `/api/chatgpt/sessions`、`/api/chatgpt/sessions/track`、`/api/chatgpt/session` 等 endpoint，支援列出、追蹤與載入本工作台追蹤的 OpenAI platform conversations。
- 更新 `/extract` 的 ChatGPT source panel，加入 API 載入、tracked session picker 與 manual conversation ID tracking flow。
- 新增 `chatgpt-api` 來源標記與 targeted verify，確保 API 載入內容在候選審核與 memory writeback 階段可被辨識。

## Capabilities

### New Capabilities
- `chatgpt-api-auto-import`: 使用 server-side OpenAI API key，載入本工作台追蹤的 OpenAI platform conversations，並在 `/extract` 中直接進入既有 extraction / review / writeback 流程。
- `settings-api-keys`: 在 `/settings` 以 local-only 方式管理 API key 狀態，不把 key 暴露到 client bundle 或 git 追蹤檔案。

### Modified Capabilities
- `chatgpt-adapter`: 除了既有 transcript / JSON 匯入外，新增 API-loaded conversation doc 的載入入口與來源標記。
- `memory-source-attribution`: 新增 `chatgpt-api` 來源 presentation，讓候選審核與 memory writeback 能區分手動 ChatGPT 匯入與 API 匯入。

## Non-goals

- 不支援直接列出或讀取 ChatGPT 產品網站 / app 的既有聊天歷史。
- 不實作 OAuth、account-level sync、background polling、Gemini / Claude API import 或多使用者共享。
- 不新增 runtime dependency、前端框架、資料庫或新的 build 流程。
- 不改寫既有 extraction heuristics、memory writeback 結構或 `/memory` 主流程。

## Impact

- Affected code: `web/server.js`、`web/public/extract.html`、`web/public/js/extract.js`、`web/public/js/conversation-adapters.js`、`web/public/js/memory-source-utils.js`、`web/public/css/style.css`、新的 `/settings` 頁面與 JS、驗證腳本與 fixtures。
- Affected docs: `.gitignore`、`docs/handoff/current-task.md`、`docs/planning/v5-brief.md`、`docs/roadmap.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 將 V5 Change 3 從 Executor-ready 推進到 active implementation / verify，下一步交給 Review Gate 判定是否可進入 commit / sync / archive。
