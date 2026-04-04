## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/memory-health-scoring/spec.md` 與 `tasks.md`（驗收：內容與 V4 brief 的 `memory-health-scoring` 使用者故事 / scope 對齊）

## 2. Memory Health Scoring Backend

- [x] 2.1 新增可重用的 memory health utility，支援 group 日期解析、source weight 與 `healthy / review / stale` 分類（驗收：同一套 utility 可被 server 與 verify script 重用）
- [x] 2.2 更新 `web/server.js` 的 `/api/memory`，回傳既有 raw content 與新增的 health summary / enriched groups（驗收：`filename` / `content` 仍存在，且每個 item 具有 health metadata）

## 3. `/memory` Health UI

- [x] 3.1 更新 `web/public/memory.html`、`web/public/js/memory.js` 與 `web/public/css/style.css`，顯示 health overview 與條目 health badge / reason（驗收：`/memory` 頁面可看到總條目、過期比例、建議清理數量，以及每條條目的健康標記）
- [x] 3.2 保持來源 badge 與既有記憶分組顯示相容（驗收：有 source metadata 的條目仍顯示來源 badge；legacy 條目仍可正常閱讀）

## 4. Verification And Evidence

- [x] 4.1 新增 targeted verify，覆蓋 health scoring 規則、API payload 契約與 `/memory` overview / badge 引用（驗收：Node script 可重跑且失敗時能指出 health scoring 問題）
- [x] 4.2 補 `docs/qa/`、`docs/uiux/`、`docs/planning/v4-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 證據與狀態（驗收：文件可反映 V4 Change 1 已進入 executor / verify 狀態與使用者可見影響）
