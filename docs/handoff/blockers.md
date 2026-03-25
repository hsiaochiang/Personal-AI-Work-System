# Blockers

> 只記錄會影響接手或需要人工決策的阻塞，避免流水帳。

## Active Blockers
- 目前無 active blockers
- 2026-03-25：完成 `phase2-semi-auto-memory-extraction-mvp` 的 sync/archive 後複核，仍無 blocker
- 2026-03-25：完成 `phase3-real-project-validation` 的 sync/archive 後複核，仍無 blocker

## Resolved Blockers
- S3 `opsx-sync` 初版把 delta spec 直接同步為 main spec，導致 `openspec validate real-project-validation --type spec --strict` 失敗（缺少 `## Purpose`/`## Requirements`）；已改為 main spec 標準結構後 PASS
- 模板升級曾把 handoff / runlog 證據檔與 protected 骨架混在一起；目前已改用 init-only / non-seeded 模型處理，後續由本 repo 自行維護 `current-task.md`、`blockers.md` 與每日 runlog
