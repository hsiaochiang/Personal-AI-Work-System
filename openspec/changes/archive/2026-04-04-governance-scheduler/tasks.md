## 1. OpenSpec And Governance Alignment

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/governance-scheduler/spec.md` 與 `tasks.md`，定義 config-driven + startup due-check 的 suggestion-only 邊界（驗收：`openspec validate --changes governance-scheduler --strict` 可通過）

## 2. Governance Config And Startup Due-check

- [x] 2.1 新增 `web/governance.json` 與 governance scheduler utility，支援 config parsing、frequency 判斷、signal threshold 與 per-project todo summary（驗收：同一套 utility 可被 server 與 targeted verify 重用）
- [x] 2.2 更新 `web/server.js`，在 startup 建立 governance snapshot 並提供 `/api/governance` endpoint，回傳目前 projectId 的 summary / todos / manual-review note（驗收：重啟 server 後 `/api/governance` 可回傳 read-only governance payload）

## 3. Overview Governance Presentation

- [x] 3.1 更新 `web/public/index.html`、`web/public/js/overview.js` 與 `web/public/css/style.css`，顯示治理待辦 overview、empty state、disabled state 與人工確認語意（驗收：Overview 可看到治理待辦或清楚的空狀態，且不影響既有 roadmap KPI / phase table）

## 4. Verification And Evidence

- [x] 4.1 新增 targeted verify，覆蓋 governance config、due-check、signal threshold、`/api/governance` 靜態契約與 Overview script wiring（驗收：Node script 可重跑且失敗時能指出 contract 問題）
- [x] 4.2 執行 strict validate、targeted verify 與 local API smoke，確認 startup due-check、`/api/governance` payload 與 Overview 治理待辦正常
- [x] 4.3 補 `docs/qa/`、`docs/uiux/`、`docs/roadmap.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 證據與狀態（驗收：文件可反映 V4 Change 5 已完成 executor / verify，待 Review Gate）
