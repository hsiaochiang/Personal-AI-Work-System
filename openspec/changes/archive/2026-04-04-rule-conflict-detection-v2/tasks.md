## 1. OpenSpec And Scope Alignment

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/rule-conflict-detection-v2/spec.md` 與 `tasks.md`，並更新 `docs/planning/v4-brief.md` / `docs/handoff/current-task.md` / `docs/system-manual.md` 為 Change 3 executor 進行中狀態

## 2. Rule Conflict Detection Backendless Utility

- [x] 2.1 新增可重用的 rule conflict utility，支援 rule statement normalization、same-category pairing、signal-based conflict detection 與 explanation 生成（驗收：同一套 utility 可被 `/decisions` 與 verify script 重用）
- [x] 2.2 保持 `/api/rules` raw markdown contract 不變，讓 `decisions.js` 改以 shared utility enrich parsed rules（驗收：既有 `files[].content` flow 不需改 server API）

## 3. `/decisions` Conflict Explanation UI

- [x] 3.1 更新 `web/public/decisions.html`、`web/public/js/decisions.js` 與 `web/public/css/style.css`，顯示 conflict overview、per-rule conflict explanation 與改善後的 warning 文案（驗收：rules tab 可看到衝突摘要、原因與對象）
- [x] 3.2 保持決策 tab、rule category tabs、search 與既有 rule list 顯示相容（驗收：沒有衝突時 UI 不回歸，搜尋與分類切換仍正常）

## 4. Verification And Evidence

- [x] 4.1 新增 targeted verify，覆蓋 negation conflict、style conflict、same-category guard 與 `/decisions` static contract（驗收：Node script 可重跑且失敗時能指出 heuristic / UI wiring 問題）
- [x] 4.2 執行 targeted verify 與 local `/api/rules` / `/decisions` smoke，確認規則頁面與 raw API 契約正常
- [x] 4.3 補 `docs/qa/`、`docs/uiux/`、`docs/roadmap.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 證據與狀態（驗收：文件可反映 V4 Change 3 已進入 executor / verify 狀態與使用者可見影響）
