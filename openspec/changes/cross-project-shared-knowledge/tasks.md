## 1. OpenSpec And Governance Alignment

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/cross-project-shared-knowledge/spec.md` 與 `tasks.md`，定義 suggestion-only shared knowledge 邊界（驗收：`openspec validate --changes cross-project-shared-knowledge --strict` 可通過）

## 2. Cross-project Shared Knowledge Utility And Snapshot

- [x] 2.1 新增 shared knowledge utility，支援跨專案 memory flatten、same-filename grouping、similarity heuristic 與 current-project filtering（驗收：同一套 utility 可被 server、verify script 與 snapshot generator 重用）
- [x] 2.2 新增 `tools/generate_shared_knowledge_report.js` 與 `docs/shared/` snapshot，產出 read-only shared knowledge markdown（驗收：generator 會輸出 shared candidate 清單，且不改寫任何 `docs/memory/*.md`）

## 3. `/api/memory` And `/memory` Read-only Shared Presentation

- [x] 3.1 更新 `web/server.js` 的 `/api/memory`，附帶 `sharedKnowledge` summary / groups，且保留既有 `files` / `summary` / `dedup` contract（驗收：既有 consumer 無需改 endpoint）
- [x] 3.2 更新 `web/public/memory.html`、`web/public/js/memory.js` 與 `web/public/css/style.css`，顯示 suggestion-only 的 shared knowledge overview（驗收：`/memory` 可看到 shared candidate 或空狀態，且不提供 writeback action）

## 4. Verification And Evidence

- [x] 4.1 新增 targeted verify，覆蓋 cross-project grouping、same-filename guard、current-project filtering、snapshot output 與 `/memory` 靜態契約（驗收：Node script 可重跑且失敗時能指出 contract 問題）
- [x] 4.2 執行 strict validate、targeted verify 與 local API smoke，確認 `/api/memory` shared payload、`docs/shared/` snapshot 與 `/memory` read-only UI 正常
- [x] 4.3 補 `docs/qa/`、`docs/uiux/`、`docs/roadmap.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 證據與狀態（驗收：文件可反映 V4 Change 4 已完成 executor / verify，待 Review Gate）
