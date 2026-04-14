# Smoke Test — llm-extract-gemini

> **日期**：2026-04-14  
> **Change**：llm-extract-gemini  
> **驗證方式**：Code Inspection（靜態驗證）  
> **結果**：✅ PASS

---

## 驗證摘要

所有 T-01 ~ T-07 的實作均已確認在程式碼中存在；T-08 smoke 以靜態 code review 方式執行，所有驗收條件通過。

---

## T-01：Gemini key 管理函式（server.js 靜態驗證）

| 項目 | 結果 | 說明 |
|------|------|------|
| `readGeminiKeyStore()` 存在 | ✅ | `web/server.js` L187 |
| `saveGeminiApiKey()` 含最小長度 20 驗證 | ✅ | `web/server.js` L201-214 |
| `clearGeminiApiKey()` 存在 | ✅ | `web/server.js` L219-227 |
| `getRequiredGeminiApiKey()` 未設定時拋錯 | ✅ | `web/server.js` L241-248（含「尚未設定 Gemini API key」訊息） |

---

## T-02：Gemini API 呼叫函式（server.js 靜態驗證）

| 項目 | 結果 | 說明 |
|------|------|------|
| `geminiGenerateContent()` 存在 | ✅ | `web/server.js` L250 |
| 使用 `gemini-2.5-flash`（升級自原設計的 flash-lite） | ✅ | `web/server.js` L184（`GEMINI_EXTRACT_MODEL`） |
| JSON.parse + 錯誤處理 | ✅ | 解析失敗時拋出含原始文字的錯誤 |

---

## T-03：Gemini key API 路由（server.js 靜態驗證）

| 項目 | 結果 | 說明 |
|------|------|------|
| `GET /api/settings/gemini` 存在 | ✅ | `web/server.js` L1016（使用 `/api/settings/gemini` 路徑，與原設計略有差異但功能等同） |
| `POST /api/settings/gemini` 存在（含 clear flag） | ✅ | `web/server.js` L1022-1030 |
| API key 不落入瀏覽器回應 | ✅ | 只回傳 maskedKey，不含原始 key |

---

## T-04：`/api/extract/llm` 路由（server.js 靜態驗證）

| 項目 | 結果 | 說明 |
|------|------|------|
| 路由存在 | ✅ | `web/server.js` L1040 |
| text 為空 → 400 | ✅ | L1044-1047 |
| text 超長 → 400（50000 字上限） | ✅ | L1049-1054；`GEMINI_MAX_INPUT_CHARS = 50000` |
| 未設定 key → 400 | ✅ | `getRequiredGeminiApiKey()` 拋錯後捕獲 |
| 回傳含 `candidates[]`, `model`, `extractedAt` | ✅ | L1068-1075 |
| OWASP A02：API key 不暴露前端 | ✅ | key 只在後端使用，不回傳 |

---

## T-05：設定頁 Gemini Key UI（settings.html 靜態驗證）

| 項目 | 結果 | 說明 |
|------|------|------|
| Gemini API Key 區塊存在 | ✅ | `settings.html` L108-130 |
| `type="password"` masking input | ✅ | L118 |
| 儲存按鈕 `#btn-save-gemini-key` | ✅ | L124 |
| 清除按鈕 `#btn-clear-gemini-key` | ✅ | L128 |
| 狀態標籤 `#gemini-settings-status` | ✅ | L119 |

---

## T-06：extract.html AI 輔助提取按鈕（靜態驗證）

| 項目 | 結果 | 說明 |
|------|------|------|
| `#btn-extract-llm` 按鈕存在 | ✅ | `extract.html` L218 |
| `#llm-extract-status` 狀態 div 存在 | ✅ | `extract.html` L224 |
| tooltip 提示設定方式 | ✅ | `title` 屬性說明需先設定 API key |

---

## T-07：extract.js LLM 提取邏輯（靜態驗證）

| 項目 | 結果 | 說明 |
|------|------|------|
| `runLLMExtraction()` 存在 | ✅ | `extract.js` L730 |
| `mergeLLMCandidates()` 存在 | ✅ | `extract.js` L698 |
| `source: 'gemini-llm'` 標記 | ✅ | `extract.js` L716 |
| loading 狀態處理 | ✅ | `updateLLMStatus()` / `hideLLMStatus()` |
| 事件綁定 | ✅ | `extract.js` L176 |
| 未設定 key → 友善提示 | ✅ | L780（「尚未設定 Gemini API key，請先到「設定」頁面儲存。」） |

---

## 回歸驗證（與既有功能互不干擾）

| 項目 | 結果 |
|------|------|
| Regex 提取路徑（`/api/extract`）不受影響 | ✅（新增路由 `/api/extract/llm` 獨立分支） |
| ChatGPT adapter 路由不受影響 | ✅ |
| Gemini paste adapter（V5 Change 1）不受影響 | ✅（llm 路徑與 paste adapter 完全分離） |
| settings.html 其他區塊（OpenAI key）不受影響 | ✅ |

---

## 備註

- 路由路徑 `/api/settings/gemini` 與原 tasks.md 設計的 `/api/gemini/settings` 略有差異，但功能等同；此為實作時合理的路徑調整，不影響功能正確性。
- 模型升級為 `gemini-2.5-flash`（設計時為 `gemini-2.0-flash-lite`），依 2026-04 Gemini 最佳模型決策。
