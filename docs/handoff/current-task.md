# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V3 Change 1 — conversation-schema-definition
- Owner agent: Codex
- Last updated on: 2026-04-02

## Goal
- 建立 `ConversationMessage` / `ConversationDoc` schema 定義（`docs/workflows/conversation-schema.md`）
- 為所有後續 V3 adapter 建立共用型別基線
- 不改動現有 extraction 邏輯（純 schema definition + 文件）

## Scope
- In scope: V3 Change 1（`conversation-schema-definition`）
- Out of scope: 其他 V3 changes 尚未開始

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

## In Progress
- V3 Change 1：ready for archive（等待人工確認是否執行 `#opsx-archive`）

## Next Step

| 優先 | Change | 說明 |
|:----:|--------|------|
| 🔴 1 | `conversation-schema-definition` | 已完成 `#opsx-new` + `#opsx-apply`；待人工確認後可執行 `#opsx-archive` |
| 🟡 2 | `plain-text-adapter-refactor` | 建議在 Change 1 archive 後執行下一個 `#opsx-new` |
| 🟡 3 | 確認 V4 Brief | `docs/planning/v4-brief.md` 使用者確認後填入確認日期 |

## Files Touched（本 session）
- docs/planning/v3-brief.md (新建)
- docs/planning/v4-brief.md (新建)
- docs/workflows/conversation-schema.md (新建)
- openspec/changes/conversation-schema-definition/proposal.md (新建)
- openspec/changes/conversation-schema-definition/design.md (新建)
- openspec/changes/conversation-schema-definition/specs/conversation-schema/spec.md (新建)
- openspec/changes/conversation-schema-definition/tasks.md (更新：9/9 task 勾選完成)
- docs/handoff/current-task.md
- docs/planning/v3-brief.md (更新：change 狀態)
- docs/system-manual.md

## Validation Status
- OpenSpec strict validate：✅ PASS（`conversation-schema-definition`）
- OpenSpec apply progress：✅ 9/9 completed（state: `all_done`）
- Template verify: ✅ PASS (v1.5.0)
- Style guide: ✅ FROZEN
- Git：⏳ 本 session 尚未 push（含 V3 Change 1 `#opsx-new` + `#opsx-apply` 產出）
