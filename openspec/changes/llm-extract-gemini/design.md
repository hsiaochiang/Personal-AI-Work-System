# Change Design: llm-extract-gemini

> **狀態**：Draft  
> **建立日期**：2026-04-12  

---

## 架構決策

### D-01：Gemini API 在後端呼叫，不在前端直接呼叫

**決定**：`/api/extract/llm` 在 `server.js` 後端執行 Gemini 呼叫。  
**理由**：
- 避免 API key 暴露在 browser 前端
- 符合現有 OpenAI session API 的架構慣例（所有 API key 都存在後端 `api-keys.json`）
- 符合 OWASP Top 10 A02（Cryptographic Failures）的最小暴露原則

### D-02：使用 `gemini-2.0-flash-lite` 作為默認模型

**決定**：預設使用 `gemini-2.0-flash-lite`（免費額度充足）。  
**理由**：
- 每天 1500 次免費請求，個人使用綽綽有餘
- 回覆速度快（< 2 秒），不影響使用體驗
- 知識提取任務不需要複雜推理，flash-lite 已足夠

### D-03：Gemini API key 儲存至現有 `api-keys.json`，新增 `gemini` 欄位

**決定**：擴充 `api-keys.json` 結構加入 `gemini: { apiKey, updatedAt }`。  
**理由**：師法現有 OpenAI key 管理，不另起一套，管理函式可直接平行複製。

---

## 資料流

```
使用者點擊「AI 輔助提取」
    │
    ▼
POST /api/extract/llm  { text: "..." }
    │
    ├── 讀取 api-keys.json → 取得 gemini.apiKey
    ├── 建構 Gemini API request（見 Prompt 設計）
    └── fetch https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent
            │
            ▼
        Gemini 回傳 { candidates: [...] }（JSON）
            │
            ▼
        server 解析 → 驗證結構 → 回傳 { candidates: [...] }
            │
            ▼
    前端 extract.js 接收 → renderCandidates()
    （使用同一套 adopt/reject UI）
```

---

## Gemini Prompt 設計

### System Prompt（固定）

```
你是一個專業的個人知識管理助手，任務是從 AI 對話紀錄中提取有長期保存價值的知識。

提取標準（必須同時符合）：
1. 使用者一年後仍會需要的資訊
2. 有具體的工具名稱、費用、功能差異、或操作方法
3. 不是泛泛而談的概念，而是可以直接執行或參考的具體知識

絕對不要提取：
- 純問答過渡句（如「你說的很對」「讓我補充...」）
- 已經是常識的概念（如「AI 可以幫助工作效率」）
- 同一個事實的重複表達

輸出格式（必須是合法 JSON，不要加 markdown code block）：
{
  "candidates": [
    {
      "category": "tool-insights" | "preference-rules" | "task-patterns" | "decision-log" | "market-knowledge",
      "summary": "一句話的知識點摘要（最多 80 字）",
      "evidence": "從原文摘錄的關鍵句（最多 150 字）",
      "writeback_target": "docs/memory/skill-candidates.md 或其他合適的記憶檔案",
      "confidence": 0.0 到 1.0
    }
  ]
}

候選數量：最少 3 個，最多 7 個。只提取最有價值的，寧缺勿濫。
```

### User Prompt（動態）

```
請從以下對話內容提取有長期保存價值的知識：

<conversation>
{USER_TEXT}
</conversation>
```

---

## 前端變更

### `extract.html`

在現有「提取候選知識」按鈕下方，新增：

```html
<button id="btn-extract-llm" class="btn btn-primary llm-btn">
  <span class="material-symbols-outlined">auto_awesome</span>
  AI 輔助提取（Gemini）
</button>
<div id="llm-status" class="llm-status hidden"></div>
```

### `extract.js`

新增函式：
- `runLLMExtraction()` — fetch POST `/api/extract/llm`，顯示 loading，接收 candidates
- `mergeLLMCandidates(rawCandidates)` — 將 Gemini 回傳的候選轉為 `candidates[]` 格式（與 Regex 候選格式一致）

Gemini 候選的 `source` 欄位標記為 `'gemini-llm'`，在 renderCandidates 中顯示「AI 建議」badge。

---

## 後端變更（`server.js`）

### 新增函式

```javascript
// 讀取 Gemini key
function readGeminiKeyStore()

// 取得必要的 Gemini key（若無則拋出錯誤）
function getRequiredGeminiApiKey()

// 儲存 Gemini key
function saveGeminiApiKey(apiKey)

// 清除 Gemini key  
function clearGeminiApiKey()

// Gemini API request（使用內建 fetch）
async function geminiGenerateContent(promptText, apiKey)
```

### 新增 API 路由

```
GET  /api/gemini/settings    → { configured: bool, maskedKey: string, updatedAt: string }
POST /api/gemini/key         → { ok: true }  body: { apiKey: string }
DELETE /api/gemini/key       → { ok: true }
POST /api/extract/llm        → { candidates: [...] }  body: { text: string }
```

---

## 設定頁變更（`settings.html` / `settings.js`）

> 若 settings 頁有獨立的 JS，在其中新增 Gemini key 區塊；若由 server.js 或 inline script 處理，則新增對應 section。

新增 UI 區塊（對照現有 OpenAI key 區塊的樣式）：

```
Gemini API Key
[輸入框 masked]  [儲存]  [清除]
狀態：已設定 / 未設定
```

---

## 安全性考量

- Gemini API key 儲存在 `api-keys.json`（已在 `.gitignore` 中，不會進 git）
- 後端 API `/api/extract/llm` 只接受本機請求（server 綁定 localhost）
- 前端傳送的 `text` 長度上限：50,000 字（防止超大請求）
- Gemini 回傳的 JSON 做結構驗證，避免注入不合法欄位
