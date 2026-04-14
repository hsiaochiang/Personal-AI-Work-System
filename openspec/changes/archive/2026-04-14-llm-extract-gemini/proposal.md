# Change Proposal: llm-extract-gemini

> **狀態**：Draft  
> **建立日期**：2026-04-12  
> **提出者**：Wilson / GitHub Copilot  

---

## 問題陳述

目前知識提取引擎（`extract.js`）使用 **Regex 關鍵字比對**，只對「工作流程 runlog」類型的文字有效。當輸入內容是「學習型 Q&A 對話」（如 Gemini 對話紀錄）時，75 個候選只有 2 個能用，73 個被拒，**等於 97% 的知識被丟棄**。

### 根本原因

1. Regex 引擎無法理解語意，只比對表面字詞
2. `splitIntoChunks` 的 150-字暴力切割破壞知識上下文
3. 知識分類（Categories）只為工作習慣設計，沒有「外部工具知識」的 bucket

---

## 解決方案

加入 **Gemini API 輔助提取路徑**（與現有 Regex 路徑並存）：

1. 後端新增 `/api/extract/llm` — 呼叫 Gemini API，回傳 3~7 個高品質知識候選（JSON 格式）
2. 後端新增 Gemini key 的讀取/儲存函式（師法現有 OpenAI 架構）
3. 設定頁新增 Gemini API Key 管理 UI
4. 前端 `extract.html` 新增「AI 輔助提取（Gemini）」按鈕
5. 前端 `extract.js` 新增呼叫流程與候選渲染

---

## Goals

- [x] 使用者可在設定頁輸入 Gemini API Key
- [x] 提取頁提供「AI 輔助」按鈕，一鍵取得 LLM 提取結果
- [x] 輸入「學習型 Q&A 對話」時，採用率 ≥ 50%（對比目前 2.7%）
- [x] Gemini 回傳候選數量控制在 3~7 個（不多不少）
- [x] 現有 Regex 路徑不受影響，可繼續正常使用

---

## Non-goals

- 不改動 `writeback` 寫回邏輯
- 不改動去重（dedupe）機制
- 不移除既有 Regex 引擎
- 不做 WKM（Wilson Knowledge Management）整合
- 不改動 `conversation-adapters.js` 的 parsing 邏輯

---

## 對 Roadmap 的影響

- 對應 `docs/roadmap.md` S8（知識提取穩定化）後續強化
- 不影響現有布版流程（deploy-to-prod.ps1）
- 新增 `GEMINI_API_KEY` 儲存機制，日後可擴充為其他 Gemini 功能的共用 key

---

## 技術前提

- Node.js 18+ 的 `fetch` 已內建（server.js 已使用）
- Gemini API 免費額度：`gemini-2.0-flash-lite` 每分鐘 30 次，每天 1500 次（足夠個人使用）
- `api-keys.json` 已有 OpenAI key 儲存格式，可直接擴充 `gemini` 欄位
