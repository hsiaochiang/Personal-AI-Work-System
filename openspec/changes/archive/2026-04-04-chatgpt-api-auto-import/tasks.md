## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/chatgpt-api-auto-import/spec.md` 與 `tasks.md`，並讓內容與 V5 brief 的 OpenAI platform conversation scope 對齊
- [x] 1.2 執行 `openspec validate --changes chatgpt-api-auto-import --strict`，確認 active change 可進入 apply

## 2. Server-Side OpenAI Session Plumbing

- [x] 2.1 更新 `web/server.js` 與 local-only storage 機制，加入 OpenAI API key 讀寫、tracked conversation index、`/api/settings/openai`、`/api/chatgpt/sessions`、`/api/chatgpt/sessions/track`、`/api/chatgpt/session`
- [x] 2.2 擴充共享 adapter / source utilities，支援 OpenAI conversation items → `ConversationDoc` 與 `chatgpt-api` source attribution

## 3. `/settings` 與 `/extract` UI Integration

- [x] 3.1 新增 `/settings` 頁面與 navigation entry，提供最小 OpenAI API key 設定入口並顯示 local-only 狀態
- [x] 3.2 更新 `web/public/extract.html`、`web/public/js/extract.js`、`web/public/css/style.css`，在 ChatGPT 模式加入 API 匯入、tracked session picker、manual conversation ID tracking 與 load flow
- [x] 3.3 保持既有 `plain` / `chatgpt` transcript / `gemini` / `claude` / `copilot` 匯入路徑可回歸，避免多來源 selector 行為被破壞

## 4. Verification And Evidence

- [x] 4.1 新增 fixtures 與 `tools/verify_chatgpt_api_auto_import.js`，覆蓋 OpenAI item parser、key storage、tracked session API 與 `/extract` / `/settings` local smoke
- [x] 4.2 重跑既有 `verify_chatgpt_adapter.js`、`verify_plain_text_adapter.js`、`verify_gemini_adapter.js`、`verify_claude_adapter.js`、`verify_import_ui_multi_source.js` regression
- [x] 4.3 補 `docs/qa/`、`docs/uiux/`、`docs/handoff/current-task.md`、`docs/planning/v5-brief.md`、`docs/roadmap.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 狀態與證據
