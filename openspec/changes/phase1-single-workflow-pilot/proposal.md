# Proposal: phase1-single-workflow-pilot

## Why

目前 repo 已具備治理入口、handoff、roadmap 與 OpenSpec 結構，但還沒有一次完整、真實、手動的 workflow 驗證證據。若沒有第一個 pilot，後續第 2 次與第 3 次手動重跑就沒有可對照的基線，也無法判定現有治理檔是否真的足以支撐流程重播。

## What Changes

- 建立 `phase1-single-workflow-pilot` 作為第一個 active OpenSpec change。
- 用本 repo 既有治理文件完成 1 次完整手動 workflow，涵蓋規劃入口、handoff、實作入口、工作收尾後的記憶更新與 runlog 留痕。
- 補齊本次 pilot 所需的最小 OpenSpec artifacts，並執行 strict validate。
- 針對本次實跑留下流程驗證紀錄，明確記錄哪些檔案實際有用、哪些欄位沒被使用、哪裡產生摩擦，以及最小修正建議。

## Capabilities

### Capability: Manual Workflow Pilot Evidence

建立一次可追溯、可重播的手動 workflow pilot，讓下一位 agent 或使用者只靠 repo 文件就能重新啟動下一次驗證。

### Capability: Workflow Friction Capture

把本次 pilot 實際暴露的摩擦點沉澱成治理證據與專案記憶，供後續第二次、第三次手動驗證比較與收斂。

## Impact

### Roadmap Impact

- 此 change 會把 repo 從「只有規劃摘要」推進到「已有可 validate 的 OpenSpec change 與一次真實 pilot 證據」的狀態。
- 本次仍不代表整個 Phase 1 完成，只提供第一個手動 workflow 基線。

### Non-goals

- 不新增產品功能、正式 UI、搜尋介面或多工具同步。
- 不進入半自動提取、對話解析腳本、向量資料庫。
- 不一次完成第 2 次與第 3 次手動驗證。
- 不重寫整套模板或治理制度，只修正本次 pilot 直接暴露的最小必要問題。