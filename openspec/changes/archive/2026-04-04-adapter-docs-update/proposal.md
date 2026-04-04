# Proposal: adapter-docs-update

## Why

V5 已經補上 `GeminiAdapter`、`ClaudeAdapter` 與 ChatGPT API import flow，但目前使用者還是要靠試錯才能知道每個來源到底支援什麼格式。`docs/workflows/conversation-schema.md` 仍停留在 V3，只描述 `plain` / `chatgpt` / `copilot` 的 schema 基線，沒有把 `gemini`、`claude`、`chatgpt-api` 的支援格式、限制與來源命名補齊。

`/extract` 雖然各來源 panel 已有零散說明，但缺少一致的「支援格式」提示層，導致使用者很難快速判斷該貼什麼、可不可以上傳檔案、哪些流程需要先追蹤 conversation ID。這個 change 的目標是用最小安全修改補齊文件與 UI copy，不擴張任何 adapter / API 能力。

## What Changes

- 更新 `docs/workflows/conversation-schema.md`，補齊 `gemini` / `claude` / `chatgpt-api` 的來源命名、支援格式、限制與匯入方式說明。
- 更新 `/extract` 各來源面板與來源 selector 提示，加入一致化的「支援格式」文案。
- 保持既有 `plain` / `chatgpt` / `gemini` / `claude` / `copilot` 匯入路徑與 adapter 行為不變。
- 補對應的 QA / UI / UX evidence，讓後續 Review Gate 可以直接判定文件與文案是否對齊已上線能力。

## Capabilities

### New Capabilities

- `adapter-docs-update`: 文件化各匯入來源的支援格式與限制，並在 `/extract` 提供一致的使用提示。

### Modified Capabilities

- `conversation-schema`: 補齊 V5 新來源的格式說明與命名規則。
- `import-ui-multi-source`: 各來源 panel 顯示一致化的「支援格式」提示，降低匯入試錯成本。

## Non-goals

- 不新增或修改 `GeminiAdapter`、`ClaudeAdapter`、ChatGPT API endpoint 或任何 runtime 邏輯。
- 不新增新的 source type、upload capability、session picker 或 background sync。
- 不調整 extraction heuristics、memory writeback 結構、`/memory` 或 `/settings` 主流程。
- 不執行 commit / push / sync / archive 等不可逆操作。

## Impact

- Affected code: `web/public/extract.html`、`web/public/js/extract.js`。
- Affected docs: `docs/workflows/conversation-schema.md`、`docs/planning/v5-brief.md`、`docs/handoff/current-task.md`、`docs/roadmap.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 將 V5 Change 4 從「規劃完成」推進到 active executor，完成後交給 `docs/agents/codex-prompts/v5/12-adapter-docs-update-review.md` 做 Review Gate。
