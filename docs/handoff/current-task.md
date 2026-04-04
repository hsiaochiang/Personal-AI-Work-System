# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: Review Gate PASS — V4 Change 5 `governance-scheduler`
- Owner agent: Codex / Copilot
- Last updated on: 2026-04-04

## Goal
- 完成 `governance-scheduler` 的 Review Gate，確認本 change 是否可進入 commit / main spec sync / archive
- 維持 V4 brief 邊界：只做 read-only 的治理待辦與排程檢查，不自動寫回 memory / rules，也不把 template verify blocker 混入本 change

## Scope
- In scope:
  - 定義 `web/governance.json` 的最小設定契約，涵蓋 enable / frequency / due-check 所需欄位
  - 定義 server 啟動時的 scheduler 檢查邊界，產生治理待辦 snapshot / summary
  - 定義 Overview 頁如何顯示治理待辦、empty state 與人工確認語意
  - 定義 Executor 需要補的 OpenSpec artifacts、verify、smoke 與治理證據
- Out of scope:
  - 背景 daemon、cron、OS-level scheduler 或長駐任務
  - 自動 merge / delete / writeback 任一 `docs/memory/*.md` 或 rules 檔
  - 新 dependency、LLM / embeddings、跨專案 shared writeback
  - template verify blocker 修補、commit / sync / archive 等不可逆操作

## Constraints
- 純靜態 HTML + vanilla JS（無框架、無 build）
- Node.js `http` 模組 server（無 Express）
- 禁止引入任何前端框架或打包工具
- `AGENTS.md` 規定：archive / release 類不可逆操作需人工確認

## Done
- 已確認 `docs/planning/v4-brief.md` 的使用者確認日期為 `2026/4/4`，可進入 V4 Change 5 規劃 ✅
- 已確認 `governance-scheduler` 已存在於 V4 brief 的 Changes 表，且仍在版本 scope 內 ✅
- 已確認 `openspec/changes/` 目前只有 `archive/`，沒有同名或同目的的 active duplicate change ✅
- 已盤點目前基線：
  - `web/governance.json` 尚不存在 ✅
  - `web/server.js` 目前只有 roadmap / task / memory / decisions / rules / projects / copilot 相關 API，沒有 governance endpoint 或 startup due-check ✅
  - `web/public/index.html` + `web/public/js/overview.js` 目前只顯示 roadmap KPI / phase table，沒有治理待辦卡或排程摘要 ✅
- 已收斂本 change 最小方向：以 server startup due-check + Overview 治理待辦為主，不做自動執行 action ✅
- 已確認 template verify blocker 仍獨立存在，這一輪不納入 `governance-scheduler` scope ✅
- 已執行 `openspec new change governance-scheduler`，建立 active change 骨架 ✅
- 已補齊 `proposal.md`、`design.md`、`specs/governance-scheduler/spec.md` 與 `tasks.md`，並通過 `openspec validate --changes governance-scheduler --strict` ✅
- 已完成最小 scheduler pipeline：`web/governance.json` → startup due-check snapshot → `/api/governance` → Overview 治理待辦卡 ✅
- 已新增 `tools/verify_governance_scheduler.js`，並通過 targeted verify + local API smoke ✅
- 已補 `docs/qa/2026-04-04_governance-scheduler-smoke.md`、`docs/uiux/2026-04-04_governance-scheduler-ui-review.md`、`docs/uiux/2026-04-04_governance-scheduler-ux-review.md` ✅
- 已執行 Review Gate：重查 scope / spec / tasks / QA / UI / UX 證據，並重跑 strict validate、targeted verify、local API smoke；判定 PASS ✅
- 已校正 `docs/planning/v4-brief.md` 的使用者影響描述，讓 brief 與實際 Overview 治理待辦能力一致 ✅

## In Progress
- 無；Review Gate 已完成，待人決定是否進入 commit / main spec sync / archive

## Next Step

| 優先 | 說明 |
|:----:|------|
| 🔴 1 | 由人決定是否讓 `governance-scheduler` 進入 commit / main spec sync / archive |
| 🟡 2 | 若繼續收尾，先同步 main spec，並把 `docs/planning/v4-brief.md`、`docs/roadmap.md`、`docs/system-manual.md` 更新到 V4 最後一個 change ready-to-archive 狀態 |
| 🟡 3 | 若要執行 archive，先確認 V4 所有 planned changes 均已完成，並補版本收尾所需的 brief / roadmap 檢查 |
| 🟡 4 | template verify blocker 仍在 `docs/handoff/blockers.md` 獨立追蹤，不與 Change 5 收尾綁定 |

## Files Touched（本 session）
- docs/handoff/current-task.md
- docs/planning/v4-brief.md
- docs/roadmap.md
- docs/system-manual.md
- docs/runlog/2026-04-04_README.md
- openspec/changes/governance-scheduler/proposal.md
- openspec/changes/governance-scheduler/design.md
- openspec/changes/governance-scheduler/specs/governance-scheduler/spec.md
- openspec/changes/governance-scheduler/tasks.md
- web/governance.json
- web/server.js
- web/public/index.html
- web/public/js/overview.js
- web/public/js/governance-scheduler-utils.js
- web/public/css/style.css
- tools/verify_governance_scheduler.js
- docs/qa/2026-04-04_governance-scheduler-smoke.md
- docs/uiux/2026-04-04_governance-scheduler-ui-review.md
- docs/uiux/2026-04-04_governance-scheduler-ux-review.md

## Validation Status
- Brief confirmation：✅ `docs/planning/v4-brief.md` 已有人類確認
- Scope gate：✅ `governance-scheduler` 屬於 V4 brief In Scope（例行治理排程）
- Duplicate change check：✅ `openspec/changes/` 目前無 active change
- Baseline inspection：✅ `web/server.js`、`web/public/index.html`、`web/public/js/overview.js`、`web/projects.json`
- OpenSpec new：✅ `openspec new change governance-scheduler`
- Strict validate：✅ `openspec validate --changes governance-scheduler --strict`
- Targeted verify：✅ `node tools/verify_governance_scheduler.js`
- Local API smoke：✅ startup log + `GET /api/governance` + `GET /`
- Done gate evidence：✅ QA / UI review / UX review 已補齊
- Review Gate：✅ PASS；startup snapshot 邊界、manual note 語意、Overview empty/disabled state 與 verify 證據均符合本 change scope
- Executor boundary：✅ 本 session 尚未執行 commit / sync / archive 等不可逆操作
