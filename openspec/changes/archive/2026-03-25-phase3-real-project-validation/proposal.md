# Proposal: phase3-real-project-validation

## Why

S2 已完成半自動提取 MVP 的最小閉環與規格定義，但目前仍缺少在真實專案情境下的可靠性證據。若直接前進到後續收斂或產品化，將面臨候選品質、去重有效性與治理可持續性不明的風險。
本 change 目標是在不擴張 S2 scope、不導入 UI 的前提下，以真實任務資料完成可重現驗證，確認 S2 能力可被穩定使用與交接。

## What Changes

- 定義 S3 真實專案驗證協議（樣本選取、run 步驟、證據欄位、通過門檻）。
- 執行至少 2 次真實 run，覆蓋候選產生、人工審核、回寫或拒絕留痕。
- 建立候選品質與去重結果的量化檢核（可採納率、衝突處理完整性）。
- 強化治理追溯：runlog、handoff、roadmap、必要 decision 記錄一致。

## Capabilities

### Capability: Real Project Validation Protocol

建立可重現的真實驗證流程，確保每次 run 都有一致輸入標準、審核流程與證據欄位。

### Capability: Candidate Utility And Dedupe Verification

在真實資料下評估候選可用性，並檢查 dedupe_key 衝突是否被正確辨識與處置。

### Capability: Governance Traceability For Phase 3

將驗證結果同步到治理文件，使下一位 agent 可直接續作，不需口頭補充背景。

## Impact

### Roadmap Impact

- 將專案從 S2（半自動提取 MVP）推進到 S3（真實專案驗證）。
- 維持 docs-first 與最小安全修改策略，避免過早產品化投入。

### Non-goals

- 不修改 S2 既有 scope 定義。
- 不新增 UI、儀表板、可視化審核介面。
- 不導入多工具整合與全自動回寫。
- 不進行資料層重構或向量化能力建置。
