# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: Planner preflight — V4 Change 4 `cross-project-shared-knowledge`
- Owner agent: Codex / Copilot
- Last updated on: 2026-04-04

## Goal
- 完成 `cross-project-shared-knowledge` 的 Planner scope gate，整理可交給下一個 Executor session 的 change 定義
- 鎖定最小可行範圍：跨專案掃描 shared candidates、建立 `docs/shared/` 輸出與 `/shared` 或 `/memory` 的讀取型呈現
- 維持 suggestion-only / human-confirm 邊界，不擴大到自動搬移 memory、writeback action、scheduler 或跨專案規則治理

## Scope
- In scope:
  - 確認 `cross-project-shared-knowledge` 位於 `docs/planning/v4-brief.md` 的 In Scope，且使用者確認已存在
  - 盤點現況：`web/projects.json` 多專案設定、`web/server.js` 目前只有 per-project memory API、repo 尚無 `docs/shared/` 與 `/shared`
  - 定義最小 change 邊界、acceptance criteria、主要風險與 Executor handoff
- Out of scope:
  - 自動搬移或合併各專案 `docs/memory/*.md` 內容
  - writeback action、auto-fix、governance scheduler、cross-project rule conflict 推論
  - LLM / embeddings / 向量搜尋 / 新 dependency
  - commit / sync / archive 等需人工確認的不可逆操作

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` 模組 server（無 Express）
- 禁止引入任何前端框架或打包工具
- 新增依賴需先記錄決策
- `AGENTS.md` 規定：archive / release 類不可逆操作需人工確認

## Done
- V1–V3 全部完成，V3 六個 changes 已 archive ✅
- V4 brief 已有使用者確認（2026/4/4）✅
- `rule-conflict-detection-v2` 已完成 Review Gate、main spec sync 與 archive；封存路徑：`openspec/changes/archive/2026-04-04-rule-conflict-detection-v2/` ✅
- `cross-project-shared-knowledge` 已存在於 `docs/planning/v4-brief.md` 的 Changes 表，且使用者故事 / 使用方式已填寫 ✅
- Planner preflight 已完成：brief confirmation gate、scope gate、無同名 active duplicate change ✅
- 已盤點現況：`web/projects.json` 目前有 `personal-ai` 與 `mock-test` 兩個專案；server 只支援 per-project `docs/memory` 讀取；repo 尚無 `docs/shared/` 與 `/shared` ✅

## In Progress
- 整理 `cross-project-shared-knowledge` 的最小 change 邊界、acceptance criteria 與風險
- 準備交棒給下一個 Executor session

## Next Step

| 優先 | 說明 |
|:----:|------|
| 🔴 1 | 若要推進 V4，開新 session 執行 `docs/agents/codex-prompts/v4/11-cross-project-shared-knowledge-execute.md`，但只限本次 planner 定義的 suggestion-only shared knowledge 範圍 |
| 🟡 2 | template verify blocker 仍保留待後續決策，不與本 change 綁定處理 |
| 🟡 3 | 後續若擴充 rule conflict heuristic，優先補 false-positive guard 與 targeted verify，而不是先擴大 signal dictionary |

## Files Touched（本 session）
- docs/agents/codex-prompts/v4/10-cross-project-shared-knowledge-plan.md
- openspec/specs/rule-conflict-detection-v2/spec.md
- openspec/changes/archive/2026-04-04-rule-conflict-detection-v2/
- docs/planning/v4-brief.md
- docs/roadmap.md
- docs/runlog/2026-04-04_README.md
- docs/handoff/current-task.md
- docs/system-manual.md

## Validation Status
- Brief confirmation gate：✅ V4 brief 已確認（2026/4/4），`cross-project-shared-knowledge` 位於 In Scope / Changes 表
- Duplicate change check：✅ `openspec/changes/` 無同名 active duplicate；`rule-conflict-detection-v2` 已完成 archive，不再阻塞 Change 4
- Baseline inspection：✅ 已確認多專案設定來自 `web/projects.json`，`/api/memory` 目前只讀取單一 `projectId` 的 `docs/memory`
- Shared knowledge baseline：✅ repo 尚無 `docs/shared/` 目錄、`/shared` 頁面或跨專案 shared API，可作為本 change regression 基線
