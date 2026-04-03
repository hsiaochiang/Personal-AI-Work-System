# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V3 Change 2 prep — plain-text-adapter-refactor
- Owner agent: Codex
- Last updated on: 2026-04-03

## Goal
- 承接 V3 Change 1 已 archive 的成果，準備下一個 change `plain-text-adapter-refactor`
- 將既有純文字貼上流程抽成 `PlainTextAdapter` 並對接 `ConversationDoc`
- 維持既有 `/extract` 流程可用，不破壞 V2/V3 目前基線

## Scope
- In scope: V3 Change 2 preflight（`plain-text-adapter-refactor` 的開工準備）
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

## In Progress
- 下一個建議 change：`plain-text-adapter-refactor`（尚未建立 / 尚未開始）

## Next Step

| 優先 | Change | 說明 |
|:----:|--------|------|
| 🔴 1 | `plain-text-adapter-refactor` | 建議作為 V3 Change 2 執行下一個 `#opsx-new`；目標是把既有純文字流程抽成 `PlainTextAdapter` 並接上 `ConversationDoc` |
| 🟡 2 | `chatgpt-adapter` | 建議在 Change 2 穩定後再進入 ChatGPT 半自動匯入 |
| 🟡 3 | 確認 V4 Brief | `docs/planning/v4-brief.md` 使用者確認後填入確認日期 |

## Files Touched（本 session）
- docs/planning/v3-brief.md (新建)
- docs/planning/v4-brief.md (新建)
- docs/workflows/conversation-schema.md (新建)
- openspec/changes/archive/2026-04-03-conversation-schema-definition/ (archive 完成)
- openspec/specs/conversation-schema/spec.md (新建；`#opsx-sync`)
- docs/handoff/current-task.md
- docs/handoff/blockers.md
- docs/runlog/2026-04-03_README.md
- docs/planning/v3-brief.md (更新：change 狀態)
- docs/system-manual.md

## Validation Status
- OpenSpec strict validate：✅ PASS（`conversation-schema-definition`）
- OpenSpec apply progress：✅ 9/9 completed（state: `all_done`）
- Main spec strict validate：✅ PASS（`conversation-schema`）
- Review Gate：✅ PASS（Manual Sync + `#opsx-sync` completed 後已 archive）
- Template verify: ✅ PASS (v1.5.0)
- Style guide: ✅ FROZEN
- Git：⏳ 本 session 尚未 commit / push（含 archive 與治理文件更新）
