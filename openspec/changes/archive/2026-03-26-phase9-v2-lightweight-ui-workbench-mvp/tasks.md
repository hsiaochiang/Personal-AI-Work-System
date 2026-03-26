# Tasks: phase9-v2-lightweight-ui-workbench-mvp

## 1. UI MVP 設計與資料來源契約

- [x] 1.1 確立資料來源路徑與欄位映射
  - 驗收條件：產出契約文件，涵蓋 5 項 UI 功能的輸入路徑（roadmap/handoff/memory/candidate）與關鍵欄位清單
  - 產出：`docs/workflows/v2-ui-data-contract-v1.md`
- [x] 1.2 定義草稿輸出格式與寫入位置
  - 驗收條件：明確草稿輸出路徑（禁止覆蓋正式 docs）、輸出欄位、run metadata 格式
  - 產出：`docs/workflows/v2-ui-data-contract-v1.md`（輸出規格段落）
- [x] 1.3 以 Stitch 快照為設計基線確認資訊架構
  - 驗收條件：對照 `design/stitch/snapshots/2026-03-26/` 與 proposal 五項功能，逐一確認頁面結構一致
  - 產出：`docs/uiux/2026-03-26_phase3-design-baseline.md`

## 2. 專案總覽與專案頁

- [x] 2.1 實作專案總覽頁（讀取 roadmap.md 與 openspec/changes/）
  - 驗收條件：可正確呈現 Phase 清單（含完成狀態）、Active Change 清單；讀取失敗時顯示空狀態
  - 產出：UI 元件 / 靜態入口頁（路徑依 1.2 草稿輸出規格）
  - 實作說明：`design/stitch/drafts/overview-impl-spec.md`
- [x] 2.2 實作專案詳情頁（Active Change 詳情）
  - 驗收條件：可從 `openspec/changes/<name>/proposal.md` 讀取並呈現 Change Name、Scope、Acceptance Criteria
  - 產出：UI 元件 / 詳情頁模板
  - 實作說明：`design/stitch/drafts/overview-impl-spec.md`

## 3. Handoff Builder

- [x] 3.1 實作 Handoff 草稿載入與編輯介面
  - 驗收條件：可從 `docs/handoff/current-task.md` 載入結構化欄位並允許編輯；必填欄位（Task Name, Goal, Next Step）空白時阻止提交
  - 產出：Handoff Builder UI（靜態前端）
  - 實作說明：`design/stitch/drafts/handoff-builder-impl-spec.md`
- [x] 3.2 實作 Handoff 草稿輸出
  - 驗收條件：輸出草稿至指定草稿路徑（含 generated-at 時間戳）；原始 `docs/handoff/current-task.md` 不被修改
  - 產出：草稿輸出邏輯（含路徑檢查）
  - 實作說明：`design/stitch/drafts/handoff-builder-impl-spec.md`

## 4. 候選審核介面

- [x] 4.1 實作候選清單呈現
  - 驗收條件：可從候選資料來源（依 1.1 契約）讀取並呈現欄位（summary, confidence, source_ref）；候選數 = 0 時顯示空狀態
  - 產出：候選審核 UI（清單視圖）
  - 實作說明：`design/stitch/drafts/candidate-review-impl-spec.md`
- [x] 4.2 實作採用/拒絕決策與草稿輸出
  - 驗收條件：每筆候選需有明確決策（adopted/rejected）才可提交；pending 項目存在時阻止提交；草稿輸出含 reviewer/reviewed_at/reason；不覆蓋正式文件
  - 產出：決策操作邏輯 + 草稿輸出
  - 實作說明：`design/stitch/drafts/candidate-review-impl-spec.md`

## 5. Memory Review 介面

- [x] 5.1 實作記憶候選分類呈現
  - 驗收條件：從 `docs/memory/` 讀取所有 markdown 文件，按分類（decision-log, preference-rules, output-patterns 等）分組呈現摘要
  - 產出：Memory Review UI（分類清單視圖）
  - 實作說明：`design/stitch/drafts/memory-review-impl-spec.md`
- [x] 5.2 實作記憶審核操作與草稿輸出
  - 驗收條件：可對每筆記憶項目執行採用/拒絕；adopted 項目輸出至草稿層（含 run metadata）；原始 `docs/memory/` 文件不被修改
  - 產出：記憶審核操作邏輯 + 草稿輸出
  - 實作說明：`design/stitch/drafts/memory-review-impl-spec.md`

## 6. 驗證與治理同步

- [x] 6.1 執行 strict validate
  - 驗收條件：`openspec validate phase9-v2-lightweight-ui-workbench-mvp --type change --strict` PASS
  - 結果：PASS（2026-03-26，exit 0）
- [x] 6.2 同步治理文件
  - 驗收條件：`docs/roadmap.md`（Phase 3 五項勾選完成）、`docs/runlog/`、`docs/handoff/` 狀態一致
  - 產出：三份文件均已更新（2026-03-26）
- [x] 6.3 產出 smoke 測試紀錄
  - 驗收條件：`docs/qa/<date>_smoke.md` 含五項 UI 功能的端到端驗收命令與通過紀錄
  - 產出：`docs/qa/2026-03-26_phase3-smoke.md`
