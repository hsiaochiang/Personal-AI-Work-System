# Gemini Adapter Smoke — 2026-04-04

> Change: `gemini-adapter`
> Type: UI change
> Scope: Gemini transcript paste + Gemini source badge + existing source regression

## Verify Commands

- `openspec validate --changes gemini-adapter --strict`
- `node tools/verify_gemini_adapter.js`
- `node tools/verify_plain_text_adapter.js`
- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_import_ui_multi_source.js`
- `node tools/verify_source_attribution_in_memory.js`

## Coverage

- Gemini transcript fixture 可被解析為 `ConversationDoc`，且每筆訊息的 `source = gemini`
- `adaptConversationInput()` 可自動辨識 Gemini transcript，不誤回退為 plain text
- `/extract` 頁面包含 `Gemini` source option、Gemini panel 與 adapter script
- `memory-source-utils` 可顯示 `Gemini` source badge，writeback attribution 可輸出 `<!-- source: gemini -->`
- `plain` / `chatgpt` / multi-source selector / source attribution 既有驗證全部回歸通過

## Result

- `openspec validate --changes gemini-adapter --strict`：PASS
- `verify_gemini_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS（`GET /extract`、`GET /js/conversation-adapters.js`）
- `verify_plain_text_adapter`：PASS
- `verify_chatgpt_adapter`：PASS
- `verify_import_ui_multi_source`：PASS
- `verify_source_attribution_in_memory`：PASS

## Notes

- Gemini 模式目前只支援貼上 transcript；本輪不支援 API 載入、檔案上傳或多 conversation picker。
- targeted verify 皆使用獨立 verify port 啟動本機 server，避免與手動開啟的 `localhost:3000` 衝突。
