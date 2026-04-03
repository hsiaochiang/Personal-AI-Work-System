# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V3 executor — import-ui-multi-source
- Owner agent: Codex
- Last updated on: 2026-04-04

## Goal
- 完成 `import-ui-multi-source` 的 OpenSpec `new` / `ff` / `apply` / `verify`
- 在 `/extract` 收斂工具來源 selector、per-source import controls 與 candidate source 顯示
- 維持既有 Copilot / ChatGPT / plain text 匯入能力與 source metadata writeback，不擴大到新 adapter

## Scope
- In scope:
  - 建立 `openspec/changes/import-ui-multi-source/` active change artifacts
  - 實作 `/extract` 的工具來源 selector 與 per-source UI / routing
  - 在候選審核階段顯示來源 badge / source summary
  - 補 verify、QA / UI / UX 證據與 handoff / manual / runlog 同步
- Out of scope:
  - 新增 Gemini / Claude / Antigravity adapter
  - ChatGPT / Copilot parser 大改或新 server API 架構
  - 多 session merge / 搜尋 / preview-rich picker
  - 新的 metadata schema 或 memory writeback 格式
  - release
  - 新依賴 / 前端框架 / build tool

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` 模組 server（無 Express）
- 禁止引入任何前端框架或打包工具
- 新增依賴需先記錄決策
- `AGENTS.md` 規定：archive / release 類不可逆操作需人工確認

## Done
- Phase 1–5：V1 全數完成 ✅
- V2 Changes 1–4 全部完成並 archive ✅
- V3 brief 使用者確認 ✅（2026-04-02）
- V3 Change 1 `conversation-schema-definition` 已 archive ✅
- V3 Change 2 `plain-text-adapter-refactor` 已 archive ✅
- V3 Change 3 `chatgpt-adapter` 已 archive ✅
- V3 Change 4 `local-import-vscode-copilot` 已 sync / archive / git 收尾 ✅
- V3 Change 5 `source-attribution-in-memory` 已 sync / archive 收尾 ✅
- `openspec new change import-ui-multi-source` 已完成，active change 目錄已建立 ✅
- `import-ui-multi-source` proposal / design / spec / tasks 已建立並通過 strict validate ✅
- `/extract` 既有能力基線已確認：
  - VS Code Copilot 本機 session list / path override / 單一 session 載入
  - ChatGPT transcript / JSON 匯入
  - plain text fallback
- `docs/planning/v3-brief.md` 已列出 `import-ui-multi-source` 的使用者故事、備註與使用方式 ✅
- Planner scope gate 已完成：本 change 屬於 V3 brief In Scope D「Import UI（匯入入口改版）」✅
- Executor preflight 已完成：`main` branch、`openspec/config.yaml`、V3 brief 使用者確認、無 active duplicate change ✅
- `/extract` 已完成工具來源 selector、per-source controls 與 candidate source badge 實作 ✅
- targeted verify `node tools/verify_import_ui_multi_source.js` PASS，plain / chatgpt / copilot regressions 全 PASS ✅
- `docs/qa/2026-04-04_import-ui-multi-source-smoke.md`、`docs/uiux/2026-04-04_ui-review.md`、`docs/uiux/2026-04-04_ux-review.md` 已補齊 ✅

## In Progress
- `import-ui-multi-source` 已完成 verify，待 Review Gate 判定是否進入 sync / archive
- template verify 目前被 `.github/prompts/openspec-execute.prompt.md` 缺檔阻塞；需先確認是否為模板漂移或指令文件過期

## Next Step

| 優先 | Change | 說明 |
|:----:|--------|------|
| 🔴 1 | `import-ui-multi-source` | 交給 Review Gate，判定是否可進入 `#opsx-sync` / `#opsx-archive` |
| 🟡 2 | Sync / archive | 若 Review Gate PASS，執行 main spec sync；archive 需人工確認 |
| 🟡 3 | V3 收尾 | 若 Change 6 archive，評估 V3 brief / roadmap 是否可進入版本收尾 |

## Files Touched（本 session）
- openspec/changes/import-ui-multi-source/proposal.md
- openspec/changes/import-ui-multi-source/design.md
- openspec/changes/import-ui-multi-source/specs/import-ui-multi-source/spec.md
- openspec/changes/import-ui-multi-source/tasks.md
- web/public/extract.html
- web/public/js/extract.js
- web/public/css/style.css
- tools/verify_import_ui_multi_source.js
- tools/verify_plain_text_adapter.js
- docs/qa/2026-04-04_import-ui-multi-source-smoke.md
- docs/uiux/2026-04-04_ui-review.md
- docs/uiux/2026-04-04_ux-review.md
- docs/roadmap.md
- docs/planning/v3-brief.md
- docs/handoff/current-task.md
- docs/system-manual.md
- docs/runlog/2026-04-04_README.md

## Validation Status
- V3 brief confirmation：✅ PASS（2026-04-02，Wilson）
- Scope gate：✅ PASS（change 屬於 V3 brief In Scope D「Import UI」範圍）
- Duplicate change gate：✅ PASS（建立前確認無同名 / 同目的 active change；`openspec list --json` 為空）
- Executor preflight：✅ PASS（`main` branch、`openspec/config.yaml`、brief 使用者確認、`openspec new change import-ui-multi-source`）
- Strict validate：✅ PASS（`openspec validate import-ui-multi-source --strict`）
- Targeted verify：✅ PASS（`node tools/verify_import_ui_multi_source.js`）
- Regression verify：✅ PASS（plain / chatgpt / local-import-vscode-copilot 全 PASS）
- Template verify：⚠️ FAIL（`tools/bootstrap_copilot_workspace.py --verify-only` 回報缺少 `.github/prompts/openspec-execute.prompt.md`）
