# Tasks: phase10-v2.5-multi-project-shared-capability-mvp

## 1. 個人偏好與專案偏好正式分層

- [x] 1.1 盤點現有 docs 結構，逐一標注層級歸屬
  - 驗收條件：產出路徑盤點列表，涵蓋 `docs/`、`/memories/` 等所有主要路徑，每條路徑標注 personal / per-project / shared；至少 5 筆 personal、5 筆 per-project
  - 產出：`docs/workflows/v2-5-personal-project-boundary-v1.md`（盤點段落）
- [x] 1.2 定義層級目錄規範與邊界原則
  - 驗收條件：文件包含邊界原則（≥3 條）、個人層路徑清單、專案層路徑清單、衝突時的決策規則
  - 產出：`docs/workflows/v2-5-personal-project-boundary-v1.md`（完整版）

## 2. Shared Workflow 整理與標準化

- [x] 2.1 全盤掃描 `docs/workflows/` 並逐一標注可重用性
  - 驗收條件：列出所有現有 workflow 文件，每份標注「personal-only / shared / per-project」；shared 類別 ≥3 份
  - 產出：`docs/workflows/v2-5-shared-workflows-index-v1.md`（盤點段落）
- [x] 2.2 定義共享 workflow 引用規範
  - 驗收條件：文件說明新專案如何引用 shared workflow（路徑規範、是否複製 vs 引用）；包含至少 1 個引用範例
  - 產出：`docs/workflows/v2-5-shared-workflows-index-v1.md`（引用規範段落）

## 3. 跨專案模板集建立

- [x] 3.1 建立 handoff 初始化模板
  - 驗收條件：`docs/templates/handoff-init.md` 含必填欄位（Task, Goal, Scope, Constraints, Done, In Progress, Next Step）與填寫說明；必填欄位以 `[REQUIRED]` 標注
  - 產出：`docs/templates/handoff-init.md`
- [x] 3.2 建立 runlog 初始化模板
  - 驗收條件：`docs/templates/runlog-init.md` 含日期、摘要、完成項目、In Progress、Next Step 欄位；包含填寫範例
  - 產出：`docs/templates/runlog-init.md`
- [x] 3.3 建立 roadmap 初始化模板
  - 驗收條件：`docs/templates/roadmap-init.md` 含願景、產品路線表（Phase 結構）、目前狀態、推進原則欄位；必填欄位以 `[REQUIRED]` 標注
  - 產出：`docs/templates/roadmap-init.md`
- [x] 3.4 建立 decision-log 初始化模板
  - 驗收條件：`docs/templates/decision-log-init.md` 含決策標題、日期、決策內容、理由、影響欄位；包含填寫範例
  - 產出：`docs/templates/decision-log-init.md`

## 4. 技能候選升級流程定義

- [x] 4.1 定義升級生命週期四階段
  - 驗收條件：文件明確說明「候選（Candidate）→ 審核（Under Review）→ 採用（Adopted）→ 升級（Promoted to Skill）」四階段的觸發條件與責任人；每階段 ≥1 個具體觸發條件
  - 產出：`docs/workflows/v2-5-skill-candidate-promotion-v1.md`（生命週期段落）
- [x] 4.2 定義升級輸出路徑與格式規範
  - 驗收條件：文件說明 Promoted Skill 的輸出路徑（`.github/copilot/skills/` 或指定路徑）、檔案命名規範、最小必要欄位；包含 ≥1 個 scenario 範例
  - 產出：`docs/workflows/v2-5-skill-candidate-promotion-v1.md`（輸出規範 + scenario 段落）

## 5. 輕量跨專案儀表板規格

- [x] 5.1 定義跨專案儀表板資訊架構
  - 驗收條件：文件包含主要視圖（專案清單、Active Change 聚合、跨專案 memory 摘要）的欄位定義；明確標注哪些需要 Phase 5 UI 實作才能呈現
  - 產出：`docs/product/v2-5-multi-project-dashboard-spec-v1.md`（資訊架構段落）
- [x] 5.2 定義資料來源路徑與聚合邏輯
  - 驗收條件：文件說明如何從多個 `roadmap.md`（不同專案根目錄）聚合資料；含資料來源路徑規範（至少說明 2 個專案場景）；包含聚合欄位清單
  - 產出：`docs/product/v2-5-multi-project-dashboard-spec-v1.md`（資料來源 + 聚合邏輯段落）

## 6. 驗證與治理同步

- [x] 6.1 執行 strict validate
  - 驗收條件：`openspec validate phase10-v2.5-multi-project-shared-capability-mvp --type change --strict` PASS（exit 0）
  - 產出：驗證通過記錄（runlog）
- [x] 6.2 同步治理文件
  - 驗收條件：`docs/roadmap.md`（Phase 4 至少 4 項工作項目 [x]）、`docs/runlog/2026-03-27_README.md`、`docs/handoff/current-task.md` 狀態一致
  - 產出：三份文件均已更新
- [x] 6.3 產出 smoke 測試紀錄
  - 驗收條件：`docs/qa/2026-03-27_phase4-smoke.md` 含五項工作的產出檔案存在確認與最小驗收命令
  - 產出：`docs/qa/2026-03-27_phase4-smoke.md`
