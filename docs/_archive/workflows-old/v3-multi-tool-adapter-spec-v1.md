# V3 多工具 Adapter 介面規格 v1

> Phase 5（V3 多工具接入）產出。相關 change：`phase11-v3-multi-tool-integration-mvp`
> 性質：docs-only，不實作 runtime adapter。

---

## 1. 工具清冊（Tasks 1.1）

各工具的輸入來源路徑與原始輸出格式摘要：

### 1.1 GitHub Copilot Chat

| 項目 | 說明 |
|------|------|
| **輸入來源路徑** | VS Code Chat 對話記錄（本地 session JSON）、手動複製貼上至 `docs/memory/` 下的 markdown 候選 |
| **原始輸出格式** | 純文字對話結構；Markdown 格式回應；無標準 JSON schema 輸出 |
| **格式摘要** | 對話回覆以段落文字為主；候選多以 bullet 或 heading 整理 |
| **限制／差異** | 無官方對話匯出 API；需人工複製或由使用者手動整理至候選文件；無 metadata 欄位（如 timestamp 需人工補充） |

### 1.2 OpenAI Codex（Codex CLI / API）

| 項目 | 說明 |
|------|------|
| **輸入來源路徑** | Codex CLI 對話記錄、`codex` 指令輸出重定向至 markdown 或 txt 檔 |
| **原始輸出格式** | JSON 包裝的回應物件（含 `choices[].message.content` 欄位）；或 CLI stdout 純文字 |
| **格式摘要** | API 輸出：`{ "choices": [{ "message": { "role": "assistant", "content": "..." } }] }`；CLI 模式下以 stdout 純文字輸出 |
| **限制／差異** | API 模式輸出有 `usage` 統計，但缺乏 session ID 或任務脈絡；CLI 輸出無結構化 metadata；需預處理以剝離 JSON 包裝取得 `content` |

### 1.3 Google Gemini（Gemini Code Assist / API）

| 項目 | 說明 |
|------|------|
| **輸入來源路徑** | Gemini CLI 對話，或 VS Code Gemini Code Assist 指令回應；工作區 markdown 候選（人工整理） |
| **原始輸出格式** | JSON schema（含 `candidates[].content.parts[].text`）或 IDE 內嵌面板純文字 |
| **格式摘要** | API 輸出：`{ "candidates": [{ "content": { "parts": [{ "text": "..." }] } }] }`；IDE 面板模式與 Copilot 類似（對話文字） |
| **限制／差異** | candidates 可能為多個（需選取 index 0 或最高 safetyRatings）；API 輸出含 `safetyRatings` 和 `finishReason`，需過濾非 `STOP` 狀態；token 計費欄位與 Codex 格式不同 |

---

## 2. Adapter 邊界定義（Task 1.2）

### 2.1 三段式描述：輸入 → Normalize → 輸出

```
原始工具輸出（各格式）
    │
    ▼
[輸入層] 接收來源
    - Copilot：純文字段落（markdown 候選）
    - Codex：JSON choices[0].message.content 或 CLI stdout
    - Gemini：JSON candidates[0].content.parts[0].text 或 IDE 純文字
    │
    ▼
[預處理層] Normalize
    - 統一提取 content 字串
    - 去除 API wrapper（JSON 解包）
    - 補充 metadata（tool_source、extracted_at、tool_version）
    - 輸出為 Normalized Schema 格式
    │
    ▼
[輸出層] Normalized Candidate 物件
    符合 v3-normalized-schema-v1 欄位規格
    可進入 dedupe → confidence scoring → review 流程
```

### 2.2 預處理規則

1. **規則 P1 — 內容解包（Content Extraction）**
   - Codex API 輸出：取 `choices[0].message.content`；Gemini API 輸出：取 `candidates[0].content.parts[0].text`；Copilot：直接以整理後的 markdown 段落作為 content。
   - 若 `finishReason` 非 `STOP`（Gemini）或 `finish_reason` 非 `stop`（Codex），標記 `status = skipped`，不進入 normalize 流程。

2. **規則 P2 — Metadata 補充與標準化**
   - 若工具輸出缺乏 `extracted_at`，以本地記錄時間（ISO 8601）補充。
   - `tool_source` 固定填入識別字串：`copilot`、`codex`、`gemini`（小寫，不含版本號，版本另記於可選欄位 `tool_version`）。

3. **規則 P3 — 不寫死 API Endpoint 或 SDK 版本**
   - Adapter 規格不依賴特定 API endpoint URL（如 `api.openai.com/v1`）或 SDK 版本號（如 `openai==1.x`）。
   - 欄位路徑（如 `choices[0]`、`candidates[0]`）以本文件明示；若工具平台改版導致路徑變更，需更新本規格，不影響 normalized schema 下游設計。

---

## 3. 版本記錄

| 版本 | 日期 | 說明 |
|------|------|------|
| v1 | 2026-03-27 | Phase 5 初版 |
