## Context

目前 `/extract` 的 runtime 已經透過 `PlainTextAdapter` 走 `ConversationDoc` 邊界，但使用者仍只能貼上一般文字。V3 brief 要求 `chatgpt-adapter` 支援兩種半自動輸入：

- ChatGPT 分享頁面複製文字貼上
- ChatGPT 官方 JSON 匯出（手動上傳）

約束條件：
- 純靜態 HTML + vanilla JS，無 bundler。
- Node.js `http` server，無額外 API framework。
- 不新增 runtime dependency。
- `import-ui-multi-source` 已拆為後續 change，因此本次不能擴大成完整多工具 selector。

## Goals / Non-Goals

**Goals:**
- 在共享 adapter 模組中加入 `ChatGPTAdapter` 與 auto-detection。
- 支援 ChatGPT 分享頁複製格式的 role/content 解析。
- 支援 ChatGPT 官方 conversation JSON 的匯入，並在缺少挑選 UI 時用 deterministic 規則選擇單一 conversation。
- 在 `/extract` 保留既有 textarea 操作路徑，額外提供最小檔案上傳入口。
- 維持 plain text fallback 與既有 heuristics / review / writeback 行為。

**Non-Goals:**
- 不實作多來源 selector。
- 不實作 memory source attribution。
- 不實作跨 conversation 清單挑選、搜尋或預覽。
- 不修改 extraction category heuristics 或 writeback 格式。

## Decisions

### Decision 1: 沿用共享模組承載 ChatGPT parsing 與 auto-detection

- 決策：在 `web/public/js/conversation-adapters.js` 擴充 `adaptChatGPTConversation` 與 `adaptConversationInput`，讓瀏覽器 runtime 與 Node 驗證腳本共用同一份邏輯。
- 理由：V3 Change 2 已把 adapter / validator 集中在共享模組，本 change 應延續同一個維護點，避免 parser drift。
- 替代方案：
  - 方案 A：把 ChatGPT parsing 寫在 `extract.js`，驗證腳本再複製一份。
  - 未採用原因：高機率造成 browser / verify 邏輯分歧。

### Decision 2: ChatGPT JSON 匯入以「單一 conversation」為輸出單位，陣列輸入預設選最近更新的一筆

- 決策：若使用者上傳的 JSON 是 conversation 陣列，adapter 會選擇 `update_time` / `create_time` 最新的一筆來建立 `ConversationDoc`。
- 理由：本次沒有 conversation picker UI；直接拒絕整份官方 export 會讓「上傳 JSON」幾乎不可用，因此採 deterministic 選擇作為最小可用解。
- 替代方案：
  - 方案 A：遇到多筆 conversation 就直接報錯。
  - 未採用原因：與 brief 的「官方 JSON 匯出可上傳」目標衝突。
  - 方案 B：在本 change 內加入 conversation picker。
  - 未採用原因：會擴大到 `import-ui-multi-source` / richer import UI 範圍。

### Decision 3: JSON conversation 依 `current_node` 祖先鏈重建訊息順序，缺值時退回 create-time 排序

- 決策：優先使用 ChatGPT export 的 `current_node` 與 `mapping[*].parent` 還原主對話路徑；若缺少這些欄位，再退回 `message.create_time` 排序。
- 理由：官方 export 可能包含分支與工具節點；沿主路徑較能接近使用者最後看到的 conversation。
- 替代方案：
  - 方案 A：直接遍歷所有 mapping 節點並依時間排序。
  - 未採用原因：分支 conversation 容易混在一起。

### Decision 4: 分享頁貼上以 role-heading transcript parser 處理，不嘗試解析完整 HTML

- 決策：支援使用者從 ChatGPT 分享頁複製後得到的純文字 transcript，透過 `You` / `User` / `ChatGPT` / `Assistant` 等 role heading 切段；不支援原始 HTML 貼入。
- 理由：目前 `/extract` 只有 textarea，真正可操作的是貼上後的文字內容；直接做 HTML parser 不符合最小修改原則。
- 替代方案：
  - 方案 A：僅支援 JSON，完全不處理分享頁貼上。
  - 未採用原因：與本 change 的主要使用者故事不符。

### Decision 5: 檔案上傳只做 client-side 讀取，仍以 textarea 作為單一可見輸入面

- 決策：在 `/extract` 新增一個最小檔案上傳按鈕與 hidden file input，檔案內容讀進 textarea，再由既有提取按鈕啟動流程。
- 理由：避免新增 server upload endpoint，也讓 paste / upload 最終共用同一個 extraction path。
- 替代方案：
  - 方案 A：新增 server 端檔案 upload API。
  - 未採用原因：超出目前 static + minimal API 架構需要。

## Risks / Trade-offs

- [Risk] 分享頁複製文字格式可能因語系或 UI 版本差異而改變
  → Mitigation：role label parser 保留多個 alias，且只在成功辨識多段 user/assistant transcript 時才當作 ChatGPT。
- [Risk] 官方 JSON export 若包含多筆 conversation，預設選最新一筆可能不是使用者想要的那一筆
  → Mitigation：在 UI 文案與 QA 中明確記錄此限制；完整挑選流程留給後續 import UI change。
- [Risk] 檔案上傳加入後，若狀態沒有和 textarea 同步，可能造成使用者混淆
  → Mitigation：上傳後顯示檔名與已載入狀態，並保持 textarea 可見、可編輯。
- [Risk] Auto-detection 若誤判 plain text 為 ChatGPT transcript，會改變候選來源
  → Mitigation：偵測門檻要求至少形成有效多訊息 transcript；否則退回 `PlainTextAdapter`。

## Migration Plan

1. 建立 `ChatGPTAdapter`、JSON parser、share transcript parser 與 auto-detection。
2. 更新 `/extract` 頁面，加入最小 file upload 與說明文案。
3. 補 fixture、驗證腳本、UI/UX/smoke 證據，確認 ChatGPT 與 plain-text 都可走通。
4. 若需回滾，可移除 `extract.html` 的 upload 控制與 `extract.js` 的 auto-detect，讓流程退回 `adaptPlainTextConversation()`。

## Open Questions

- ChatGPT 分享頁在繁中介面是否會出現額外 role 標籤別名，需要後續補件？
- 後續 `import-ui-multi-source` 是否應把「多筆 conversation 選擇」一併納入？
