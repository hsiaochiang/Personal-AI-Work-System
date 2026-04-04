# ChatGPT API Auto Import UX Review — 2026-04-04

## Review Scope

- 驗收 `chatgpt-api-auto-import` 對使用流程的 UX 影響
- 檢查重點：
  - 使用者是否能在既有 ChatGPT 匯入模式內完成「設 key → 追蹤 conversation → 載入 session → 提取候選」
  - empty state 與限制文案是否清楚說明「只支援 tracked OpenAI conversations」
  - 既有 `plain` / `chatgpt` transcript / `gemini` / `claude` / `copilot` flow 是否仍可共存

## Findings

- 新流程被拆成兩個可理解的步驟：先到 `/settings` 儲存 key，再回 `/extract` 的 ChatGPT panel 追蹤 / 載入 conversation；對使用者來說是可預期的權責切分。
- 若尚未設定 key，ChatGPT API import panel 會明確顯示要先前往 `/settings`；若尚未追蹤任何 conversation，會顯示需要先輸入 `conversationId` 的 empty state。這比靜默失敗更可理解。
- API 載入後仍沿用同一個 textarea 與「提取候選知識」主按鈕，不會把使用者切到第二條 extraction 流程。
- 既有 `verify_chatgpt_adapter`、`verify_plain_text_adapter`、`verify_gemini_adapter`、`verify_claude_adapter`、`verify_import_ui_multi_source` 全數 PASS，代表 selector 與既有匯入節奏沒有被新分支破壞。

## Decision

- UX review PASS
- 本次改動增加了必要的 bootstrap 步驟，但其原因與邊界在 UI 上是可理解的，且不會打斷既有匯入主流程

## Evidence

- `web/public/settings.html`
- `web/public/extract.html`
- `web/public/js/extract.js`
- `docs/qa/2026-04-04_chatgpt-api-auto-import-smoke.md`
- `tools/verify_chatgpt_api_auto_import.js`
- `tools/verify_import_ui_multi_source.js`
