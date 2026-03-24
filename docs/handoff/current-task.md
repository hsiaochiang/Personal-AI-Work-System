# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。

## Task
- Name: `phase1-entrypoint-guidance-pilot` 第 2 次比較型手動 workflow pilot 實跑與留痕
- Owner agent: GitHub Copilot
- Started on: 2026-03-24
- Last updated on: 2026-03-24
- Related issue / spec: V1 Phase 1 第 2 次手動 workflow 驗證
- Branch / worktree: `main`

## Goal
- 以第 1 次 pilot 的 QA 發現為基線，完成第 2 次手動 workflow pilot 實跑，驗證入口順序收斂與 `openspec instructions` / `openspec change validate` 指引是否能實際降低啟動摩擦。

## Scope
- In scope: 收斂 `phase1-entrypoint-guidance-pilot` 的 change name、scope、non-scope、acceptance criteria、主要風險與交棒內容；以第 1 次 pilot 的 QA 記錄為基線定義可比較的第 2 次 pilot 驗收方式
- Out of scope: 正式 UI、多工具同步、半自動提取 MVP、向量資料庫、handoff 模板大改、一次完成多輪模板重寫或流程重構

## Constraints
- Technical constraints: 以 `docs/qa/2026-03-24_smoke.md` 的摩擦點作為直接輸入；不重做第 1 次 pilot 的同質內容；不改 managed rules
- Product / UX constraints: 第 2 次 pilot 必須能和第 1 次 pilot 做可比較驗證，證明是否真的比第一次更順，而不是只留下主觀感受

## Implementation Plan
- Step 1: 以第 1 次 pilot 的 QA 與 main spec 為基線，收斂第 2 次 pilot 的驗證目標
- Step 2: 將第 2 次 pilot 壓縮到入口順序、artifact 反查與 validate 命令使用三個可比較面向
- Step 3: 寫回 handoff / roadmap / runlog，準備交給 Executor 建立下一個 change

## Done
- 已完成 `phase1-single-workflow-pilot` 的 main spec sync，並以 `openspec archive phase1-single-workflow-pilot -y --skip-specs` 成功歸檔
- 已確認 archived change 名稱為 `2026-03-24-phase1-single-workflow-pilot`
- 已用 OpenSpec Planner 收斂第 2 次 pilot 的 change，建議名稱為 `phase1-entrypoint-guidance-pilot`
- 已確認第 2 次 pilot 應聚焦驗證入口順序、artifact 反查與 strict validate 命令認知是否較第 1 次順暢
- 已用 OpenSpec CLI 建立 `openspec/changes/phase1-entrypoint-guidance-pilot/` active change 骨架
- 已補齊 proposal、design、tasks 與 delta spec，讓第 2 次 pilot 可被 strict validate
- 已執行 `openspec change validate phase1-entrypoint-guidance-pilot --strict`，結果 PASS
- 已依固定入口順序 `AGENTS.md` → `docs/handoff/current-task.md` → `docs/handoff/blockers.md` → `docs/roadmap.md` → `docs/agents/commands.md` 啟動第 2 次 pilot，並記錄實際閱讀順序
- 已直接使用 `openspec instructions proposal/specs/design/tasks --change phase1-entrypoint-guidance-pilot` 取得 artifact 格式，未重演 help 試錯
- 已再次執行 `openspec change validate phase1-entrypoint-guidance-pilot --strict` 與 workspace `--verify-only` smoke，結果皆為 PASS
- 已完成第 2 次 pilot 的比較型 QA、tasks、runlog、roadmap、UI review 與 UX review 同步
- 已確認第 2 次 pilot 比第 1 次更順：沒有重演 artifact 反查摩擦與 validate 命令誤判，且入口掃描已收斂到既定順序

## In Progress
- 等待人工確認是否進入 code review / commit / sync / archive；本次依要求停在 commit 前

