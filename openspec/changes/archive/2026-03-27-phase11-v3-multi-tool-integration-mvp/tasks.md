# Tasks: phase11-v3-multi-tool-integration-mvp

## 1. 多工具 Adapter 介面規格定義

- [x] 1.1 盤點各工具（Copilot / Codex / Gemini）的原始輸出格式與輸入來源
  - 驗收條件：文件列出 ≥3 個工具的輸入來源路徑（對話紀錄 / markdown 輸出）、原始輸出格式摘要；每個工具至少說明 1 項限制或差異點
  - 產出：`docs/workflows/v3-multi-tool-adapter-spec-v1.md`（工具清冊段落）
- [x] 1.2 定義各工具 adapter 介面的預處理規則與抽象邊界
  - 驗收條件：文件說明各工具輸出如何對應到統一入口（預處理規則 ≥2 條）；adapter 邊界以「輸入 → normalize → 輸出」三段式描述；不寫死 API endpoint 或 SDK 版本
  - 產出：`docs/workflows/v3-multi-tool-adapter-spec-v1.md`（adapter 邊界段落）

## 2. Normalized Schema 定義（統一欄位格式）

- [x] 2.1 定義 normalized schema 必要欄位集合
  - 驗收條件：文件定義 ≥6 個欄位（必須包含 `tool_source`、`dedupe_key`、`confidence_score`、`content`、`extracted_at`、`status`）；每個欄位含：名稱、型別、必填性、範例值
  - 產出：`docs/workflows/v3-normalized-schema-v1.md`（欄位表段落）
- [x] 2.2 說明 schema 與現有候選格式的相容性與增量設計原則
  - 驗收條件：文件明確說明 normalized schema 為新增（ADDED）欄位集，不修改現有候選 markdown 格式；說明如何從既有格式對應到 normalized schema 的 ≥3 個欄位
  - 產出：`docs/workflows/v3-normalized-schema-v1.md`（相容性段落）

## 3. 跨工具候選去重策略（dedupe_key 設計）

- [x] 3.1 定義 dedupe_key 的生成規則
  - 驗收條件：文件說明 ≥2 種 dedupe_key 生成策略（content hash exact match 為必選；另一種可為欄位组合 hash 或語意相似）；明確標注 Phase 5 採用哪一種為主要策略，其餘標注為「Phase 6 增量」
  - 產出：`docs/workflows/v3-dedupe-strategy-v1.md`（生成規則段落）
- [x] 3.2 定義去重衝突處理邏輯與典型案例
  - 驗收條件：文件說明 same dedupe_key 時的保留規則（≥1 條：建議保留最高 confidence_score 者）；提供 ≥2 個典型案例（相同 key 衝突 + 不同 key 共存場景）
  - 產出：`docs/workflows/v3-dedupe-strategy-v1.md`（衝突處理 + 案例段落）

## 4. 工具來源可信度評分機制

- [x] 4.1 定義 confidence_score 的評分維度
  - 驗收條件：文件定義 ≥3 個評分維度（例如：session 出現次數、人工確認次數、交叉工具驗證比率）；每個維度含計算說明（不依賴外部 API，可從本地 docs 推算）；明確說明評分格式（0–100 整數）
  - 產出：`docs/workflows/v3-confidence-scoring-v1.md`（評分維度段落）
- [x] 4.2 定義評分對審核排序的影響規則
  - 驗收條件：文件說明 confidence_score 如何影響審核優先序（優先序規則 ≥1 條）；說明評分更新的觸發條件（何時重算）；包含至少 1 個 scenario（高分候選 vs 低分候選的處理差異）
  - 產出：`docs/workflows/v3-confidence-scoring-v1.md`（排序影響 + scenario 段落）

## 5. 工具介面比較檢視規格（spec-driven，UI 延後）

- [x] 5.1 定義跞工具比較視圖的資訊架構與欄位清單
  - 驗收條件：文件定義 ≥5 個視圖欄位（必須包含工具名、來源時間、dedupe_key、confidence_score、狀態）；說明視圖與現有候選審核介面（Phase 3）的邊界（supplementary，不修改現有欄位）
  - 產出：`docs/product/v3-multi-tool-comparison-view-spec-v1.md`（資訊架構 + 欄位段落）
- [x] 5.2 定義比較模式與切換邏輯，標注 Phase 6 前置需求
  - 驗收條件：文件說明 side-by-side 與聚合兩種比較模式的適用場景；定義切換邏輯（≥1 個觸發條件）；明確標注哪些欄位或互動依賴 Phase 6 UI 實作，不可在 Phase 5 docs-only 下模擬
  - 產出：`docs/product/v3-multi-tool-comparison-view-spec-v1.md`（比較模式 + 切換邏輯 + Phase 6 標注段落）

## 6. 驗證與治理同步

- [x] 6.1 執行 strict validate
  - 驗收條件：`openspec validate phase11-v3-multi-tool-integration-mvp --type change --strict` PASS（exit 0）
  - 產出：驗證通過記錄（runlog）
- [x] 6.2 同步治理文件
  - 驗收條件：`docs/roadmap.md`（Phase 5 至少 4 項工作項目 [x]）、`docs/runlog/2026-03-27_README.md`（Phase 5 執行摘要追加）、`docs/handoff/current-task.md`（Phase 5 active）狀態一致
  - 產出：三份文件均已更新
- [x] 6.3 產出 smoke 測試紀錄
  - 驗收條件：`docs/qa/2026-03-27_phase5-smoke.md` 含五項工作的產出檔案存在確認與最小驗收命令
  - 產出：`docs/qa/2026-03-27_phase5-smoke.md`
