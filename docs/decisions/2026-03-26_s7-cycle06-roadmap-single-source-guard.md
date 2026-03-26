# 決策：S7 Cycle-06 新增 roadmap 單一真源防回退檢核

- 日期：2026-03-26
- Change：`phase7-v4-autonomous-continuation-governance-automation-mvp`

## What

- 新增 `scripts/s7-cycle06-governance-check.ps1`
- 在 Cycle-05 既有檢核鏈基礎上，加入 roadmap 單一真源約束：
  - `docs/roadmap/project-roadmap.md` 必須明確標示「已合併」
  - `docs/roadmap/project-roadmap.md` 必須 redirect 到 `../roadmap.md`
  - `docs/roadmap.md` 必須包含「唯一路線圖」宣告

## Why

- roadmap 已完成合併；若後續續作把舊分層邏輯帶回來，會再次出現命名矛盾與來源混淆。
- 需要可重播、自動化、低摩擦的防回退檢核，而非依賴人工巡檢。

## Impact

- S7 每輪可一鍵驗證 roadmap 治理基線是否被破壞。
- 降低「雙檔回流」與「命名漂移」風險。

## Evidence

- `scripts/s7-cycle06-governance-check.ps1`
- `openspec/changes/phase7-v4-autonomous-continuation-governance-automation-mvp/tasks.md`
- `docs/roadmap.md`
- `docs/roadmap/project-roadmap.md`
- `docs/qa/2026-03-26_smoke.md`
- `docs/runlog/2026-03-26_README.md`