## Next Step
- 先做 code review，確認本次治理證據變更沒有混入 worktree 中與本次 change 無關的既有未提交修改
- 若 review 無 blocker，再依序進行 commit / sync / archive，並保留第 1 次與第 2 次 pilot 的比較證據鏈
- 若後續仍要補強入口指引，只能針對比較型 QA 仍留存的最小摩擦點做修正，不把 handoff 模板重寫納入本次 change

## Files Touched
- `openspec/changes/phase1-entrypoint-guidance-pilot/tasks.md`
- `docs/qa/2026-03-24_smoke.md`
- `docs/uiux/2026-03-24_ui-review.md`
- `docs/uiux/2026-03-24_ux-review.md`
- `docs/roadmap.md`
- `docs/handoff/current-task.md`
- `docs/runlog/2026-03-24_README.md`
- `docs/decision-log.md`
- `docs/decisions/2026-03-24_phase1-entrypoint-guidance-pilot-evidence-span.md`

## Key Symbols / Entry Points
- `2026-03-24-phase1-single-workflow-pilot`
- `phase1-entrypoint-guidance-pilot`
- `openspec instructions proposal --change phase1-entrypoint-guidance-pilot`
- `openspec instructions specs --change phase1-entrypoint-guidance-pilot`
- `openspec instructions design --change phase1-entrypoint-guidance-pilot`
- `openspec instructions tasks --change phase1-entrypoint-guidance-pilot`
- `openspec change validate phase1-entrypoint-guidance-pilot --strict`
- `openspec archive phase1-single-workflow-pilot -y --skip-specs`
- `docs/roadmap/v1-roadmap.md`
- `docs/qa/2026-03-24_smoke.md`

## Interfaces / Contracts Affected
- API / schema / types:
- UI contract / user flow: 第 2 次 pilot 應驗證固定入口順序 `AGENTS.md` → handoff → roadmap → commands 是否足以降低啟動摩擦
- Config / env / migration: `manual-workflow-pilot` 已同步到 main specs；第一個 pilot 已 archive，下一個 change 可直接建立在 main spec 基線上

## Risks / Watchouts
- 若第 2 次 pilot 沒有強制留下比較型 QA，仍會退化成單純再跑一次流程，無法證明啟動摩擦是否下降
- 若把 current-task 欄位密度問題擴大成模板重寫，會偏離本次 change 主題
- 若沒有明確鎖定 `openspec instructions` 與 `openspec change validate` 的使用方式，CLI 摩擦可能再次重演

## Validation Status
- Commands run: `openspec instructions proposal --change phase1-entrypoint-guidance-pilot`；`openspec instructions specs --change phase1-entrypoint-guidance-pilot`；`openspec instructions design --change phase1-entrypoint-guidance-pilot`；`openspec instructions tasks --change phase1-entrypoint-guidance-pilot`；`openspec change validate phase1-entrypoint-guidance-pilot --strict`；`d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --verify-only --root D:/program/Personal-AI-Work-System`
- Result: PASS；第 2 次 pilot 已完成比較型 workflow 實跑，artifact 指引、strict validate 與 workspace smoke 皆已留下證據
- Not run yet: code review、commit / push、active change sync / archive

## Rollback / Recovery Notes
- 若要回退模板導入內容，可依 git diff 分別撤回 managed 導入 commit 或專案治理回填 commit；不要直接手動刪 template lock

## Pending Decisions
- 是否在第 2 次 pilot 後再決定 current-task 某些欄位是否需要結構調整

## Notes for Next Agent
- 第 1 次 pilot 已 archived，歷史證據入口為 `openspec/changes/archive/2026-03-24-phase1-single-workflow-pilot/`
- 第 2 次 pilot 的比較型 QA 已寫入 `docs/qa/2026-03-24_smoke.md`，不要再重做一次沒有比較基線的同質驗證
- 若要往下執行，下一步應先做 code review，再決定是否 commit / sync / archive `phase1-entrypoint-guidance-pilot`
