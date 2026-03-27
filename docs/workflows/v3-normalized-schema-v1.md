# V3 Normalized Schema 規格 v1

> Phase 5（V3 多工具接入）產出。相關 change：`phase11-v3-multi-tool-integration-mvp`
> 性質：docs-only，定義統一欄位格式，不實作資料庫或 runtime 儲存層。

---

## 1. 欄位定義（Tasks 2.1）

Normalized Schema 為跨工具輸出的統一候選欄位規格，供 dedupe、confidence scoring 與 review 流程使用。

| 欄位名稱 | 型別 | 必填 | 範例值 | 說明 |
|----------|------|:----:|--------|------|
| `tool_source` | string | ✅ | `"copilot"` | 來源工具識別字串（`copilot` / `codex` / `gemini`）；小寫；不含版本號 |
| `dedupe_key` | string | ✅ | `"a3f9bc2d"` | 去重鍵（content hash 或欄位組合 hash），詳見 `v3-dedupe-strategy-v1.md` |
| `confidence_score` | integer | ✅ | `72` | 0–100 整數；評分維度與計算說明詳見 `v3-confidence-scoring-v1.md` |
| `content` | string | ✅ | `"使用 openspec validate 確認 change 狀態"` | 提取的候選正文；純文字或 markdown 段落 |
| `extracted_at` | string (ISO 8601) | ✅ | `"2026-03-27T14:30:00+08:00"` | 候選記錄時間；若工具未提供則使用本地記錄時間 |
| `status` | string | ✅ | `"pending"` | 候選狀態：`pending`（待審）/ `approved`（已採納）/ `skipped`（跳過）/ `archived`（已歸檔） |
| `tool_version` | string | ❌ | `"gpt-4o-2024-05"` | 可選；工具版本識別（不寫死於 adapter 規格，僅供記錄） |
| `tags` | string[] | ❌ | `["workflow", "openspec"]` | 可選；語意標籤，供分類與篩選 |
| `source_session_id` | string | ❌ | `"session-2026-03-27-a"` | 可選；來源對話 session 識別碼（若工具可提供） |
| `reviewed_by` | string | ❌ | `"human"` | 可選；審核人標記（`human` / `auto`） |

---

## 2. 相容性與增量設計原則（Task 2.2）

### 2.1 ADDED 設計原則

Normalized Schema 為**新增（ADDED）**欄位集合，**不修改現有候選 markdown 格式**。

- 現有候選文件（如 `docs/memory/output-patterns.md`、`docs/memory/task-patterns.md`）維持現有 markdown 格式不變。
- Normalized Schema 作為跨工具比較與 dedupe 流程的**中間層**，供 review 工具讀取，不直接改寫現有候選文件。
- 若未來需要將 Normalized Schema 持久化，以獨立 JSON / YAML 或新增 markdown 欄位的方式追加，不覆蓋現有內容。

### 2.2 現有格式 → Normalized Schema 欄位映射

| 現有候選格式欄位 | 映射至 Normalized Schema 欄位 | 說明 |
|-----------------|-------------------------------|------|
| 候選段落正文（bullet 或 heading 下的段落） | `content` | 直接取段落文字作為 content |
| 記錄日期（如 `docs/memory/*.md` 的 git commit 時間或首行時間注記） | `extracted_at` | 若無明確時間注記，以文件最後修改時間補充 |
| 候選來源（通常隱含為 Copilot） | `tool_source` | Phase 5 前的既有候選預設 `tool_source = "copilot"` |
| （現有格式無此欄位）| `dedupe_key` | 從 `content` 計算 content hash 補充 |
| （現有格式無此欄位）| `confidence_score` | 依評分維度計算（詳見 `v3-confidence-scoring-v1.md`）；初始值建議以 `session 出現次數` 維度估算 |
| （現有格式無此欄位）| `status` | 現有已整理的候選預設為 `approved`；未審核者預設 `pending` |

---

## 3. 版本記錄

| 版本 | 日期 | 說明 |
|------|------|------|
| v1 | 2026-03-27 | Phase 5 初版 |
