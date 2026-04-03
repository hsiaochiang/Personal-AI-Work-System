# Local Import VS Code Copilot Smoke — 2026-04-03

> Change: `local-import-vscode-copilot`
> Type: UI change
> Scope: Copilot session JSONL local import + path override + `/extract` 共存驗證

## Verify Commands

- `node tools/verify_local_import_vscode_copilot.js`
- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_plain_text_adapter.js`
- `openspec validate local-import-vscode-copilot --type change --strict`
- `openspec validate local-import-vscode-copilot --type spec --strict`

## Coverage

- Copilot session JSONL fixture 可被解析為 `ConversationDoc`
- 本機 session list helper 可從指定目錄列出可匯入 session
- `GET /api/copilot/sessions` 與 `GET /api/copilot/session` 可從覆寫路徑讀取 fixture
- `/extract` 頁面含有 Copilot local import 區塊與刷新按鈕
- 既有 ChatGPT / plain text adapter regression 仍為 PASS

## Result

- `verify_local_import_vscode_copilot`：PASS
  - adapter contract PASS
  - local import smoke PASS（session list API、session load API、`GET /extract`、`GET /js/conversation-adapters.js`）
- `verify_chatgpt_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS
- `verify_plain_text_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS
- `openspec validate local-import-vscode-copilot --type change --strict`：PASS
- `openspec validate local-import-vscode-copilot --type spec --strict`：PASS

## Notes

- Local import 驗證使用 repo fixture 目錄覆寫 session path，不依賴操作者真實 `%AppData%` 內容。
- Copilot parser 目前以 JSONL 內最新的 `kind: 0` snapshot 為主，patch event 不重播；這是本次 MVP 的刻意取捨。
