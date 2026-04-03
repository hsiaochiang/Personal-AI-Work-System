## Context

目前 `/extract` 已支援：

- `PlainTextAdapter`：一般純文字 fallback
- `ChatGPTAdapter`：分享頁 transcript / 官方 JSON 匯入

但 VS Code / GitHub Copilot Chat 的本機 session 仍未接入。根據本機實測，`Code - Insiders` 會在 `%AppData%\\Code - Insiders\\User\\globalStorage\\emptyWindowChatSessions\\*.jsonl` 留下 chat session；檔案內容為 JSONL，第一筆通常是 `kind: 0` 的完整 session snapshot，後續可能追加 patch event。

約束條件：
- 仍使用 Node.js `http` server + vanilla JS。
- 不引入新 dependency。
- 只做 read-only local import，不新增 write API。
- `import-ui-multi-source` 尚未開始，本 change 不可擴大成完整來源 selector。

## Goals / Non-Goals

**Goals:**
- 在共享 adapter 模組中加入 Copilot JSONL parser 與 `ConversationDoc` 正規化。
- 提供最小 server API，讓瀏覽器可列出並讀取本機 session 檔案。
- 在 `/extract` 加入最小 Copilot 匯入區塊，讓使用者可刷新 session 清單、選擇一筆並載入。
- 支援可覆寫的 session 目錄路徑，避免只綁定單一路徑。
- 維持 ChatGPT / plain text 路徑可用，且不新增第二套 extraction engine。

**Non-Goals:**
- 不做多來源 selector / tab 切換。
- 不做 session 搜尋、預覽詳情、lazy pagination。
- 不處理需要登入或雲端 API 的 Copilot data source。
- 不把 session list 寫進 repo 或 cache 到磁碟。

## Decisions

### Decision 1: Copilot parser 放在 `conversation-adapters.js`，server 與 verify 直接共用

- 決策：在共享 adapter 模組中加入 `adaptVSCodeCopilotConversation()`、`listVSCodeCopilotSessionsFromDirectory()` 與相關 helper，讓 Node server、前端 runtime 與驗證腳本都走同一套 parser。
- 理由：V3 已把 schema 與 adapter 邏輯集中，Copilot 本機匯入不應再分裂成 server parser / client parser 兩份。
- 替代方案：
  - 方案 A：只在 server 端 parse，前端只吃 server 回傳的已正規化資料。
  - 未採用原因：會讓 verify 與 runtime 失去共享契約，後續 adapter drift 風險高。

### Decision 2: JSONL 以最新的 `kind: 0` snapshot 為主，忽略增量 patch event

- 決策：解析 JSONL 時逐行讀取，取最後一筆含 `kind === 0` 且 `v` 為物件的完整 snapshot 作為 session state；其他 patch 行先忽略。
- 理由：本機觀察到 `kind: 0` 已包含完整 `requests` 陣列，足以支援 MVP 匯入；增量 patch schema 較不穩定，現在就完整重播成本過高。
- 替代方案：
  - 方案 A：實作所有 patch event replay。
  - 未採用原因：超出最小安全修改，且當前 acceptance 不要求完整 event sourcing。

### Decision 3: session 清單由 server 掃描並排序，前端只負責選擇與載入

- 決策：server 掃描目錄下 `.jsonl` 檔案，過濾可解析且至少有一筆 request 的 session，依檔案最後修改時間排序並回傳摘要。
- 理由：瀏覽器無法直接讀取本機路徑；server 統一處理路徑解析與安全檢查也較容易控管。
- 替代方案：
  - 方案 A：使用 `<input type="file" webkitdirectory>` 讓使用者手動選資料夾。
  - 未採用原因：不符合「真正 auto-import」的 brief 目標，也無法方便刷新最近 session。

### Decision 4: 載入 session 後保留 textarea 預覽，但 extraction 以已正規化的 `ConversationDoc` 為準

- 決策：使用者選到 session 後，前端會保存已載入的 `ConversationDoc`，同時把文字預覽填進 textarea；若使用者手動修改 textarea，則退出 Copilot import 模式並退回既有 auto-detect。
- 理由：這樣能讓使用者看到實際匯入內容，同時避免再把 preview text 逆向解析回 Copilot。
- 替代方案：
  - 方案 A：只顯示 session 標題，不顯示任何內容預覽。
  - 未採用原因：可理解性太差，使用者無法確認自己載入了哪段對話。

### Decision 5: 路徑覆寫採輸入欄位 + query 參數傳遞，不引入持久化設定

- 決策：在 `/extract` 的 Copilot import 區塊提供一個可編輯的路徑輸入欄位；前端在刷新/載入時把該值作為 query string 傳給 server。
- 理由：滿足 brief 的「路徑可由使用者覆寫」，同時保持實作極小，不新增設定頁或 localStorage schema。
- 替代方案：
  - 方案 A：只接受環境變數或硬編碼預設路徑。
  - 未採用原因：不符合使用者可自行覆寫的需求。

## Risks / Trade-offs

- [Risk] 某些 session 檔只有 patch event，缺少完整 snapshot
  → Mitigation：在清單階段直接略過無法解析的檔案，並於 UI 顯示找不到可匯入 session 的訊息。
- [Risk] Copilot `response` payload 含 thinking / tool UI / question carousel，若全量拼接會污染候選
  → Mitigation：parser 僅取可見 assistant 文字值，排除 `thinking`、`toolInvocationSerialized` 等非對話內容。
- [Risk] 使用者填入錯誤路徑或無權限路徑
  → Mitigation：server 僅允許讀取存在的目錄與其下 `.jsonl` 檔，API 回傳明確錯誤；前端顯示 error status。
- [Risk] 載入 session 後再手動編輯 textarea，可能造成來源混淆
  → Mitigation：一旦 textarea 被手動修改，就清除已載入 session 狀態並切回一般輸入模式。

## Migration Plan

1. 補齊 OpenSpec proposal / design / spec / tasks。
2. 在共享 adapter 模組加入 Copilot JSONL parser、session summary 與 `ConversationDoc` adapter。
3. 在 server 加入 read-only session list / load API，並限制檔案型別與目錄邊界。
4. 更新 `/extract` UI，加入 Copilot 本機匯入區塊與狀態管理。
5. 新增 fixture 與 verify script，確認 parser、API 與 `/extract` 頁面 happy path。
6. 補 QA / UI / UX 證據，之後再進入 sync / archive。

## Open Questions

- 未來 `import-ui-multi-source` 是否要把 ChatGPT 與 Copilot 入口收斂成同一組 selector / segmented control？
- 若使用者同時有 `Code` 與 `Code - Insiders`，後續是否要提供雙路徑預設候選？
