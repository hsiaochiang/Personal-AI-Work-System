# Tasks: phase1-single-workflow-pilot

## 1. 建立 change artifacts

- [x] 1.1 用 OpenSpec CLI 建立 `phase1-single-workflow-pilot` active change 骨架
  - 驗收條件：`openspec/changes/phase1-single-workflow-pilot/` 存在，且 schema 為 `spec-driven`
- [x] 1.2 補齊 proposal、design、tasks 與至少一份 delta spec
  - 驗收條件：artifacts 符合 `openspec instructions` 顯示的章節要求，且 scope 只限本次 pilot

## 2. 執行一次真實手動 workflow

- [x] 2.1 以既有治理檔完成一次從入口到收尾的手動 workflow
  - 驗收條件：handoff、roadmap、runlog、QA 至少各有一處同步更新，能對應本次 pilot 狀態
- [x] 2.2 更新至少一份專案記憶，記錄本次實跑學到的具體做法
  - 驗收條件：memory 內容包含可重用步驟或檢查點，而非抽象心得

## 3. 留下驗證與摩擦證據

- [x] 3.1 執行 strict validate 與 repo smoke
  - 驗收條件：記錄命令、結果與未執行項目；若有不可逆操作未做，需明確註記原因
- [x] 3.2 產出 pilot 流程驗證紀錄
  - 驗收條件：至少列出實際有用檔案、未使用欄位、摩擦點與最小修正建議