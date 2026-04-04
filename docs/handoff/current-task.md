# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V5 Change 4 — `adapter-docs-update` Archive Complete
- Owner agent: Codex
- Last updated on: 2026-04-04

## Goal
- 完成 `adapter-docs-update` 的 main spec sync、commit 與 archive，讓 V5 四個 planned changes 全數完成
- 收斂本輪只處理 adapter 文件補齊與 `/extract` 支援格式提示，不擴張到新 adapter / API 能力
- 同步 handoff / roadmap / brief / system manual / runlog，讓下一步明確切到 V5 版本收尾判定

## Scope
- In scope:
  - 更新 `docs/workflows/conversation-schema.md`，補齊 Gemini / Claude / ChatGPT API 匯入的支援格式、來源命名與限制說明
  - 在 `/extract` 各工具來源面板補齊一致的「支援格式」提示文案
  - 保持既有 `plain` / `chatgpt` / `gemini` / `claude` / `copilot` 匯入流程與 adapter 行為不變
- Out of scope:
  - 新增或修改 `GeminiAdapter` / `ClaudeAdapter` / ChatGPT API server flow
  - 新增 API、檔案上傳能力、session picker 或新的 source type
  - commit / sync / archive 等不可逆操作

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` server（無 Express）
- 禁止新增 runtime dependency
- `AGENTS.md` 規定：scope 變更需人確認；本輪僅做 brief 既有範圍內的 docs/UI copy 補齊

## Done
- 已建立 active change `openspec/changes/adapter-docs-update/`，完成 `proposal.md`、`design.md`、`specs/adapter-docs-update/spec.md`、`tasks.md`，並通過 `openspec validate --changes adapter-docs-update --strict` ✅
- 已更新 `docs/workflows/conversation-schema.md`，補齊 `chatgpt-api` / `gemini` / `claude` / `copilot` 的 V5 支援來源矩陣、來源命名與限制說明 ✅
- 已更新 `/extract` 的 selector hint 與各來源 panel 文案，加入一致格式的「支援格式：...」提示，不改變既有按鈕與匯入流程 ✅
- 已新增 `tools/verify_adapter_docs_update.js`，並重跑 `verify_import_ui_multi_source`、plain / chatgpt / chatgpt-api / gemini / claude / copilot regression，全數 PASS ✅
- 已補 `docs/qa/2026-04-04_adapter-docs-update-smoke.md`、`docs/uiux/2026-04-04_adapter-docs-update-ui-review.md`、`docs/uiux/2026-04-04_adapter-docs-update-ux-review.md` ✅
- 已完成 Review Gate 重查：scope / spec / tasks / QA / UI / UX evidence 與 docs/UI copy 均對齊，`adapter-docs-update` 判定 PASS，可進入 commit / main spec sync / archive 決策 ✅
- 已建立 `openspec/specs/adapter-docs-update/spec.md`，並通過 `openspec validate adapter-docs-update --type spec --strict`，完成 main spec sync ✅
- 已完成 implementation commit 與 `openspec archive adapter-docs-update -y --skip-specs`，active change 已封存至 `openspec/changes/archive/2026-04-04-adapter-docs-update/` ✅

## In Progress
- 無；`adapter-docs-update` 已 archive，待下一步決定是否進入 V5 版本收尾

## Next Step

| 優先 | 說明 |
|:----:|------|
| 🔴 1 | 檢查 `docs/planning/v5-brief.md` 的 Changes 表已全數 archive，並決定是否執行 V5 版本收尾 |
| 🟡 2 | 若要收尾 V5，補 version status / completed date 與 roadmap 對應狀態更新 |
| 🟢 3 | 若暫不做版本收尾，維持 `adapter-docs-update` archive complete 狀態作為下一個 session 起點 |

## Files Touched（本 session）
- docs/workflows/conversation-schema.md
- web/public/extract.html
- web/public/js/extract.js
- tools/verify_adapter_docs_update.js
- openspec/specs/adapter-docs-update/spec.md
- openspec/changes/archive/2026-04-04-adapter-docs-update/proposal.md
- openspec/changes/archive/2026-04-04-adapter-docs-update/design.md
- openspec/changes/archive/2026-04-04-adapter-docs-update/specs/adapter-docs-update/spec.md
- openspec/changes/archive/2026-04-04-adapter-docs-update/tasks.md
- docs/qa/2026-04-04_adapter-docs-update-smoke.md
- docs/uiux/2026-04-04_adapter-docs-update-ui-review.md
- docs/uiux/2026-04-04_adapter-docs-update-ux-review.md
- docs/planning/v5-brief.md
- docs/handoff/current-task.md
- docs/roadmap.md
- docs/system-manual.md
- docs/runlog/2026-04-04_README.md

## Validation Status
- Brief confirmation：✅ `docs/planning/v5-brief.md` 已有人類確認
- Scope gate：✅ `adapter-docs-update` 屬於 V5 In Scope，未擴張到新 adapter / API 功能
- OpenSpec validate：✅ `openspec validate --changes adapter-docs-update --strict`
- Targeted verify：✅ `node tools/verify_adapter_docs_update.js`
- Regression verify：✅ `verify_import_ui_multi_source`、`verify_plain_text_adapter`、`verify_chatgpt_adapter`、`verify_chatgpt_api_auto_import`、`verify_gemini_adapter`、`verify_claude_adapter`、`verify_local_import_vscode_copilot`
- Main spec sync：✅ `openspec/specs/adapter-docs-update/spec.md` + `openspec validate adapter-docs-update --type spec --strict`
- Archive：✅ `openspec archive adapter-docs-update -y --skip-specs`
- Evidence sync：✅ `handoff` / `roadmap` / `brief` / `system-manual` / `runlog` / `docs/qa` / `docs/uiux` 已切到 archive complete / V5 close-ready 狀態
