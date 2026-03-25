# Proposal: phase2-semi-auto-memory-extraction-mvp

## Why

V1 Phase 1 已完成手動流程跑通，但目前治理與記憶沉澱仍仰賴純手動抄寫，容易出現遺漏、格式不一致與證據不同步。為了在不引入 UI、不做全自動回寫的前提下，降低操作摩擦，本 change 以「半自動提取」為核心，先打通最小閉環：對話紀錄輸入 -> 候選沉澱 -> 人工確認 -> 回寫。

## What Changes

- 定義對話紀錄輸入格式（最低可行欄位、可接受來源、格式容錯邊界）。
- 定義候選 schema 與記憶檔映射規則（候選欄位、目標記憶層、去重鍵與衝突處理）。
- 定義人工確認後回寫流程（確認狀態、允許回寫目標、回寫留痕）。
- 定義 validate 與治理文件同步要求（strict validate、handoff、runlog、roadmap 追溯一致）。

## Capabilities

### Capability: Semi-Auto Memory Candidate Pipeline

建立半自動提取 MVP 的單次處理管線，將一段對話紀錄轉為可審核候選，並由人工確認後回寫到指定記憶或治理檔案。

### Capability: Governance Traceability Sync

確保每次執行都會留下可追溯證據，包含 strict validate 結果與 handoff/runlog/roadmap 同步記錄。

## Impact

### Roadmap Impact

- 將專案從 S1（手動流程跑通）推進到 S2（半自動提取 MVP）。
- 維持 docs-first 與最小安全修改策略，不引入大型架構調整。

### Non-goals

- 不做 V2 UI。
- 不做多工具整合。
- 不做全自動回寫。
- 不導入向量資料庫或大型架構重構。
