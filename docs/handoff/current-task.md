# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V3 Change 2 execution — plain-text-adapter-refactor
- Owner agent: Codex
- Last updated on: 2026-04-03

## Goal
- 承接 V3 Change 1 已 archive 的成果，實作 `plain-text-adapter-refactor`
- 將既有純文字貼上流程抽成 `PlainTextAdapter` 並對接 `ConversationDoc`
- 維持既有 `/extract` 流程可用，不破壞 V2/V3 目前基線

## Scope
- In scope: V3 Change 2 runtime refactor（artifact + apply + verify）
- Out of scope: `chatgpt-adapter`、`local-import-vscode-copilot`、`source-attribution-in-memory`、`import-ui-multi-source`

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` 模組 server（無 Express）
- 禁止引入任何前端框架或打包工具
- 新增依賴需先記錄決策

## Done
- Phase 1–5：V1 全數完成 ✅
- V2 Changes 1–4 全部完成並 archive ✅
- Roadmap 重構為單一真源（V1–V4）✅
- 升級 copilot-workspace-template v1.6.0 + Style Guide FROZEN ✅ `8a80f9a`
- **V3 brief 使用者確認** ✅ 2026-04-02（auto-import 範圍已依可行性評估修訂）
- V4 brief 草擬完成 ✅（使用者尚未確認）
- **V3 Change 1 `#opsx-new` 完成** ✅（`conversation-schema-definition` proposal/design/specs/tasks 全部建立）
- `docs/workflows/conversation-schema.md` 已建立 ✅（定義 `ConversationMessage` / `ConversationDoc`）
- **V3 Change 1 `#opsx-apply` 完成** ✅（tasks 9/9 勾選完成）
- OpenSpec strict validate 再驗證 ✅（`conversation-schema-definition`）
- **V3 Change 1 `#opsx-sync` 完成** ✅（`openspec/specs/conversation-schema/spec.md`）
- **V3 Change 1 `#opsx-archive` 完成** ✅ 2026-04-03（`openspec/changes/archive/2026-04-03-conversation-schema-definition/`）
- **V3 Change 2 `#opsx-new` 完成** ✅（`openspec/changes/plain-text-adapter-refactor/` 已建立）
- **V3 Change 2 `#opsx-ff` 完成** ✅（`proposal/design/specs/tasks` 全部建立）
- **V3 Change 2 strict validate** ✅ PASS（`plain-text-adapter-refactor`）
- **V3 Change 2 `#opsx-apply` 完成** ✅（tasks 7/7 勾選完成）
- **V3 Change 2 `#opsx-sync` 完成** ✅（`openspec/specs/plain-text-adapter/spec.md`）
- **V3 Change 2 Review Gate** ✅ PASS（已修正 ISO 驗證與 UI review 證據）
- **V3 Change 2 `#opsx-archive` 完成** ✅ 2026-04-03（`openspec/changes/archive/2026-04-03-plain-text-adapter-refactor/`）
- `PlainTextAdapter` shared module + `/extract` `ConversationDoc` 入口已完成 ✅
- `docs/qa/2026-04-03_plain-text-adapter-smoke.md` 已建立 ✅

## In Progress
- 下一個建議 change：`chatgpt-adapter`（尚未建立 / 尚未開始）

## Next Step

| 優先 | Change | 說明 |
|:----:|--------|------|
| 🔴 1 | `chatgpt-adapter` | 建議作為 V3 Change 3 執行下一個 `#opsx-new`；目標是支援 ChatGPT 貼上 / 匯出格式轉成 `ConversationDoc` |
| 🟡 2 | `local-import-vscode-copilot` | 建議在 ChatGPT adapter 穩定後再進入 VS Code Copilot 本機自動匯入 |
| 🟡 3 | 確認 V4 Brief | `docs/planning/v4-brief.md` 使用者確認後填入確認日期 |

## Files Touched（本 session）
- docs/planning/v3-brief.md (新建)
- docs/planning/v4-brief.md (新建)
- docs/workflows/conversation-schema.md (新建)
- openspec/changes/archive/2026-04-03-conversation-schema-definition/ (archive 完成)
- openspec/specs/conversation-schema/spec.md (新建；`#opsx-sync`)
- openspec/specs/plain-text-adapter/spec.md (新建；`#opsx-sync`)
- docs/handoff/current-task.md
- docs/handoff/blockers.md
- docs/runlog/2026-04-03_README.md
- docs/planning/v3-brief.md (更新：change 狀態)
- docs/system-manual.md
- openspec/changes/plain-text-adapter-refactor/proposal.md
- openspec/changes/plain-text-adapter-refactor/design.md
- openspec/changes/plain-text-adapter-refactor/specs/plain-text-adapter/spec.md
- openspec/changes/plain-text-adapter-refactor/tasks.md
- web/public/js/conversation-adapters.js
- web/public/js/extract.js
- web/public/extract.html
- web/server.js
- tools/verify_plain_text_adapter.js
- docs/qa/2026-04-03_plain-text-adapter-smoke.md
- docs/uiux/2026-04-03_ui-review.md
- openspec/changes/archive/2026-04-03-plain-text-adapter-refactor/ (archive 完成)

## Validation Status
- OpenSpec strict validate：✅ PASS（`conversation-schema-definition`）
- OpenSpec apply progress：✅ 9/9 completed（state: `all_done`）
- Main spec strict validate：✅ PASS（`conversation-schema`）
- Review Gate：✅ PASS（Manual Sync + `#opsx-sync` completed 後已 archive）
- OpenSpec strict validate：✅ PASS（`plain-text-adapter-refactor`）
- Main spec strict validate：✅ PASS（`plain-text-adapter`）
- PlainTextAdapter verify：✅ PASS（`node tools/verify_plain_text_adapter.js`）
- UI review：✅ PASS（`docs/uiux/2026-04-03_ui-review.md`）
- Template verify: ⚠️ 未執行（本機無可用 Python；template repo `.venv` shim 指向失效路徑）
- Style guide: ✅ FROZEN
- Git：⏳ 本 session 尚未 commit / push（含 Change 2 sync + archive + 治理文件更新）
