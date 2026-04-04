# Claude Adapter Smoke — 2026-04-04

> Change: `claude-adapter`
> Type: UI change
> Scope: Claude transcript paste + Claude source badge + existing source regression

## Verify Commands

- `openspec validate --changes claude-adapter --strict`
- `node tools/verify_claude_adapter.js`
- `node tools/verify_plain_text_adapter.js`
- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_gemini_adapter.js`
- `node tools/verify_import_ui_multi_source.js`
- `node tools/verify_source_attribution_in_memory.js`

## Coverage

- Claude transcript fixture 可被解析為 `ConversationDoc`，且每筆訊息的 `source = claude`
- `adaptConversationInput()` 可自動辨識常見 Claude transcript（`Human` / `Assistant` / `Claude` heading），不誤回退為 plain text
- `/extract` 頁面包含 `Claude` source option、Claude panel 與 adapter script
- `memory-source-utils` 可顯示 `Claude` source badge，writeback attribution 可輸出 `<!-- source: claude -->`
- `plain` / `chatgpt` / `gemini` / multi-source selector / source attribution 既有驗證全部回歸通過

## Result

- `openspec validate --changes claude-adapter --strict`：PASS
- `verify_claude_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS（`GET /extract`、`GET /js/conversation-adapters.js`）
- `verify_plain_text_adapter`：PASS
- `verify_chatgpt_adapter`：PASS
- `verify_gemini_adapter`：PASS
- `verify_import_ui_multi_source`：PASS
- `verify_source_attribution_in_memory`：PASS

## Notes

- Claude 模式目前只支援貼上 transcript；本輪不支援 API 載入、檔案上傳或多 conversation picker。
- auto-detect 目前優先處理帶有 `Human` / `Claude` heading 的 transcript；主要使用方式仍是 explicit Claude source route。
- targeted verify 皆使用獨立 verify port 啟動本機 server，避免與手動開啟的 `localhost:3000` 衝突。
