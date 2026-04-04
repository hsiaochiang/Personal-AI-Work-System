# Memory Health Scoring Smoke — 2026-04-04

> Change: `memory-health-scoring`
> Type: UI change
> Scope: `/api/memory` health summary + `/memory` health overview / badge

## Verify Commands

- `openspec validate --changes memory-health-scoring --strict`
- `node tools/verify_memory_health_scoring.js`
- `node tools/verify_source_attribution_in_memory.js`
- local API smoke:
  - start `web/server.js`
  - `GET /api/memory`

## Coverage

- `memory-health-scoring` 的 proposal / design / spec / tasks 已通過 strict validate
- `/api/memory` 仍保留 `filename` / `content`，並新增 `summary` 與 per-item `health`
- `memory-health-utils` 可解析常見 heading 日期格式，將條目分類為 `healthy` / `review` / `stale`
- targeted verify 已覆蓋「有日期但無 source metadata」與「無日期但有可信來源」兩種 guard，避免條目被誤判成 `healthy`
- `/memory` 頁面靜態契約存在 health overview 容器、過期比例 KPI、建議清理 KPI 與 health utility 引用
- 既有 source attribution parser / badge regression 維持 PASS

## Result

- `openspec validate --changes memory-health-scoring --strict`：PASS
- `verify_memory_health_scoring`：PASS
  - health scoring model PASS
  - missing-source / missing-date guard PASS
  - enriched API payload contract PASS
  - `/memory` overview / badge static contract PASS
- `verify_source_attribution_in_memory`：PASS
  - legacy source badge 與 parser regression PASS
- local API smoke：PASS
  - 啟動 `web/server.js` 後，`GET /api/memory` 可回傳 `summary` 與 `files`
  - 本機資料集回報 `172` 條記憶可被 API 成功解析

## Notes

- 第一版 health scoring 目前採「新鮮度 × 來源權重」，尚未納入真正的 usage frequency telemetry。
- 沒有日期或來源的 legacy 條目預設列為 `待確認`，避免直接被判定為過期。
