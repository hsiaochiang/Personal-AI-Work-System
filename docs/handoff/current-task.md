# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: No active change — V4 Change 2 `memory-dedup-suggestions` sync / archive complete
- Owner agent: Codex / Copilot
- Last updated on: 2026-04-04

## Goal
- 在 `/memory` 顯示疑似重複群組，讓使用者可直接看到哪些記憶內容重複或高度相似
- 提供人工確認後才執行的 merge / delete action，且沿用既有 `.backup/` 保護
- 保持 `/api/memory` 對既有 raw content / health / source consumers 相容，不破壞 V4 Change 1 的 health scoring 與 V3 的 source attribution

## Scope
- In scope:
  - 建立 `openspec/changes/memory-dedup-suggestions/` active change artifacts
  - 定義同一 memory 檔案內的 dedup heuristic、primary selection 與 suggestion payload
  - 更新 `/api/memory` payload，加入 top-level `dedup.summary` 與 suggestion groups
  - 新增 `/api/memory/dedup` action，支援 merge / delete 並沿用 whitelist + backup 邊界
  - 更新 `/memory` 頁面，顯示 dedup overview、duplicate groups、推薦 primary 與 merge/delete action
  - 補 strict validate、targeted verify、smoke / UI / UX 證據與 handoff / roadmap / manual 同步
- Out of scope:
  - 跨檔案或跨專案 dedup / shared knowledge
  - 規則衝突偵測升級
  - governance scheduler
  - LLM / embeddings / 向量搜尋 / 新 dependency
  - release / archive 類不可逆操作

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
- `openspec new change memory-dedup-suggestions` 已完成，active change 目錄已建立 ✅
- `memory-dedup-suggestions` proposal / design / spec / tasks 已建立並通過 `openspec validate --changes memory-dedup-suggestions --strict` ✅
- `web/public/js/memory-dedup-utils.js` 已建立，供 server / verify 共用 dedup heuristic、primary selection 與 line-level rewrite 規則 ✅
- `/api/memory` 已回傳既有 raw content / health payload + `dedup.summary` / suggestion groups ✅
- `/api/memory/dedup` 已支援 merge / delete action，並沿用 whitelist + `.backup/` 保護 ✅
- `/memory` 已顯示 dedup overview、duplicate groups、推薦 primary 與 merge/delete action，且保留 health/source badge 與原始分類列表相容 ✅
- `node tools/verify_memory_dedup_suggestions.js`、`node tools/verify_memory_health_scoring.js`、`node tools/verify_source_attribution_in_memory.js` 全部 PASS ✅
- local API smoke（`projectId=mock-test`）已驗證 `GET /api/memory` dedup payload 與 `POST /api/memory/dedup` merge + backup 行為 ✅
- `docs/qa/2026-04-04_memory-dedup-suggestions-smoke.md`、`docs/uiux/2026-04-04_memory-dedup-suggestions-ui-review.md`、`docs/uiux/2026-04-04_memory-dedup-suggestions-ux-review.md` 已補齊 ✅
- Review Gate blocker 已修補：`/api/memory/dedup` merge action 現在會驗證 `primaryItemId` 必須屬於本次 duplicate group，避免誤改同檔案內其他 memory item ✅
- `node tools/verify_memory_dedup_suggestions.js` 已新增 malformed merge payload / non-duplicate delete guard 覆蓋，重跑 targeted verify / regression / local API smoke 全數 PASS ✅
- `openspec/specs/memory-dedup-suggestions/spec.md` 已完成 main spec sync，且 `openspec validate memory-dedup-suggestions --type spec --strict` PASS ✅
- `openspec archive memory-dedup-suggestions -y --skip-specs` 已完成，archive 路徑為 `openspec/changes/archive/2026-04-04-memory-dedup-suggestions/` ✅

## In Progress
- 無 active change；`memory-dedup-suggestions` 已完成 sync / archive，下一步待決定下一個 V4 change 或先處理 template blocker

## Next Step

| 優先 | 說明 |
|:----:|------|
| 🔴 1 | 決定是否啟動 `rule-conflict-detection-v2`，或先處理 `.github/prompts/openspec-execute.prompt.md` 缺檔的 template verify blocker |
| 🟡 2 | 若繼續 V4，從 `docs/agents/codex-prompts/v4/07-rule-conflict-detection-v2-plan.md` 開始 |
| 🟡 3 | 若優先補治理缺口，先讓 template verify 恢復綠燈 |

## Files Touched（本 session）
- openspec/changes/archive/2026-04-04-memory-dedup-suggestions/proposal.md
- openspec/changes/archive/2026-04-04-memory-dedup-suggestions/design.md
- openspec/changes/archive/2026-04-04-memory-dedup-suggestions/specs/memory-dedup-suggestions/spec.md
- openspec/changes/archive/2026-04-04-memory-dedup-suggestions/tasks.md
- openspec/specs/memory-dedup-suggestions/spec.md
- web/public/js/memory-dedup-utils.js
- web/server.js
- web/public/memory.html
- web/public/js/memory.js
- web/public/css/style.css
- tools/verify_memory_dedup_suggestions.js
- docs/qa/2026-04-04_memory-dedup-suggestions-smoke.md
- docs/uiux/2026-04-04_memory-dedup-suggestions-ui-review.md
- docs/uiux/2026-04-04_memory-dedup-suggestions-ux-review.md
- docs/planning/v4-brief.md
- docs/roadmap.md
- docs/system-manual.md
- docs/runlog/2026-04-04_README.md
- docs/handoff/current-task.md

## Validation Status
- OpenSpec strict validate：✅ `openspec validate --changes memory-dedup-suggestions --strict`
- Targeted verify：✅ `node tools/verify_memory_dedup_suggestions.js`
- Regression verify：✅ `node tools/verify_memory_health_scoring.js`
- Regression verify：✅ `node tools/verify_source_attribution_in_memory.js`
- Local API smoke：✅ `GET /api/memory?projectId=mock-test` + `POST /api/memory/dedup?projectId=mock-test`
- Review Gate：✅ PASS（已補 server-side duplicate group validation，並新增 malformed payload verify）
- Sync：✅ `openspec/specs/memory-dedup-suggestions/spec.md`
- Archive：✅ `openspec archive memory-dedup-suggestions -y --skip-specs`
