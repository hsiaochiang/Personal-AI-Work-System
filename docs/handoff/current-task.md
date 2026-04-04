# Current Task

> 工程化交接主檔。只保留下一個 agent 接手必需的內容。
> 版本完成度與長期進度以 `docs/roadmap.md` 為準。

## Task
- Name: V5 planning — 待使用者確認 V5 brief 後開始第一個 Change
- Owner agent: Copilot / Codex
- Last updated on: 2026-04-04

## Goal
- V4 全 5 個 Changes 已 archive，版本收尾完成
- V5 brief 草擬完成（`docs/planning/v5-brief.md`），等待使用者確認
- template verify blocker 已解除（`openspec-execute.prompt.md` 已補建於 `070b90f`）

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
- 已完成 implementation commit：`9db3afc` `add governance scheduler overview reminders` ✅
- 已完成 main spec sync：新增 `openspec/specs/governance-scheduler/spec.md`，並通過 `openspec validate governance-scheduler --type spec --strict` ✅
- 已執行 `openspec archive governance-scheduler -y --skip-specs`，active change 已封存至 `openspec/changes/archive/2026-04-04-governance-scheduler/` ✅
- 已確認 V4 五個 planned changes 全數 archive，並同步 `docs/planning/v4-brief.md`、`docs/roadmap.md`、`docs/system-manual.md` 為版本完成狀態 ✅

## In Progress
- 無；V4 功能收尾已完成，V5 brief 已草擬待確認

## Next Step

| 優先 | 說明 |
|:----:|------|
| 🔴 1 | 確認 `docs/planning/v5-brief.md`（填入確認日期），解除 V5 開工前置條件 |
| 🟡 2 | 確認後執行 `#codex-prompts-generate` 產出 V5 四個 Change 的三角色提示詞 |
| 🟡 3 | 執行 `#opsx-new gemini-adapter`（V5 第一個 Change） |

## Files Touched（本 session）
- docs/handoff/current-task.md
- docs/planning/v4-brief.md
- docs/roadmap.md
- docs/system-manual.md
- docs/runlog/2026-04-04_README.md
- openspec/specs/governance-scheduler/spec.md
- openspec/changes/archive/2026-04-04-governance-scheduler/
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
- Commit：✅ `9db3afc add governance scheduler overview reminders`
- Main spec sync：✅ `openspec/specs/governance-scheduler/spec.md` + `openspec validate governance-scheduler --type spec --strict`
- Archive：✅ `openspec archive governance-scheduler -y --skip-specs`
- Version closeout：✅ V4 brief / roadmap / system-manual 已同步為 completed 狀態
