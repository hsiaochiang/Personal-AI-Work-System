## 1. OpenSpec And Scope Alignment

- [x] 1.1 更新 `docs/planning/v3-brief.md`、`docs/handoff/current-task.md` 與 `docs/system-manual.md`，把 `source-attribution-in-memory` 標記為 executor 進行中，且明確維持 Change 6 非本次 scope

## 2. Runtime Implementation

- [x] 2.1 更新 `web/public/js/extract.js` 的 writeback 流程，讓每筆新增 memory 條目附帶 `<!-- source: <tool> -->` metadata，且沿用既有 writeback whitelist 與 backup 機制
- [x] 2.2 更新 `web/public/js/memory.js`，讓 parser 可從 markdown list item 解析 `content` 與 `source`，legacy 無 metadata 條目仍正常顯示
- [x] 2.3 更新 `web/public/css/style.css`，為 `/memory` 的來源 badge 補上最小樣式，不破壞既有 memory card 排版

## 3. Verification And Evidence

- [x] 3.1 新增 targeted verify，覆蓋 source metadata 寫入格式與 `/memory` parser / badge 行為
- [x] 3.2 執行 targeted verify 與既有 plain / chatgpt / copilot regression verify，確認 V3 既有 import 路徑未被破壞
- [x] 3.3 更新 `docs/qa/`、`docs/uiux/`、`docs/runlog/2026-04-03_README.md` 與必要治理文件，回寫本 change 的 user-facing impact 與驗證證據
