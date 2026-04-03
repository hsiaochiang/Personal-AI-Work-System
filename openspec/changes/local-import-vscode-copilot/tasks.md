## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/local-import-vscode-copilot/spec.md` 與 `tasks.md`（驗收：內容與 V3 brief 的 `local-import-vscode-copilot` 使用者故事 / scope 對齊）

## 2. Copilot Local Import Runtime

- [x] 2.1 擴充共享 adapter 模組，加入 Copilot JSONL snapshot parser、session summary 與 `ConversationDoc` 正規化（驗收：可輸出合法 `ConversationDoc`，且 `source = copilot`）
- [x] 2.2 擴充 `web/server.js`，提供 Copilot session list / load 的 read-only API（驗收：可從預設或覆寫路徑讀取 `.jsonl`，且不新增寫入能力）
- [x] 2.3 更新 `/extract` 的前端流程，支援刷新 session、選擇一筆並載入至既有 extraction pipeline（驗收：不需手動複製貼上即可提取候選）

## 3. `/extract` Minimal UI

- [x] 3.1 更新 `web/public/extract.html` 與 `web/public/css/style.css`，加入最小 Copilot 匯入區塊、路徑輸入與 session list（驗收：不引入 multi-source selector，且既有 ChatGPT / plain 區塊仍可用）
- [x] 3.2 在前端加入狀態回饋與模式切換（驗收：載入成功、空清單、讀取失敗、切回手動貼上都有明確狀態）

## 4. Verification And Evidence

- [x] 4.1 新增 Copilot fixture 與驗證腳本（驗收：可用 Node 執行，覆蓋 JSONL parser、session list 摘要與 `/extract` 靜態 smoke）
- [x] 4.2 執行 targeted verify 並補 QA / UI / UX 證據（驗收：至少包含 local import verify、`/extract` smoke、UI/UX review）
- [x] 4.3 更新 `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-03_README.md` 的本 change 狀態（驗收：能反映 Change 4 已進入 executor，並說明 user-facing impact）
