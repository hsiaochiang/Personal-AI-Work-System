## 1. OpenSpec And Scope Alignment

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/memory-dedup-suggestions/spec.md` 與 `tasks.md`，並更新 `docs/planning/v4-brief.md` / `docs/handoff/current-task.md` / `docs/system-manual.md` 為 Change 2 executor 進行中狀態

## 2. Memory Dedup Suggestions Backend

- [x] 2.1 新增可重用的 memory dedup utility，支援 deterministic similarity heuristic、duplicate grouping、primary selection 與 line-level markdown rewrite（驗收：同一套 utility 可被 server 與 verify script 重用）
- [x] 2.2 更新 `web/server.js` 的 `/api/memory`，回傳既有 raw content / health payload 與 dedup summary / suggestion groups（驗收：既有欄位仍存在，且 duplicate groups 只限同一 memory 檔案）
- [x] 2.3 新增安全的 dedup action API，支援 merge / delete 並沿用 whitelist + backup 邊界（驗收：非 whitelist 或不存在 item id 的操作會被拒絕）

## 3. `/memory` Dedup UI

- [x] 3.1 更新 `web/public/memory.html`、`web/public/js/memory.js` 與 `web/public/css/style.css`，顯示 dedup overview、duplicate groups、推薦 primary 與 merge/delete action（驗收：`/memory` 頁面可看到疑似重複建議並可操作）
- [x] 3.2 保持 health/source badge 與既有記憶分組顯示相容（驗收：dedup 區塊與原本記憶列表可同時顯示，既有 health/source UI 不回歸）

## 4. Verification And Evidence

- [x] 4.1 新增 targeted verify，覆蓋 dedup heuristic、primary selection、merge/delete rewrite 與 `/memory` suggestion UI 契約（驗收：Node script 可重跑且失敗時能指出 dedup 問題）
- [x] 4.2 執行 targeted verify、既有 `verify_memory_health_scoring.js` / `verify_source_attribution_in_memory.js` regression 與 local API smoke，確認 `/api/memory` 與 dedup action 正常
- [x] 4.3 補 `docs/qa/`、`docs/uiux/`、`docs/roadmap.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 證據與狀態（驗收：文件可反映 V4 Change 2 已進入 executor / verify 狀態與使用者可見影響）
