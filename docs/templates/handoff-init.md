# Handoff 初始化模板

> **用途**：新任務開始時，複製本文件到 `docs/handoff/current-task.md`，填入對應欄位後作為交接主檔。
> **命名**：維持 `current-task.md`（唯一主檔），不加日期後綴。
> **更新時機**：任務開始、子任務完成、遇到 blocker、切換 agent、session 收尾時更新。

---

# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。

## Task
- Name: [REQUIRED] `<任務名稱，通常對應 OpenSpec change name>`
- Owner agent: [REQUIRED] `<目前負責的 agent，如 GitHub Copilot>`
- Started on: [REQUIRED] `<YYYY-MM-DD>`
- Last updated on: [REQUIRED] `<YYYY-MM-DD>`
- Related issue / spec: `<關聯的 issue URL 或 spec 路徑>`
- Branch / worktree: [REQUIRED] `<git branch 名稱>`

## Goal
- [REQUIRED] `<一句話說明這個任務要達成什麼，去除所有模糊描述>`

## Scope
- In scope: [REQUIRED] `<明確列出本任務的範圍邊界>`
- Out of scope: `<明確排除的項目，避免 scope creep>`

## Constraints
- Technical constraints: `<技術限制，如「docs-first」、「不得修改 openspec/archive/」>`
- Product / UX constraints: `<產品或 UX 限制，如「不引入後端 API」>`

## Done
<!-- 已完成的事項，以 bullet 格式列出，每項結尾附上驗證證據的檔案路徑 -->
- `<已完成項目 1>`（證據：`<路徑>`）
- `<已完成項目 2>`

## In Progress
<!-- 正在進行中的事項 -->
- `<進行中項目 1>`

## Next Step
- [REQUIRED] `<下一步要做什麼，具體到可以直接執行的粒度>`

## Validation Status
<!-- 各驗證點的狀態 -->
- `<驗證點名稱>`：`<PASS / FAIL / 未執行>`（`<YYYY-MM-DD>`）

## Safe Continuation Guardrails
<!-- 限制 agent 的安全邊界，防止意外修改 -->
- 允許操作：`<docs/ 範圍>`
- 禁止操作：`<commit / push / reset / checkout 還原>`

## Evidence Paths
<!-- 本任務產出的主要證據檔案路徑 -->
- `<證據 1 路徑>`
- `<證據 2 路徑>`

---

## 填寫範例

```markdown
## Task
- Name: phase10-v2.5-multi-project-shared-capability-mvp
- Owner agent: GitHub Copilot
- Started on: 2026-03-27
- Last updated on: 2026-03-27
- Related issue / spec: Phase 4（V2.5）多專案與共享能力
- Branch / worktree: main

## Goal
- 執行 phase10 的所有 tasks（1.x–6.x），完成 Phase 4 五項工作項目交付。

## Scope
- In scope: Phase 4 change 定義、proposal、tasks、spec 文件建立與治理同步
- Out of scope: 多專案 UI 實作（Phase 5）、後端 API

## Constraints
- Technical constraints: docs-first、smallest safe change
- Product / UX constraints: 不引入後端 API；不破壞 Phase 1–3 產出

## Done
- Phase 3 archive PASS（`openspec/changes/archive/2026-03-26-phase9...`）

## In Progress
- Phase 4 tasks 1.x–6.x 執行中

## Next Step
- 完成 Task 6.2 治理同步後執行 Review Gate → archive

## Validation Status
- strict validate：PASS（2026-03-27，exit 0）
```
