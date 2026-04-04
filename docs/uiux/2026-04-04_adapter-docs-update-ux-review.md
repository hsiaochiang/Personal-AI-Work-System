# Adapter Docs Update UX Review — 2026-04-04

## Review Scope

- 驗收 `adapter-docs-update` 對 `/extract` 使用理解成本的 UX 影響
- 檢查重點：
  - 使用者是否能更快判斷每個來源該貼什麼、能不能上傳、是否需要先追蹤 session
  - ChatGPT manual import 與 API import 的邊界是否足夠清楚
  - 既有多來源匯入節奏是否保持不變

## Findings

- 使用者現在在切換來源時，不需要先試一次才知道格式是否支援；每個 panel 都直接回答「支援格式」與「限制」。
- ChatGPT 的提示文案明確指出 API import 的前提是先到 `/settings` 設定 key 並追蹤 `conversationId`，降低把 `chatgpt-api` 誤認成 ChatGPT 產品歷史列表的風險。
- Gemini / Claude 的限制文案同步指出目前只支援 transcript 貼上，避免使用者去找不存在的 upload / API flow。
- `verify_import_ui_multi_source` 與各 adapter regression 全數 PASS，代表本次沒有打斷既有 selector、textarea 與主按鈕節奏。

## Decision

- UX review PASS
- 本次改動沒有增加操作步驟，但明顯降低了匯入前的判讀摩擦，符合這個 change 的 user story

## Evidence

- `docs/workflows/conversation-schema.md`
- `web/public/extract.html`
- `web/public/js/extract.js`
- `docs/qa/2026-04-04_adapter-docs-update-smoke.md`
- `tools/verify_adapter_docs_update.js`
- `tools/verify_import_ui_multi_source.js`
