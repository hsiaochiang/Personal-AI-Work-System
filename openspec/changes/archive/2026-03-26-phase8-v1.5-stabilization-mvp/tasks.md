# Tasks: phase8-v1.5-stabilization-mvp

## 1. 提取流程與規則穩定化

- [x] 1.1 建立標準提取流程 v1（輸入/步驟/輸出）
  - 驗收條件：流程可由他人依文件重播一次
  - 產出：`docs/workflows/extraction-flow-v1.md`
- [x] 1.2 建立規則清單與例外處理策略
  - 驗收條件：至少 10 條規則且每條有正反例（實際 12 條）
  - 產出：`docs/workflows/extraction-rules-v1.md`

## 2. 模板欄位收斂

- [x] 2.1 盤點 handoff/runlog/qa 現行欄位
  - 驗收條件：形成欄位矩陣與衝突清單
  - 產出：`docs/templates/field-matrix-v1.md`（Part 1 + 衝突清單）
- [x] 2.2 定義必填/選填/棄用欄位與過渡期策略
  - 驗收條件：輸出對照表並能對應舊欄位
  - 產出：`docs/templates/field-matrix-v1.md`（Part 2+3，含過渡期對照）

## 3. 真實案例回顧

- [x] 3.1 選取至少 2 個不同型態案例
  - 驗收條件：案例背景、流程、結果可追溯
  - 產出：`docs/workflows/case-review-v1.md`（案例 A：phase4，案例 B：phase7）
- [x] 3.2 產出差異分析與規則修正建議
  - 驗收條件：每個案例至少 3 條可操作修正點（案例 A 3 條，案例 B 3 條）
  - 產出：`docs/workflows/case-review-v1.md`（差異分析段落）

## 4. 新專案初始化流程

- [x] 4.1 定義初始化步驟（含最小必備文件）
  - 驗收條件：新專案可在 30 分鐘內完成 bootstrap（模擬重播 22 分鐘）
  - 產出：`docs/workflows/new-project-init-v1.md`
- [x] 4.2 執行一次 clean-room style 初始化重播
  - 驗收條件：完整記錄命令、結果、失敗回復步驟
  - 產出：`docs/workflows/new-project-init-v1.md`（重播紀錄段落）

## 5. 專案層與個人層邊界定義

- [x] 5.1 建立路徑與責任邊界規範
  - 驗收條件：覆蓋 `docs/`、`/memories/`、`openspec/`（L-01~L-07 共 7 條）
  - 產出：`docs/workflows/project-personal-boundary-v1.md`
- [x] 5.2 定義衝突處理流程
  - 驗收條件：至少 2 組衝突情境與裁決流程（實際 3 組）
  - 產出：`docs/workflows/project-personal-boundary-v1.md`（衝突處理流程段落）

## 6. 第一版使用說明

- [x] 6.1 產出 v1.5 使用說明初稿
  - 驗收條件：含啟動、常用命令、故障排查、收尾
  - 產出：`docs/guides/usage-guide-v1.5.md`
- [x] 6.2 由非作者角色進行一次照單操作驗證
  - 驗收條件：無口頭補充可完成至少一輪流程
  - 產出：`docs/guides/usage-guide-v1.5.md`（驗證紀錄段落）

## 7. 驗證與治理同步

- [x] 7.1 執行 strict validate
  - 驗收條件：`openspec validate phase8-v1.5-stabilization-mvp --type change --strict` PASS
  - 結果：PASS（exit code 0，2026-03-26）
- [x] 7.2 同步治理文件
  - 驗收條件：`docs/roadmap.md`、`docs/runlog/`、`docs/handoff/` 狀態一致
  - 產出：三份文件均已更新（2026-03-26）
