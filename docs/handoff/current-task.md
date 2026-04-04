# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V4 Change 1 — `memory-health-scoring`（sync / archive / git publish complete）
- Owner agent: Codex / Copilot
- Last updated on: 2026-04-04

## Goal
- 在 `/memory` 顯示 health summary 與每條記憶的健康標記，作為 V4 第一個治理入口
- 保持 `/api/memory` 對既有 raw content consumers 相容，不破壞 V3 的 source attribution
- 將 dedup / rule conflict / shared knowledge / scheduler 留給後續 V4 changes

## Scope
- In scope:
  - 建立 `openspec/changes/memory-health-scoring/` active change artifacts
  - 定義以新鮮度 × 來源權重為核心的 health scoring model
  - 更新 `/api/memory` payload，加入 per-item health metadata 與 top-level summary
  - 更新 `/memory` 頁面，顯示過期比例、建議清理數量與 health badge / reason
  - 補 strict validate、targeted verify、smoke / UI / UX 證據與 handoff / roadmap / manual 同步
- Out of scope:
  - 記憶 dedup / merge / delete action
  - 規則衝突偵測升級
  - 跨專案 shared knowledge
  - governance scheduler
  - release / archive 類不可逆操作
  - 新 dependency / 前端框架 / build tool

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` 模組 server（無 Express）
- 禁止引入任何前端框架或打包工具
- 新增依賴需先記錄決策
- `AGENTS.md` 規定：archive / release 類不可逆操作需人工確認

## Done
- V1–V3 全部完成，V3 六個 changes 已 archive ✅
- V4 brief 已有使用者確認（2026/4/4）✅
- Executor preflight 已完成：`main` branch、`openspec/config.yaml`、V4 brief scope gate、無 active duplicate change ✅
- `openspec new change memory-health-scoring` 已完成，active change 目錄已建立並已封存至 `openspec/changes/archive/2026-04-04-memory-health-scoring/` ✅
- `memory-health-scoring` proposal / design / spec / tasks 已建立並通過 `openspec validate --changes memory-health-scoring --strict` ✅
- `web/public/js/memory-health-utils.js` 已建立，供 server / verify 共用 health scoring 規則 ✅
- `/api/memory` 已回傳既有 raw content + health summary / per-item health metadata ✅
- `/memory` 已顯示健康度概覽、過期比例 / 建議清理 KPI、per-item health badge / reason，且保留 source badge 相容 ✅
- `node tools/verify_memory_health_scoring.js`、`node tools/verify_source_attribution_in_memory.js` 與 local `GET /api/memory` smoke 全部 PASS ✅
- `docs/qa/2026-04-04_memory-health-scoring-smoke.md`、`docs/uiux/2026-04-04_memory-health-scoring-ui-review.md`、`docs/uiux/2026-04-04_memory-health-scoring-ux-review.md` 已補齊 ✅
- `openspec/specs/memory-health-scoring/spec.md` 已完成 main spec sync，且 `openspec validate memory-health-scoring --type spec --strict` PASS ✅
- `openspec archive memory-health-scoring -y --skip-specs` 已完成，archive 路徑為 `openspec/changes/archive/2026-04-04-memory-health-scoring/` ✅

## In Progress
- 無 active change；`memory-health-scoring` 已完成 sync / archive / git publish，可交接到下一個工作項目

## Next Step

| 優先 | 說明 |
|:----:|------|
| 🔴 1 | 決定優先啟動 `memory-dedup-suggestions`，或先處理 template verify blocker |
| 🟡 2 | 若繼續 V4，從 `docs/agents/codex-prompts/v4/04-memory-dedup-suggestions-plan.md` 開始 |
| 🟡 3 | 若先補治理缺口，處理 `.github/prompts/openspec-execute.prompt.md` 缺檔的 template verify blocker |

## Files Touched（本 session）
- openspec/changes/archive/2026-04-04-memory-health-scoring/proposal.md
- openspec/changes/archive/2026-04-04-memory-health-scoring/design.md
- openspec/changes/archive/2026-04-04-memory-health-scoring/specs/memory-health-scoring/spec.md
- openspec/changes/archive/2026-04-04-memory-health-scoring/tasks.md
- openspec/specs/memory-health-scoring/spec.md
- web/public/js/memory-health-utils.js
- web/server.js
- web/public/memory.html
- web/public/js/memory.js
- web/public/css/style.css
- tools/verify_memory_health_scoring.js
- docs/qa/2026-04-04_memory-health-scoring-smoke.md
- docs/uiux/2026-04-04_memory-health-scoring-ui-review.md
- docs/uiux/2026-04-04_memory-health-scoring-ux-review.md
- docs/planning/v4-brief.md
- docs/roadmap.md
- docs/system-manual.md
- docs/runlog/2026-04-04_README.md
- docs/handoff/current-task.md
- docs/handoff/blockers.md

## Validation Status
- OpenSpec strict validate：✅ `openspec validate --changes memory-health-scoring --strict`
- Targeted verify：✅ `node tools/verify_memory_health_scoring.js`
- Regression verify：✅ `node tools/verify_source_attribution_in_memory.js`
- Local API smoke：✅ `GET /api/memory` summary payload 正常
- Review Gate：✅ PASS
- Sync：✅ `openspec/specs/memory-health-scoring/spec.md`
- Archive：✅ `openspec archive memory-health-scoring -y --skip-specs`
- Git：✅ commit / push complete
