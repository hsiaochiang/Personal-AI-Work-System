# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V5 Change 3 — `chatgpt-api-auto-import` Review Gate PASS
- Owner agent: Codex
- Last updated on: 2026-04-04

## Goal
- 讓使用者可在 `/settings` 儲存 OpenAI API key，並在 `/extract` 的 ChatGPT 模式載入本工作台追蹤的 OpenAI platform conversations
- 以 local tracked conversation index 補上「最近 sessions」能力，同時不宣稱可直接列出 ChatGPT 產品聊天歷史
- 把 change 推進到可由人工決定 commit / main spec sync / archive 的 PASS-ready 狀態；本輪不做不可逆操作

## Scope
- In scope:
  - 使用 OpenAI API key 與官方 Conversations / Responses conversation state，載入本工作台建立或追蹤的 OpenAI platform conversations
  - `/settings` 最小 API Keys 設定入口、server-side key storage、`/extract` ChatGPT 模式下的 API 載入 / session 選擇流程
  - 必要的 local conversation index / tracking，讓「最近 N 筆 sessions」可由工作台在官方支援範圍內成立
  - `.gitignore` 排除 local-only secrets / tracking files，並保留既有 `plain` / `chatgpt` transcript / `gemini` / `claude` / `copilot` 流程不回歸
- Out of scope:
  - 直接讀取使用者在 ChatGPT 產品網站 / app 既有聊天歷史
  - OAuth、雲端同步、background polling、Gemini / Claude API auto-import
  - commit / sync / archive 等不可逆操作

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` server（無 Express）
- 禁止新增 runtime dependency
- `AGENTS.md` 規定：scope 變更需人確認；本輪以使用者「請繼續」視為同意採用官方支援 scope
- `AGENTS.md` 規定：archive / release 類不可逆操作需人工確認

## Done
- 已建立 `openspec/changes/chatgpt-api-auto-import/` 的 `proposal.md`、`design.md`、delta spec 與 `tasks.md`，並通過 `openspec validate --changes chatgpt-api-auto-import --strict` ✅
- 已新增 `/settings` 頁面、sidebar navigation entry 與 `web/public/js/settings.js`，可在 local-only 範圍內儲存 / 清除 OpenAI API key；client 只看到 `configured` / `maskedKey` 摘要 ✅
- 已在 `web/server.js` 新增：
  - `web/api-keys.json` server-side key storage
  - `web/openai-conversation-index.json` local tracked conversation index
  - `/api/settings/openai`
  - `/api/chatgpt/sessions`
  - `/api/chatgpt/sessions/track`
  - `/api/chatgpt/session`
- 已在 `web/public/js/conversation-adapters.js` 新增 OpenAI conversation items → `ConversationDoc` parser，並把 API 匯入來源標記為 `chatgpt-api`；`memory-source-utils` / `memory-health-utils` / CSS badge 已同步 ✅
- 已更新 `/extract` 的 ChatGPT panel，加入 API import status、manual `conversationId` tracking、tracked session picker 與 load flow；手動 transcript / JSON / TXT 匯入仍保留 ✅
- 已更新 `.gitignore` 排除 `web/api-keys.json` 與 `web/openai-conversation-index.json` ✅
- 已修補 `web/server.js` 的 `/api/chatgpt/session` server-side guard：未先追蹤的 `conversationId` 不可 direct load，也不會再隱式寫入 tracked index ✅
- 已更新 `tools/verify_chatgpt_api_auto_import.js`，覆蓋「未先追蹤的 conversationId 直接載入應被拒絕」案例 ✅
- 已完成 targeted verify 與 regression：
  - `node tools/verify_chatgpt_api_auto_import.js`
  - `node tools/verify_chatgpt_adapter.js`
  - `node tools/verify_plain_text_adapter.js`
  - `node tools/verify_gemini_adapter.js`
  - `node tools/verify_claude_adapter.js`
  - `node tools/verify_import_ui_multi_source.js`
  - `node tools/verify_source_attribution_in_memory.js`
- 已補 QA / UI / UX evidence，並同步治理文件到 Review Gate-ready 狀態 ✅

## In Progress
- 無；Review Gate 已通過，待人工決定是否進 commit / main spec sync / archive

## Next Step

| 優先 | 說明 |
|:----:|------|
| 🔴 1 | 由人工決定是否接受目前 PASS 狀態並執行 implementation commit |
| 🟡 2 | 若要正式收尾，補 `openspec/specs/chatgpt-api-auto-import/spec.md` main spec sync，並重跑 spec strict validate |
| 🟢 3 | 經人工確認後，再決定是否執行 archive；若暫不收尾，可切到 `docs/agents/codex-prompts/v5/10-adapter-docs-update-plan.md` |

## Files Touched（本 session）
- .gitignore
- docs/handoff/blockers.md
- docs/handoff/current-task.md
- docs/planning/v5-brief.md
- docs/qa/2026-04-04_chatgpt-api-auto-import-smoke.md
- docs/roadmap.md
- docs/system-manual.md
- docs/uiux/2026-04-04_chatgpt-api-auto-import-ui-review.md
- docs/uiux/2026-04-04_chatgpt-api-auto-import-ux-review.md
- docs/runlog/2026-04-04_README.md
- docs/decision-log.md
- openspec/changes/chatgpt-api-auto-import/
- tools/fixtures/openai-conversation.json
- tools/fixtures/openai-conversation-items.json
- tools/verify_chatgpt_api_auto_import.js
- web/public/css/style.css
- web/public/extract.html
- web/public/index.html
- web/public/js/conversation-adapters.js
- web/public/js/extract.js
- web/public/js/memory-health-utils.js
- web/public/js/memory-source-utils.js
- web/public/js/settings.js
- web/public/settings.html
- web/public/task.html
- web/public/memory.html
- web/public/decisions.html
- web/public/handoff.html
- web/public/projects.html
- web/public/search.html
- web/server.js

## Validation Status
- Brief confirmation：✅ `docs/planning/v5-brief.md` 已有人類確認
- OpenSpec artifacts：✅ `openspec/changes/chatgpt-api-auto-import/` 已補齊 proposal / design / spec / tasks
- Strict validate：✅ `openspec validate --changes chatgpt-api-auto-import --strict`
- Targeted verify：✅ `node tools/verify_chatgpt_api_auto_import.js`
- Regressions：✅ `verify_chatgpt_adapter` / `verify_plain_text_adapter` / `verify_gemini_adapter` / `verify_claude_adapter` / `verify_import_ui_multi_source` / `verify_source_attribution_in_memory`
- UI review：✅ `docs/uiux/2026-04-04_chatgpt-api-auto-import-ui-review.md`
- UX review：✅ `docs/uiux/2026-04-04_chatgpt-api-auto-import-ux-review.md`
- Review Gate：✅ PASS
  - resolved issue：`/api/chatgpt/session` 現已驗證 `conversationId` 是否已存在於目前 project 的 tracked index；未先追蹤的 direct load 會被 400 拒絕
  - rerun evidence：`openspec validate --changes chatgpt-api-auto-import --strict`、`node tools/verify_chatgpt_api_auto_import.js`、`node tools/verify_chatgpt_adapter.js`、`node tools/verify_import_ui_multi_source.js`、`node tools/verify_source_attribution_in_memory.js`
- Governance sync：✅ `roadmap` / `brief` / `handoff` / `manual` / `runlog` 已對齊到 Review Gate PASS-ready 狀態
- Dirty tree note：✅ 目前包含本 change 的實作、evidence 與既有治理文件修改；未執行 commit / sync / archive
