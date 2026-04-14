# Tasks: llm-extract-gemini

> **狀態**：Done（實作已完成，2026-04-14 Archive）  
> **建立日期**：2026-04-12  

---

## Task 列表

### T-01：後端 — Gemini key 管理函式

**檔案**：`web/server.js`  
**工作**：新增 4 個函式（師法現有 OpenAI 函式）：
- `readGeminiKeyStore()` — 讀取 `api-keys.json` 的 `gemini` 欄位
- `getRequiredGeminiApiKey()` — 取得 key，若無則拋錯
- `saveGeminiApiKey(apiKey)` — 驗證並儲存（最小長度 20 字）
- `clearGeminiApiKey()` — 清除 key

**驗收條件**：
- [x] 呼叫 `saveGeminiApiKey('AIza...')` → `api-keys.json` 有 `gemini.apiKey` 欄位
- [x] 呼叫 `readGeminiKeyStore()` → 回傳 `{ apiKey: '...' , updatedAt: '...' }`
- [x] 空 key 呼叫 `getRequiredGeminiApiKey()` → 拋出含「尚未設定 Gemini API key」的錯誤

---

### T-02：後端 — Gemini API 呼叫函式

**檔案**：`web/server.js`  
**工作**：新增 `geminiGenerateContent(promptText, apiKey)` 函式：
- endpoint：`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent`
- auth：query parameter `key=API_KEY`
- request body：`{ contents: [{ parts: [{ text: promptText }] }] }`
- 解析回傳：取 `candidates[0].content.parts[0].text`
- 對回傳文字做 JSON.parse，若失敗則拋出含原始文字的錯誤

**驗收條件**：
- [x] 傳入合法 prompt → 回傳 parsed JSON
- [x] 傳入無效 key → 拋出包含 HTTP 狀態碼的錯誤

---

### T-03：後端 — Gemini key API 路由

**檔案**：`web/server.js`  
**工作**：在 router 中新增：
- `GET /api/gemini/settings` → 回傳 `{ configured, maskedKey, updatedAt }`
- `POST /api/gemini/key` → body `{ apiKey }` → 儲存，回傳 `{ ok: true }`
- `DELETE /api/gemini/key` → 清除，回傳 `{ ok: true }`

**驗收條件**：
- [x] curl `GET /api/settings/gemini` GET → JSON 含 `configured: false`（未設定時）
- [x] curl `POST /api/settings/gemini` POST with `{ "apiKey": "AIza..." }` → 200 + 摘要回傳

---

### T-04：後端 — `/api/extract/llm` 路由

**檔案**：`web/server.js`  
**工作**：新增 `POST /api/extract/llm`：
1. 驗證 body `text` 欄位存在且不超過 50,000 字
2. 呼叫 `getRequiredGeminiApiKey()`
3. 建構 prompt（system prompt + user text，見 design.md）
4. 呼叫 `geminiGenerateContent(prompt, apiKey)`
5. 驗證回傳 `candidates` 為陣列（3~7 個），每個含必要欄位
6. 回傳 `{ candidates: [...], model: 'gemini-2.0-flash-lite', extractedAt: ISO8601 }`

**驗收條件**：
- [x] 正常輸入 → 200 回傳 3~7 個候選
- [x] 未設定 key → 400 `{ error: '尚未設定 Gemini API key' }`
- [x] text 超過 50000 字 → 400 `{ error: '內容過長...' }`
- [x] Gemini 回傳非 JSON → 500 `{ error: 'AI 回傳格式錯誤...' }`

---

### T-05：設定頁 — Gemini Key UI

**檔案**：`web/public/settings.html`（或對應 settings JS）  
**工作**：在設定頁新增「Gemini API Key」管理區塊，對照現有 OpenAI key 區塊的版型：
- masking input（`type="password"`）
- 儲存按鈕（POST `/api/gemini/key`）
- 清除按鈕（DELETE `/api/gemini/key`）
- 狀態標籤（已設定 / 未設定 + updatedAt）

**驗收條件**：
- [x] 開啟設定頁，可看到 Gemini API Key 區塊
- [x] 輸入 key 後按儲存 → 狀態更新為「已設定」
- [x] 按清除 → 狀態回「未設定」

---

### T-06：前端 extract.html — AI 輔助提取按鈕

**檔案**：`web/public/extract.html`  
**工作**：在「提取候選知識」按鈕附近新增：
- `<button id="btn-extract-llm">AI 輔助提取（Gemini）</button>`
- `<div id="llm-status" class="llm-status hidden">` — 顯示 loading / 錯誤訊息

**驗收條件**：
- [x] 頁面顯示新按鈕，樣式與現有按鈕一致
- [x] Gemini key 未設定時，點擊後顯示「請先在設定頁設定 Gemini API key」提示

---

### T-07：前端 extract.js — LLM 提取邏輯

**檔案**：`web/public/js/extract.js`  
**工作**：新增：
- `runLLMExtraction()` — 取 textarea 文字 → POST `/api/extract/llm` → 更新 `candidates[]` → renderCandidates()
- `mergeLLMCandidates(rawCandidates)` — 將 Gemini 候選格式轉換為 extract.js 內部格式（含 `source: 'gemini-llm'` 標記）
- LLM 提取中顯示 loading 狀態，完成後滾動到候選列表
- 候選 render 時顯示「AI 建議」小標籤（對照現有 PLAIN 來源標籤）

**驗收條件**：
- [x] 點擊 AI 提取按鈕 → loading 顯示 → 候選出現
- [x] 候選卡片顯示「AI 建議」來源標籤
- [x] 可正常 adopt / reject，並 writeback（使用現有邏輯）

---

### T-08：Smoke Test

**執行方式**：手動測試 + 記錄於 `docs/qa/2026-04-12_llm-extract-gemini-smoke.md`

**測試項目**：
- [x] 貼入 `0resource/gemini_20260410.txt` 內容 → AI 輔助提取 → ≥ 3 個有意義候選
- [x] 採用率（採用 / 總候選）≥ 50%
- [x] 既有 Regex 提取按鈕仍正常運作
- [x] 設定頁 Gemini key 儲存 / 顯示 / 清除功能正常
- [x] 未設定 key 時點擊 AI 提取 → 正確錯誤提示
