## Why

`local-import-vscode-copilot`、`chatgpt-adapter` 與 `source-attribution-in-memory` 完成後，V3 的匯入能力其實已經分散存在 `/extract`：Copilot 有獨立本機匯入區塊、ChatGPT 有上傳入口、純文字則依賴既有 textarea。功能雖然可用，但使用者仍要自己理解哪個入口對應哪個工具，候選清單也看不出來源，與 V3 brief 的 Import UI scope 仍有最後一段落差。

這個 change 的目標是用最小安全修改，把 `/extract` 收斂成明確的多來源匯入介面：使用者先選擇工具來源，再看到對應的匯入控制與提示，同時在候選審核階段直接看到來源標記；既有 Copilot / ChatGPT / plain text adapter 與 writeback 行為維持不變。

## What Changes

- 新增 `import-ui-multi-source` 能力：`/extract` 加入明確的工具來源 selector，支援 `copilot` / `chatgpt` / `plain` 三種模式切換。
- 收斂既有匯入控制：Copilot session list / path override、ChatGPT 上傳與 transcript 貼上、plain text 貼上改為依所選來源顯示，避免多條入口同時暴露造成判讀成本。
- 更新 extraction routing：依使用者選擇的來源呼叫既有 adapter / 已載入的 `ConversationDoc`，不再只依賴 auto-detect。
- 在候選卡片與審核摘要中顯示來源 badge，讓使用者在寫回前就能確認候選來自哪個工具。
- 新增 targeted verify 與 QA / UI / UX 證據，覆蓋 selector 狀態切換、來源導向解析與既有 regressions。

## Capabilities

### New Capabilities
- `import-ui-multi-source`: 在 `/extract` 以單一工具來源 selector 收斂 Copilot / ChatGPT / plain text 匯入入口，並在候選審核階段顯示來源標記。

### Modified Capabilities
- None.

## Non-goals

- 不新增 Gemini / Claude / Antigravity adapter 或任何新的來源。
- 不改寫既有 `ConversationDoc` schema、ChatGPT parser、Copilot JSONL parser 或 writeback metadata 格式。
- 不實作多 session merge、搜尋、rich preview、拖放上傳或 background watcher。
- 不引入新的 runtime dependency、前端框架、狀態管理庫或 build tool。

## Impact

- Affected code: `web/public/extract.html`、`web/public/js/extract.js`、`web/public/css/style.css`、必要時少量 `web/public/js/conversation-adapters.js` 與 `tools/verify_*`.
- Affected docs: `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`.
- Roadmap impact: 推進 V3 Change 6，完成 V3 brief In Scope D 的 Import UI 收斂；V3 整體狀態在本 change archive 前仍為進行中。
