# 2026-03-24 phase1-entrypoint-guidance-pilot evidence span

## Context

- `phase1-entrypoint-guidance-pilot` 的 acceptance criteria 要求第 2 次 pilot 必須同步留下 tasks、runlog、handoff、QA 等可接手證據。
- `35-quality-gate` 與 OpenSpec lifecycle 另外要求 workflow 變更補齊 UX review、smoke 與 status 類證據。
- 依 `36-scope-guard`，本次會超過 5 個檔案，因此先記錄此決策，避免後續把必要 evidence 誤判成 scope 膨脹。

## Decision

- 本次 change 允許以最小安全範圍同步更新 `tasks`、`runlog`、`current-task`、`QA`、`roadmap`、`UI/UX review` 與決策留痕。
- 不修改 handoff 模板、managed rules 或產品功能。
- 所有變更只服務於第 2 次 pilot 的比較型實跑、驗證與交接，不延伸到新架構或新工具導入。

## Why

- 若缺少任一核心 evidence 檔，下一位 agent 仍需依賴口頭補充，無法滿足「只靠 repo 內文件接續下一步」的驗收要求。
- 本次改善的主體是 workflow friction，而不是程式碼功能，因此必要變更自然落在多個治理檔，而不是單一實作檔。

## Impact

- 允許本次在不擴大 scope 的前提下跨多個 docs 檔案同步證據。
- 後續若要再調整入口文件或 handoff 欄位，必須以本次 QA 比較結果為基線，另開最小 change 處理。

## Evidence

- `docs/qa/2026-03-24_smoke.md`
- `docs/handoff/current-task.md`
- `docs/runlog/2026-03-24_README.md`
- `openspec/changes/phase1-entrypoint-guidance-pilot/tasks.md`