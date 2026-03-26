# Tasks: phase7-v4-autonomous-continuation-governance-automation-mvp

## 1. S7 啟動與邊界鎖定

- [x] 1.1 建立 S7 active change artifacts（proposal/design/tasks/spec）
  - 驗收條件：四類文件完整存在且內容可讀
- [x] 1.2 鎖定 S7 scope / non-scope 與安全邊界
  - 驗收條件：明確包含不 commit / 不 push / 不 reset 與 docs-first

## 2. 一次到位續作契約

- [x] 2.1 定義單次啟動與自動續作流程
  - 驗收條件：包含開始條件、停止條件、阻塞處理，且可在 1 輪執行中完整演示
- [x] 2.2 定義下一步挑選策略（最高價值 + 最小安全）
  - 驗收條件：可被文字重播，且有至少 1 個失敗保護情境

## 3. 治理同步自動化（MVP）

- [x] 3.1 定義 runlog + handoff 必做同步規則
  - 驗收條件：每輪至少兩者更新一次
- [x] 3.2 定義 UI/UX 變更觸發 uiux/qa 同步規則
  - 驗收條件：觸發條件與例外條件明確

## 4. 驗證與可重播性

- [x] 4.1 產出固定輸出欄位報告樣板
  - 驗收條件：Current state / Changes made / Validation / Open issues / Next step
- [x] 4.2 完成最小 smoke 與治理一致性比對
  - 驗收條件：roadmap/handoff/runlog 不互斥

## 5. 收尾與交接

- [x] 5.1 更新 roadmap 階段記錄與 S7 狀態
  - 驗收條件：Current/Next 與階段轉換記錄一致
- [x] 5.2 交接檔更新（current-task/blockers）
  - 驗收條件：下一位 agent 可直接續作

## 6. 迭代式續作驗收（Cycle 03–06，已關閉）

> Cycle-06 為最終 cycle。後續如需新增檢核陠面，開新 S8 change 追蹤，不在此 change 內繼續新增 cycle。

- [x] 6.1 完成 Cycle-03 一鍵檢核腳本化
  - 驗收條件：可單指令重播 strict validate + 治理一致性
- [x] 6.2 完成 Cycle-04 納入 template verify-only
  - 驗收條件：在同一腳本中納入 template verify-only 並 PASS
- [x] 6.3 完成 Cycle-05 編碼穩定檢核
  - 驗收條件：template verify-only 無 `UnicodeEncodeError` 訊號
- [x] 6.4 完成 Cycle-06 單一真源防回退檢核
  - 驗收條件：roadmap 單一真源約束（merge redirect + 唯一路線圖宣告）可一鍵重播驗證

## Day Plan (One-Day Acceptable Steps)

- D1（已完成）
  - 1.1、1.2
- D2（已完成）
  - 2.1、2.2、4.1
- D3（已完成）
  - 3.1、3.2、4.2
- D4（已完成）
  - 5.1、5.2 + checklist 關閉
- D5（已完成）
  - 6.1、6.2、6.3
- D6（已完成）
  - 6.4

## Checklist

- [x] 維持 smallest safe change
- [x] 不改寫 S1-S6 archived artifacts
- [x] 不使用破壞性 git 指令
- [x] 至少一次可重播驗證
- [x] 治理文件一致
- [x] S7 正式關閉（Cycle-06 為最終；与 roadmap 狀態同步）
