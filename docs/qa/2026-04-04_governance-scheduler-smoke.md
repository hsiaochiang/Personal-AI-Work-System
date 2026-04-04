# Governance Scheduler Smoke — 2026-04-04

> Change: `governance-scheduler`
> Type: UI change
> Scope: `web/governance.json` + server startup due-check + `/api/governance` + Overview 治理待辦卡

## Verify Commands

- `openspec validate --changes governance-scheduler --strict`
- `node tools/verify_governance_scheduler.js`
- local API smoke:
  - start `web/server.js`
  - `GET /api/governance`
  - `GET /`

## Coverage

- `governance-scheduler` 的 proposal / design / spec / tasks 已通過 strict validate
- `web/governance.json` 可表達全域 `enabled`、per-check `frequency`、`lastReviewedOn` 與 `dueCheck` threshold
- server startup 會建立 governance snapshot，並為目前 projectId 提供 `/api/governance`
- governance todo 維持 suggestion-only，不自動更新 `lastReviewedOn`，也不改寫任何 memory / rules source
- Overview 頁存在治理待辦容器、summary card、empty/disabled state wiring 與 manual-review 文案
- 既有 roadmap KPI / phase table flow 維持可用

## Result

- `openspec validate --changes governance-scheduler --strict`：PASS
- `verify_governance_scheduler`：PASS
  - governance config parse PASS
  - due-check / severity matrix PASS
  - disabled fallback PASS
  - server snapshot contract PASS
  - Overview / CSS / server static contract PASS
- local API smoke：PASS
  - startup log 顯示 `治理待辦：4 項到期（3 項需優先確認）`
  - `GET /api/governance` 回傳 `enabled = true`
  - `GET /api/governance` 回傳 `configPath = web/governance.json`
  - `GET /api/governance` 回傳 `summary.dueCount = 4`
  - `GET /` 可見 `id="governance-content"` 與「治理待辦」文案

## Notes

- 第一版 governance scheduler 只在 server startup 建立 snapshot；若 server 長時間不重啟，到期資訊不會自動刷新。
- todo card 只提供導向 `/memory` / `/decisions` 的入口；確認完成後仍需人工更新 `web/governance.json`。
- 本 change 尚未建立 background daemon、cron 或任何自動 writeback action。
