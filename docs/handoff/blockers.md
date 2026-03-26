# Blockers

> 只記錄會影響接手或需要人工決策的阻塞，避免流水帳。

## Active Blockers
- 目前無 active blockers
- 2026-03-25：完成 `phase2-semi-auto-memory-extraction-mvp` 的 sync/archive 後複核，仍無 blocker
- 2026-03-25：完成 `phase3-real-project-validation` 的 sync/archive 後複核，仍無 blocker
- 2026-03-25：啟動 `phase4-v1-convergence-finalization` 後複核，仍無 blocker
- 2026-03-26：完成 `phase4-v1-convergence-finalization` archive 後複核，仍無 blocker
- 2026-03-26：啟動 `phase5-v2-lightweight-ui-workbench-mvp` 後複核，仍無 blocker
- 2026-03-26：完成 `phase5-v2-lightweight-ui-workbench-mvp` archive 後複核，仍無 blocker
- 2026-03-26：啟動 `phase6-v3-multi-tool-integration-framework-mvp` 後複核，仍無 blocker

## Resolved Blockers
- S3 `opsx-sync` 初版把 delta spec 直接同步為 main spec，導致 `openspec validate real-project-validation --type spec --strict` 失敗（缺少 `## Purpose`/`## Requirements`）；已改為 main spec 標準結構後 PASS
- 模板升級曾把 handoff / runlog 證據檔與 protected 骨架混在一起；目前已改用 init-only / non-seeded 模型處理，後續由本 repo 自行維護 `current-task.md`、`blockers.md` 與每日 runlog
- S5 `#opsx-sync` 後 main spec 曾因直接覆蓋 delta 格式導致 strict validate 失敗；已補 `Purpose/Requirements` 主規格結構後 PASS
