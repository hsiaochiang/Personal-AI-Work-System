# Bug 記錄：Gemini 模型不可用導致 AI 提取失敗

**日期**：2026-04-12  
**嚴重性**：High（功能完全不可用）  
**狀態**：已修復（v1.1.6）

---

## 1. Repro（最短重現步驟）

1. 開啟 `http://localhost:3001/extract.html`
2. 貼入任意文字（>100 字）
3. 點擊「AI 輔助提取（Gemini）」
4. 出現錯誤：`Gemini API 錯誤：This model models/gemini-2.0-flash-lite is no longer available to new users.`（第一次）/ `gemini-2.0-flash` 版本也出現同樣錯誤（第二次）
5. **穩定重現**（新帳號每次必現）

---

## 2. Root Cause（定位證據）

### Bug #1：使用已停用模型 `gemini-2.0-flash-lite`

- **問題**：`web/server.js` 定義 `GEMINI_EXTRACT_MODEL = 'gemini-2.0-flash-lite'`
- **驗證**：呼叫 `GET https://generativelanguage.googleapis.com/v1beta/models?key=...` 列出模型，再逐一測試 `generateContent`：
  ```
  ❌ gemini-2.0-flash    → "no longer available to new users"
  ❌ gemini-2.0-flash-001 → 同上
  ❌ gemini-2.0-flash-lite → 同上
  ✅ gemini-2.5-flash    → OK
  ✅ gemini-2.5-flash-lite → OK
  ```
- **根因**：此帳號為「新使用者」，Google 已對新帳號停用 2.0 系列模型，僅 2.5 系列可用。

### Bug #2：JSON 解析失敗（`gemini-2.5-flash` 夾帶前後文字）

- **問題**：改為 `gemini-2.5-flash` 後，模型回應 JSON 前後夾帶說明文字，舊解析邏輯只移除 markdown fence（`` ```json ... ``` ``），但無法處理純文字前綴。
- **驗證**：錯誤訊息中原始內容以 `{` 開頭（有效 JSON），但 `JSON.parse()` 因前後有額外文字而失敗。

---

## 3. Fix（改了哪些檔案）

| 版本 | 檔案 | 變更 |
|------|------|------|
| v1.1.3 | `web/server.js` | `gemini-2.0-flash-lite` → `gemini-2.0-flash`（失敗，仍停用）|
| v1.1.5 | `web/server.js` | `gemini-2.0-flash` → `gemini-2.5-flash`（模型正確）|
| v1.1.6 | `web/server.js` | 強化 JSON 解析：先直接 parse，失敗後 regex 擷取 `\{[\s\S]*\}` 再 parse |

**最終修正（v1.1.6）核心邏輯**：

```js
// 先嘗試直接解析
try {
  return JSON.parse(cleaned);
} catch (_) { /* 可能有前後雜訊 */ }

// fallback：從文字中擷取第一個完整 JSON 物件
const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  try { return JSON.parse(jsonMatch[0]); } catch (_2) { }
}
throw new Error(`AI 回傳格式錯誤…`);
```

---

## 4. Verify（如何證明修好）

端對端 API 測試（v1.1.6 PROD）：

```
POST http://localhost:3001/api/extract/llm
body: { "text": "Microsoft 365 Copilot 付費版…" }

→ ✅ totalValid=3, model=gemini-2.5-flash
   - tool-insights: M365 Copilot 費用與功能
   - tool-insights: Power Automate Premium 費用
   - task-patterns: Vibe Coding 開發模式
```

---

## 5. Regression（防回歸）

- **未來切換模型前**：必須先呼叫 `GET /v1beta/models?key=...` 並測試 `generateContent`，確認模型對此帳號可用，才能更新 `GEMINI_EXTRACT_MODEL`。
- **JSON 解析**：已改用雙層 fallback（直接 parse → regex 擷取 → 拋錯），可容忍模型在 JSON 前後夾帶說明文字的行為。
- **建議**：未來可在 `buildExtractPrompt` 中加入 `responseMimeType: "application/json"` 的 generationConfig，強制模型只回傳 JSON（Gemini 2.5 支援此設定）。
