# Tasks: phase5-v2-lightweight-ui-workbench-mvp

## 1. S5 邊界定義與契約

- [x] 1.1 確認 S5 scope / non-scope 與 S1-S4 邊界
  - 驗收條件：明確列出「不改寫 archived 內容」與「不做完整產品化」
- [x] 1.2 建立 S5 delta spec 初稿（ADDED Requirements + Scenarios）
  - 驗收條件：每個 Requirement 至少 2 個 Scenarios，含失敗情境

## 2. MVP 流程設計

- [x] 2.1 定義單頁 UI 工作台最小流程
  - 驗收條件：可描述輸入、候選、審核、寫入四步驟
- [x] 2.2 定義候選資料與審核記錄欄位
  - 驗收條件：至少含候選內容、狀態、操作人、時間、理由
- [x] 2.3 定義草稿寫入目標與格式
  - 驗收條件：不直接改長期記憶，寫入位置可追溯

## 3. 驗證與治理同步

- [x] 3.1 完成至少 1 次端到端操作演示
  - 驗收條件：有可重播步驟與結果摘要
- [x] 3.2 執行 strict validate（change）
  - 驗收條件：命令 PASS 並留存證據
- [x] 3.3 同步 roadmap / runlog / handoff / qa
  - 驗收條件：文件狀態一致，下一位 agent 可直接接手

## 4. 收尾與交棒

- [x] 4.1 產出 S5 MVP 結果摘要
  - 驗收條件：含已完成、未完成、風險、下一步
- [x] 4.2 準備交給下一階段（S6 前置）建議
  - 驗收條件：列出可延伸項目但不納入本次 scope

## 核對清單（Checklist）

- [x] 僅做 smallest safe change，無 scope 膨脹
- [x] 未改寫任何 S1-S4 archived artifacts
- [x] ADDED Requirements 與 Scenarios 完整
- [x] 至少一條失敗與回滾情境可驗證
- [x] strict validate 證據已記錄
- [x] 治理文件同步完成且互不矛盾
- [x] handoff 可單靠文件續接
