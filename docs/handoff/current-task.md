# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。

## Task
- Name: `phase1-entrypoint-guidance-pilot` active change 建立與交棒
- Owner agent: GitHub Copilot
- Started on: 2026-03-24
- Last updated on: 2026-03-24
- Related issue / spec: V1 Phase 1 第 2 次手動 workflow 驗證
- Branch / worktree: `main`

## Goal
- 以第 1 次 pilot 的 QA 發現為基線，規劃第 2 次手動 workflow pilot，驗證入口順序收斂與 `openspec instructions` 提示補強是否能實際降低啟動摩擦。

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

## In Progress
- 等待 Executor 依既有 artifacts 執行第 2 次手動 workflow pilot，並留下比較型 QA 證據

## Next Step
- 以 `phase1-entrypoint-guidance-pilot` 作為 active change，交給 Executor 執行第 2 次手動 workflow pilot
- 第 2 次 pilot 驗收時，必須直接對照第 1 次 QA：是否仍需要過度掃描入口、是否仍靠試錯才知道 artifacts 格式、是否仍誤用 validate 命令
- 不將 handoff 模板重寫當成第 2 次 change 主體；若仍有欄位密度問題，只做最小說明補強

## Files Touched
- `openspec/changes/phase1-entrypoint-guidance-pilot/.openspec.yaml`
- `openspec/changes/phase1-entrypoint-guidance-pilot/README.md`
- `openspec/changes/phase1-entrypoint-guidance-pilot/proposal.md`
- `openspec/changes/phase1-entrypoint-guidance-pilot/design.md`
- `openspec/changes/phase1-entrypoint-guidance-pilot/tasks.md`
- `openspec/changes/phase1-entrypoint-guidance-pilot/specs/entrypoint-guidance-pilot/spec.md`
- `openspec/specs/manual-workflow-pilot/spec.md`
- `docs/decision-log.md`
- `docs/roadmap.md`
- `docs/handoff/current-task.md`
- `docs/handoff/blockers.md`
- `docs/runlog/2026-03-24_README.md`

## Key Symbols / Entry Points
- `2026-03-24-phase1-single-workflow-pilot`
- `phase1-entrypoint-guidance-pilot`
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
- Commands run: `openspec archive phase1-single-workflow-pilot -y`（失敗，因 main spec 已先同步導致 requirement 重複）；`openspec archive phase1-single-workflow-pilot -y --skip-specs`（成功）；OpenSpec Planner 第 2 次 pilot change 定義收斂（2026-03-24）
- Result: PASS；第 1 次 pilot 已完成 main spec sync 與 archive，且第 2 次 pilot 的 active change 已建立並通過 strict validate
- Not run yet: 第 2 次 pilot 的實際 workflow 執行、比較型 QA、後續 commit / push / archive

## Rollback / Recovery Notes
- 若要回退模板導入內容，可依 git diff 分別撤回 managed 導入 commit 或專案治理回填 commit；不要直接手動刪 template lock

## Pending Decisions
- 是否在第 2 次 pilot 後再決定 current-task 某些欄位是否需要結構調整

## Notes for Next Agent
- 第 1 次 pilot 已 archived，歷史證據入口為 `openspec/changes/archive/2026-03-24-phase1-single-workflow-pilot/`
- 第 2 次 pilot 的直接輸入應先讀 `docs/qa/2026-03-24_smoke.md`，不要重新做一次沒有比較基線的同質驗證
- 若要往下執行，下一步應直接使用現有 `phase1-entrypoint-guidance-pilot` artifacts 開始第 2 次實跑
