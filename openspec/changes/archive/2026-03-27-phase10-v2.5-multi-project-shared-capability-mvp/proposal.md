# Proposal: phase10-v2.5-multi-project-shared-capability-mvp

## Why

Phase 3（V2）輕量 UI 工作台已完成並 archive（`openspec/changes/archive/2026-03-26-phase9-v2-lightweight-ui-workbench-mvp/`）；UI 骨架就位、資料來源契約已確立，這些是多專案擴展的前置條件。
目前系統以單一專案（Personal-AI-Work-System）為假設基礎，所有 docs 結構、memory 管理、handoff 流程均未考慮多專案並存的邊界與共享機制。
進入 Phase 4（V2.5），需在既有穩定基礎上定義：個人層（personal）vs 專案層（per-project）的正式邊界、可跨專案共用的 workflow 與模板集、技能候選的升級流程，以及輕量跨專案儀表板的規格——為後續 Phase 5 多工具接入提供清晰的多專案資料模型。

## What Changes

1. **個人偏好與專案偏好正式分層**：明確定義哪些 docs 結構（memory、preference、skill-candidates）屬個人層（global），哪些屬專案層（per-project），並產出邊界定義文件與層級目錄規範。
2. **Shared Workflow 整理與標準化**：盤點現有 `docs/workflows/` 中可跨專案重用的流程，提取為共享 workflow 文件集，並定義引用規範（personal-layer 引用 vs per-project 引用）。
3. **跨專案模板集建立**：基於現有模板重構為可初始化新專案的模板集，含 handoff、runlog、roadmap、decision-log 初始化模板，定義最小必要欄位與填寫指引。
4. **技能候選升級流程定義**：定義技能候選（skill-candidates）從「候選」到「採用」到「升級為 skill 文件」的完整生命週期，含升級觸發條件、審核標準、輸出路徑規範。
5. **輕量跨專案儀表板規格（docs-only）**：產出跨專案儀表板的資訊架構與資料來源規格文件，說明如何聚合多個 roadmap.md、Active Change 狀態與跨專案 memory，為 Phase 5 UI 擴展提供設計基線。

## Scope

- In scope:
  - 個人層 vs 專案層邊界的文件化定義與目錄規範
  - Shared workflow 整理（文件層，不修改現有工作流邏輯）
  - 跨專案模板集（純 markdown 模板，不引入框架）
  - 技能候選升級流程文件（生命週期定義 + 觸發條件）
  - 輕量跨專案儀表板規格文件（docs-only，不實作前端）
  - docs-first 最小安全修改原則
  - strict validate 可重播驗證
  - 治理同步（roadmap / runlog / handoff 狀態一致）
- Out of scope:
  - 多專案 UI 前端實作（Phase 5 範疇）
  - 後端 API 或資料庫跨專案同步（Phase 5+）
  - 使用者認證與多人協作機制
  - 自動跨專案 memory 同步 runtime
  - 重大架構重寫或重大 dependency 新增
  - 現有 Phase 1–3 產出的修改

## Acceptance Criteria (Measurable)

1. 個人偏好與專案偏好正式分層：
   - 產出邊界定義文件（`docs/workflows/v2-5-personal-project-boundary-v1.md`），明確列出 ≥5 項屬個人層的路徑與 ≥5 項屬專案層的路徑，並提供層級目錄範例。
2. Shared Workflow 整理與標準化：
   - 產出共享 workflow 目錄文件（`docs/workflows/v2-5-shared-workflows-index-v1.md`），盤點現有 `docs/workflows/` 中 ≥3 個可跨專案重用的流程，並標注引用規範。
3. 跨專案模板集建立：
   - 產出可初始化新專案的模板集（`docs/templates/` 中至少 4 個模板：handoff-init, runlog-init, roadmap-init, decision-log-init），每個模板含必填欄位說明與範例填寫。
4. 技能候選升級流程定義：
   - 產出升級流程文件（`docs/workflows/v2-5-skill-candidate-promotion-v1.md`），明確定義「候選→審核→採用→升級」四階段的觸發條件與輸出路徑規範，包含至少 1 個 scenario 範例。
5. 輕量跨專案儀表板規格：
   - 產出儀表板資訊架構規格文件（`docs/product/v2-5-multi-project-dashboard-spec-v1.md`），涵蓋資料來源路徑（roadmap.md × N 個專案）、聚合邏輯說明、主要視圖欄位定義。
6. 驗證與治理同步：
   - `openspec validate phase10-v2.5-multi-project-shared-capability-mvp --type change --strict` PASS；roadmap（Phase 4 狀態更新）、runlog（2026-03-27）、handoff（Phase 4 active）狀態一致。

## Front-loaded Risks

1. 個人層 vs 專案層邊界定義模糊，導致後續 Phase 5 UI 設計依據不明確
   - 緩解：Task 1.x 強制產出具體路徑清單（非原則性描述），並以現有路徑為例示。
2. Shared workflow 整理不完整，遺漏可重用項目
   - 緩解：以全盤掃描 `docs/workflows/` 現有文件為起點，逐一標注 personal-only / shared / per-project。
3. 模板欄位設計過度複雜，導致新專案初始化門檻升高
   - 緩解：模板以「最小必要欄位」為原則，可補充欄位以 optional 標注。
4. 技能候選升級流程與現有候選審核介面（Phase 3）的邊界不清
   - 緩解：明確界定 Phase 3 候選審核介面處理「運行期」採用/拒絕決策，Phase 4 升級流程處理「跨時間週期」從 adopted 到正式 skill 文件的治理機制。
5. 跨專案儀表板規格過度設計，與 Phase 5 UI 需求脫節
   - 緩解：規格文件採 MVP 精簡格式，明確標注哪些是 Phase 5 前置需求，哪些是長期願景。

## Impact

### Roadmap Impact

- 啟動 Phase 4（V2.5）first active change：`phase10-v2.5-multi-project-shared-capability-mvp`
- 完成後 Phase 4 四項工作項目全部打勾（roadmap 對應 Phase 4 欄位），V2.5 版本交付
- 為 Phase 5（多工具接入）提供清晰的多專案資料模型與邊界定義

### Non-goals

- 不交付多專案前端 UI 實作
- 不交付後端 API 或跨專案資料同步 runtime
- 不修改已封存 changes（Phase 1–3）的歷史語意
- 不引入新的重大 dependency 或構建工具

## Human Decisions Required

- 個人層目錄位置確認（建議：`personal/` 根目錄或維持現有 `/memories/` 路徑，預設維持現有結構）
- 模板集放置位置確認（建議：`docs/templates/`，預設採此路徑）
- Phase 4 完成後是否直接啟動 Phase 5 或先做一輪評估（預設：完成後再評估）
