## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/plain-text-adapter/spec.md` 與 `tasks.md`（驗收：artifact 內容與 V3 brief scope 對齊，且 `plain-text-adapter` capability 已定義）

## 2. Adapter Runtime Refactor

- [x] 2.1 新增可共用的 `PlainTextAdapter` / `ConversationDoc` validator 模組（驗收：瀏覽器與 Node 驗證腳本都可載入，且可產出合法 `ConversationDoc`）
- [x] 2.2 重構 `web/public/js/extract.js`，讓候選提取入口改吃 `ConversationDoc`，並維持既有 heuristics / review / writeback 行為（驗收：程式內不再直接以 raw text 呼叫 extraction 主流程）
- [x] 2.3 更新 `/extract` 頁面載入與最小說明文案，對齊 `PlainTextAdapter` 架構（驗收：頁面可正常載入新模組，且未改變既有純文字操作路徑）

## 3. Verification And Evidence

- [x] 3.1 新增 PlainTextAdapter 驗證腳本（驗收：可用 Node 執行，涵蓋 schema 合法性與 flatten 後文字）
- [x] 3.2 執行本 change 的驗證並留下 QA 證據（驗收：至少包含 adapter 驗證結果與 `/extract` 純文字 happy path smoke）
- [x] 3.3 更新 `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md` 的本 change 狀態（驗收：能反映 Change 2 已進入執行中，且 system manual 說明 user-facing impact）
