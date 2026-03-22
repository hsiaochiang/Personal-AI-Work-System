# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。

## Task
- Name: 模板導入後的治理骨架回填與提交拆分
- Owner agent: GitHub Copilot
- Started on: 2026-03-21
- Last updated on: 2026-03-22
- Related issue / spec: `copilot-workspace-template` v1.3.0 套用與治理收斂
- Branch / worktree: `main`

## Goal
- 讓本專案在導入最新版模板後，保留模板邊界帶來的升級能力，同時把 protected / init-only 檔補成專案真實內容，避免後續 agent 仍讀到模板骨架。

## Scope
- In scope: 回填 `docs/agents/project-context.md`、`docs/agents/commands.md`、`docs/decision-log.md`、`docs/roadmap.md`、handoff、runlog 與 `.github/copilot/rules/90-project-custom.md`
- Out of scope: 新增執行型 app、導入新 dependency、開始實作 V1 半自動提取或 UI

## Constraints
- Technical constraints: 保持模板 managed files 不在下游直接修改；專案事實以 `docs/memory/`、`docs/planning/`、`docs/roadmap/` 既有內容為準
- Product / UX constraints: 治理檔要能被 WOS / OpenSpec 直接讀懂，不再依賴人工補充說明

## Implementation Plan
- Step 1: 接受模板導入成果，確認 managed / protected / init-only 邊界已穩定
- Step 2: 回填 protected 與 init-only 檔，讓本專案的背景、命令、handoff、runlog 可直接使用
- Step 3: 將 commit 拆成「模板導入成果」與「專案治理回填」兩組

## Done
- 已將 `copilot-workspace-template` v1.3.0 套用到本 repo，並取得 `AGENTS.md`、多 agent 入口、`TEMPLATE-FILES.md`、`template-lock.json`、`80-template-boundary.md`、`90-project-custom.md`
- 已確認 `docs/handoff/current-task.md`、`docs/handoff/blockers.md` 屬 init-only，後續不再由 template upgrade 持續補入
- 已回填 `docs/agents/project-context.md`、`docs/agents/commands.md`、`docs/decision-log.md`、`docs/roadmap.md`、handoff 與當日 runlog，讓治理檔脫離模板占位狀態
- 已重新執行 target repo `--verify-only`，確認回填後的治理檔仍通過模板安裝檢查
- 已依「模板導入成果 / 專案治理回填」兩組提交策略完成 commit 與 push，保留升級邊界可追溯性

## In Progress
- 無

## Next Step
- 後續若要開始 Phase 1 workflow 驗證，應先以本 repo 已回填的 project-context、commands、handoff 作為真實入口，不再回頭依賴模板占位內容

## Files Touched
- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/copilot/rules/80-template-boundary.md`
- `.github/copilot/rules/90-project-custom.md`
- `.github/copilot/template-lock.json`
- `TEMPLATE-FILES.md`
- `docs/agents/project-context.md`
- `docs/agents/commands.md`
- `docs/decision-log.md`
- `docs/roadmap.md`
- `docs/handoff/current-task.md`
- `docs/handoff/blockers.md`
- `docs/runlog/2026-03-22_README.md`

## Key Symbols / Entry Points
- `TEMPLATE-FILES.md`
- `.github/copilot/template-lock.json`
- `.github/copilot/rules/90-project-custom.md`
- `docs/agents/project-context.md`
- `docs/agents/commands.md`

## Interfaces / Contracts Affected
- API / schema / types:
- UI contract / user flow: WOS / OpenSpec 之後應從本 repo 的 project-context、commands、handoff 與 runlog 直接得到正確背景，而不是看到模板占位內容
- Config / env / migration: 模板邊界採 managed / protected / init-only；handoff 在 init 後改由本 repo 自維，`90-project-custom.md` 作為專案自訂規則入口

## Risks / Watchouts
- 若下次直接改 managed files，模板升級可能覆蓋本地修補
- 目前尚無 automated tests；若治理檔再次失真，問題會先反映在 agent 行為與 handoff 品質上
- commit 時需避免把模板導入成果與專案治理回填混成單一 commit，否則後續很難判讀升級影響

## Validation Status
- Commands run: `d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --upgrade-preview --root D:/program/Personal-AI-Work-System`；`d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --upgrade --root D:/program/Personal-AI-Work-System`；`d:/program/copilot-workspace-template/.venv/Scripts/python.exe D:/program/copilot-workspace-template/bootstrap_copilot_workspace.py --verify-only --root D:/program/Personal-AI-Work-System`
- Result: PASS；模板邊界已生效，`current-task` / `blockers` 不再被列為 protected missing，回填後的治理檔也未破壞模板安裝檢查；提交已拆成模板導入與專案治理回填兩組並推送到 `origin/main`
- Not run yet: Phase 1 workflow 實際操作驗證

## Rollback / Recovery Notes
- 若要回退模板導入內容，可依 git diff 分別撤回 managed 導入 commit 或專案治理回填 commit；不要直接手動刪 template lock

## Pending Decisions
- 何時開始 Phase 1 的真實 workflow 驗證
- 是否要補一份本專案自己的 `docs/qa/` smoke 範本，作為之後每次治理調整的固定驗證清單

## Notes for Next Agent
- 若接手後要升級模板，先看 `TEMPLATE-FILES.md` 判斷邊界，再保留本 repo 已回填的 protected / init-only 內容
- 若只是調整本專案的合作規則，優先寫 `.github/copilot/rules/90-project-custom.md`，不要改 managed rules
- 本輪模板導入與治理回填已完成並推上遠端；目前不建議把 `README.md`、`docs/planning/project-overview.md`、`docs/runlog/2026-03-21_README.md` 混入同一條治理提交線
