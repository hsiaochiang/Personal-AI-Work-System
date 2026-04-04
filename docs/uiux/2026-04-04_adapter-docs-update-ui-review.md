# Adapter Docs Update UI Review — 2026-04-04

## Review Scope

- 驗收 `adapter-docs-update` 對 `docs/workflows/conversation-schema.md` 與 `/extract` 可見文案的影響
- 檢查重點：
  - `/extract` 各來源 panel 是否都有一致的「支援格式」提示
  - ChatGPT / Gemini / Claude / Copilot 的提示是否明確說出目前可用入口與限制
  - 本次是否只改文案層，不破壞既有版面結構

## Findings

- `/extract` 頁首 hint 已改成「每個來源面板都會標示支援格式與目前限制」，與本 change 目標直接對齊。
- `plain` / `chatgpt` / `gemini` / `claude` / `copilot` 五個來源 panel 都有相同句式的提示層，資訊密度一致，不再是各自為政的自由文案。
- ChatGPT panel 現在清楚把 transcript / JSON / TXT 與 tracked OpenAI API session 放在同一段支援格式說明裡，且直接標出「不會直接列出 ChatGPT 產品聊天歷史」。
- 本次沒有新增按鈕、欄位、卡片或新頁面，只是在既有 panel 裡補提示文案，符合 Smallest Safe Change。

## Decision

- UI review PASS
- 視覺結構維持穩定，新增的資訊層次足夠清楚，沒有把 `/extract` 變成另一套新介面

## Evidence

- `docs/workflows/conversation-schema.md`
- `web/public/extract.html`
- `web/public/js/extract.js`
- `docs/qa/2026-04-04_adapter-docs-update-smoke.md`
- `tools/verify_adapter_docs_update.js`
