# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。

## Task
- Name: `phase1-single-workflow-pilot` 單次手動 workflow pilot 執行與留痕
- Owner agent: GitHub Copilot
- Started on: 2026-03-24
- Last updated on: 2026-03-24
- Related issue / spec: V1 Phase 1 手動 workflow 驗證
- Branch / worktree: `main`

## Goal
- 用本 repo 既有治理檔與 OpenSpec 流程，完成 1 次可追溯、可重播的手動 workflow pilot，並把實際摩擦與最小修補寫回 repo。

## Scope
- In scope: 建立 `phase1-single-workflow-pilot` 的 OpenSpec artifacts、執行一次真實手動 workflow、回填 handoff / runlog / roadmap / QA / 專案記憶、記錄摩擦點與最小必要修正
- Out of scope: 正式 UI、多工具同步、半自動提取 MVP、向量資料庫、一次完成 2 到 3 次對話驗證、整體模板大改

## Constraints
- Technical constraints: 維持 smallest safe change；只修正本次 pilot 直接暴露的流程說明、欄位與使用順序；不改 managed rules
- Product / UX constraints: pilot 結束後，下一位 agent 應只靠 repo 內現有文件就能接續下一次手動 workflow

## Implementation Plan
- Step 1: 用 OpenSpec CLI 建立 change 骨架，補齊 proposal / design / tasks / delta spec
- Step 2: 執行 strict validate 與 repo smoke，確認手動 workflow 可被文件重播
- Step 3: 將摩擦點、可用入口與最小修正寫回 governance、QA 與 memory

## Done
- 已確認本機 `openspec` CLI 可用，版本為 `1.2.0`
- 已用 OpenSpec CLI 建立 `openspec/changes/phase1-single-workflow-pilot/` 骨架
- 已補齊 proposal、design、tasks 與 delta spec，讓第一個 change 可被 strict validate
- 已完成 1 次真實手動 workflow pilot 的治理留痕，包含 handoff、runlog、QA、UI/UX review 與專案記憶更新
- 已記錄本次 pilot 的實際摩擦點、未使用欄位與最小修正建議
- 已依 Review Gate 建議修正 `docs/agents/commands.md` 的 strict validate 命令入口，解除主要 replayability blocker

## In Progress
- 依已通過的 Gate 結論執行本次 pilot 的 scoped commit / push，完成後再決定是否 sync / archive

## Next Step
- 完成本次 pilot 的 scoped commit / push，避免混入 worktree 內其他無關變更
- commit / push 後，評估是否將本次 change sync / archive
- 若先不做不可逆操作，下一位 agent 可直接依本次 artifacts 與 QA 紀錄啟動第 2 次手動 workflow 驗證
- 第 2 次 pilot 應優先驗證這次列出的摩擦點是否已明顯下降，不要擴大到 Phase 2 自動化

## Files Touched
- `openspec/changes/phase1-single-workflow-pilot/.openspec.yaml`
- `openspec/changes/phase1-single-workflow-pilot/README.md`
- `openspec/changes/phase1-single-workflow-pilot/proposal.md`
- `openspec/changes/phase1-single-workflow-pilot/design.md`
- `openspec/changes/phase1-single-workflow-pilot/tasks.md`
- `openspec/changes/phase1-single-workflow-pilot/specs/manual-workflow-pilot/spec.md`
- `docs/agents/commands.md`
- `docs/decision-log.md`
- `docs/roadmap.md`
- `docs/handoff/current-task.md`
- `docs/handoff/blockers.md`
- `docs/runlog/2026-03-24_README.md`
- `docs/qa/2026-03-24_smoke.md`
- `docs/uiux/2026-03-24_ui-review.md`
- `docs/uiux/2026-03-24_ux-review.md`
- `docs/memory/task-patterns.md`

## Key Symbols / Entry Points
- `phase1-single-workflow-pilot`
- `openspec change validate phase1-single-workflow-pilot --strict`
- `docs/roadmap/v1-roadmap.md`
- `docs/agents/project-context.md`
- `docs/agents/commands.md`

## Interfaces / Contracts Affected
- API / schema / types:
- UI contract / user flow: 第一次 pilot 已確認流程入口以 `AGENTS.md`、handoff、roadmap、project-context、commands 組合最可重播；結尾需同步 QA、runlog 與至少一份專案記憶
- Config / env / migration: 本 repo 現可用 OpenSpec CLI 驗證 active change；未引入新 runtime、無 migration

## Risks / Watchouts
- 若第一個 change 同時要求 2 到 3 次對話驗證，會把 pilot、比較與模板收斂混成一個範圍過大的 change
- 若 pilot 沒有明確要求證據鏈，最後可能只留下主觀感受，無法判定 workflow 是否真的可重播
- 單次 pilot 只能證明流程可跑通，不能代表整個 Phase 1 已完成
- commit / push / archive 屬不可逆操作，仍需人工確認後再執行

## Validation Status
- Commands run: `openspec new change phase1-single-workflow-pilot --description "以一次完整、真實、手動的 workflow 驗證作為第一個 Phase 1 pilot"`；`openspec instructions proposal --change phase1-single-workflow-pilot`；`openspec instructions specs --change phase1-single-workflow-pilot`；`openspec instructions design --change phase1-single-workflow-pilot`；`openspec change validate phase1-single-workflow-pilot --strict`；`d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --verify-only --root D:/program/Personal-AI-Work-System`
- Result: PASS；active change strict validate 與 repo smoke 均通過，且已留下可重播的 pilot 證據鏈。Review Gate 指出的主要 blocker 已透過修正 `docs/agents/commands.md` 解除
- Not run yet: sync / archive

## Rollback / Recovery Notes
- 若要回退模板導入內容，可依 git diff 分別撤回 managed 導入 commit 或專案治理回填 commit；不要直接手動刪 template lock

## Pending Decisions
- 是否在 commit / push 後立刻 sync / archive 本次 change

## Notes for Next Agent
- 本次 pilot 的主要證據入口是 `openspec/changes/phase1-single-workflow-pilot/`、`docs/qa/2026-03-24_smoke.md`、`docs/runlog/2026-03-24_README.md`
- 若要啟動下一次手動 workflow，先讀 QA 的摩擦紀錄，再依 current-task 的 Next Step 接續
- 若要正式收尾，先取得人工對 commit / push / archive 的確認
