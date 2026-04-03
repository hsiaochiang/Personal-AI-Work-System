## Context

目前 `/extract` 頁面在 `web/public/js/extract.js` 內直接從 textarea 讀取 raw text，接著以 `extractCandidates(text)` 對整段字串做 chunking、heuristics scoring 與 writeback 分組。這個流程在 V1/V2 可用，但它沒有 adapter 邊界，也沒有任何 `ConversationDoc` 驗證點，導致 V3 後續多來源匯入無法共用入口。

V3 Change 1 已在文件層定義 `ConversationMessage` / `ConversationDoc`，因此本 change 的責任是把既有純文字流程接上這個契約，同時避免破壞 `/extract` 目前的 UX 與提取結果。

約束條件：
- 純靜態 HTML + vanilla JS，無 bundler。
- Node.js `http` server，無額外 API framework。
- 不新增 runtime dependency。

## Goals / Non-Goals

**Goals:**
- 建立可在瀏覽器與 Node 驗證腳本共用的 `PlainTextAdapter` 模組。
- 讓 extraction 入口接受 `ConversationDoc`，而不是直接依賴 raw text。
- 維持既有純文字貼上、候選審核與 writeback 流程可用。
- 補上最小驗證與 QA 證據，確保 backward compatibility。

**Non-Goals:**
- 不新增 ChatGPT / Copilot adapter。
- 不改 `/extract` 的使用者操作路徑或引入多來源 selector。
- 不調整候選分類規則、confidence 策略或 writeback 檔案格式。

## Decisions

### Decision 1: 以共享模組承載 `PlainTextAdapter` 與 schema validator

- 決策：新增一個可同時被瀏覽器 `<script>` 與 Node `require()` 使用的共享 JS 模組，集中放 `createConversationDoc`、`validateConversationDoc`、`adaptPlainTextConversation`。
- 理由：本 change 需要前端 runtime 與 CLI 驗證共用同一份邏輯，避免 browser 與 verification script 各寫一套。
- 替代方案：
  - 方案 A：直接把 adapter 寫死在 `extract.js`，驗證腳本再複製一份。
  - 未採用原因：容易產生 drift，且後續 ChatGPT / Copilot adapter 無法重用。

### Decision 2: `PlainTextAdapter` 先以「單訊息封裝」保留既有行為

- 決策：第一版 `PlainTextAdapter` 將整段非空純文字封裝為單一 `user` message，`source = plain`、`timestamp = null`。
- 理由：目前 heuristics 依賴整段文字的 chunking 與關鍵字匹配；若在此階段強行解析 speaker turns，反而會改變既有候選分段與回歸風險。
- 替代方案：
  - 方案 A：依 `User:` / `Assistant:` 等標記嘗試拆分多筆 message。
  - 未採用原因：純文字輸入格式高度不穩定，會把本次 change 從 refactor 擴大成 parser change。

### Decision 3: extraction pipeline 以 flatten 後的文字重用既有 heuristics

- 決策：新增 `conversationDocToText(doc)`，由 extraction pipeline 先把 `ConversationDoc.messages` 內容串回文字，再沿用既有 `splitIntoChunks` 與 category scoring。
- 理由：這是最小安全修改，可以把入口改成 schema-based，同時不重寫已運作中的 heuristics。
- 替代方案：
  - 方案 A：整個 `extractCandidates` 改寫成 message-aware engine。
  - 未採用原因：超出本 change scope，也會放大回歸面積。

### Decision 4: 驗證分成 unit-level adapter 檢查與 smoke-level UI/API 檢查

- 決策：新增一個 Node 驗證腳本檢查 adapter 輸出與 flatten 結果，並補一份 QA smoke 證據確認 `/extract` happy path 不壞。
- 理由：本 change 屬 logic change，依 quality gate 至少需要基本 smoke；adapter 又需要一個快速、可重跑的 unit-level 檢查。
- 替代方案：
  - 方案 A：只做手動 smoke，不寫任何腳本。
  - 未採用原因：無法穩定驗證 `ConversationDoc` 契約。

## Risks / Trade-offs

- [Risk] 把整段純文字包成單一 message，可能讓未來 message-level attribution 不夠細
  → Mitigation：先以 backward compatibility 為優先；多訊息切分留給後續 adapter 或 V3.x change。
- [Risk] `extract.js` 改入口後，若 flatten 邏輯改變換行策略，可能影響 chunking 結果
  → Mitigation：flatten 時保留雙換行連接，並用驗證腳本覆蓋代表性輸入。
- [Risk] 治理文件已在 working tree 中有未提交修改
  → Mitigation：只在既有變更基礎上追加本次 change 狀態，不回退或覆蓋先前內容。

## Migration Plan

1. 建立 `PlainTextAdapter` 與 validator 共享模組。
2. 在 `/extract` 頁面先載入 adapter 模組，再讓 `extract.js` 使用 `ConversationDoc` 入口。
3. 執行 adapter 驗證腳本與 smoke 驗證，確認 `/extract` 不回歸。
4. 若需回滾，只要移除新模組引用並把 `runExtraction()` 改回直接呼叫 `extractCandidates(text)`。

## Open Questions

- `PlainTextAdapter` 是否要在下一個 change 就開始辨識 `User:` / `Assistant:` 等前綴？
- `ConversationDoc.metadata` 後續是否需要補 `sourceLabel` 供 UI 直接顯示？
