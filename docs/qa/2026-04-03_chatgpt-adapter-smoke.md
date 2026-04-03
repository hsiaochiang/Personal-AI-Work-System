# ChatGPT Adapter Smoke — 2026-04-03

> Change: `chatgpt-adapter`
> Type: UI change
> Scope: ChatGPT transcript paste + ChatGPT JSON upload + plain-text fallback

## Verify Commands

- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_plain_text_adapter.js`
- `openspec validate chatgpt-adapter --strict`

## Coverage

- ChatGPT 分享頁 transcript fixture 可被解析為 `ConversationDoc`
- ChatGPT conversation JSON fixture 可被解析，且多 conversation 陣列會選最近更新的一筆
- `/extract` 頁面可提供 `ChatGPT JSON / TXT` 上傳按鈕與 adapter script
- 一般純文字仍走 `plain` fallback，不回歸既有 flow

## Result

- `verify_chatgpt_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS（`GET /extract`、`GET /js/conversation-adapters.js`）
- `verify_plain_text_adapter`：PASS
  - plain adapter contract PASS
  - local extract smoke PASS
- `openspec validate chatgpt-adapter --strict`：PASS

## Notes

- 本次 smoke 以 Node 驗證腳本啟動本機 server（使用獨立 verify port），避免與手動開啟的 `localhost:3000` 衝突。
- ChatGPT JSON 若包含多筆 conversation，現階段會 deterministic 選擇最近更新的一筆；完整挑選 UI 留待後續 change。
