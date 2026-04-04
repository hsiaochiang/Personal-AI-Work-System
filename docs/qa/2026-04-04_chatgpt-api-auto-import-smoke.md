# ChatGPT API Auto Import Smoke — 2026-04-04

> Change: `chatgpt-api-auto-import`
> Type: UI change
> Scope: `/settings` OpenAI API key storage + `/extract` ChatGPT API import + tracked OpenAI conversation index

## Verify Commands

- `openspec validate --changes chatgpt-api-auto-import --strict`
- `node tools/verify_chatgpt_api_auto_import.js`
- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_plain_text_adapter.js`
- `node tools/verify_gemini_adapter.js`
- `node tools/verify_claude_adapter.js`
- `node tools/verify_import_ui_multi_source.js`
- `node tools/verify_source_attribution_in_memory.js`

## Coverage

- OpenAI conversation items fixture 可被解析為合法 `ConversationDoc`，且所有訊息的 `source = chatgpt-api`
- `/api/settings/openai` 可儲存 / 清除 API key，client 只取得 `configured` / `maskedKey`
- `/api/chatgpt/sessions/track` 可在 mock OpenAI API 下追蹤 `conversationId`
- `/api/chatgpt/sessions` 只列出 tracked sessions，`/api/chatgpt/session` 可回傳 `ConversationDoc`
- 未先追蹤的 `conversationId` direct load 會被 `/api/chatgpt/session` 拒絕，不可繞過 tracked session bootstrap
- `/extract` 頁面包含 ChatGPT API import UI，`/settings` 頁面包含 OpenAI API key 設定入口
- `plain` / `chatgpt` transcript / `gemini` / `claude` / multi-source selector / source attribution 既有驗證全部回歸通過

## Result

- `openspec validate --changes chatgpt-api-auto-import --strict`：PASS
- `verify_chatgpt_api_auto_import`：PASS
  - adapter contract PASS
  - local API/settings smoke PASS（mock OpenAI API + `/api/settings/openai` + `/api/chatgpt/*` + tracked-only direct load guard + `GET /extract` + `GET /settings`）
- `verify_chatgpt_adapter`：PASS
- `verify_plain_text_adapter`：PASS
- `verify_gemini_adapter`：PASS
- `verify_claude_adapter`：PASS
- `verify_import_ui_multi_source`：PASS
- `verify_source_attribution_in_memory`：PASS

## Notes

- ChatGPT API import 目前只支援「本工作台追蹤的 OpenAI platform conversations」；尚未支援直接列出 ChatGPT 產品聊天歷史。
- tracked session list 的 bootstrap 方式為手動輸入 `conversationId`；這是因為目前 scope 內沒有官方可用的 account-wide conversation listing。
- targeted verify 以本機 mock OpenAI server 覆蓋 API 邊界，不依賴真實雲端 key 或外部網路狀態。
