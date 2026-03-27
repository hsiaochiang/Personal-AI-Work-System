# v2-5-multi-project

## ADDED Requirements

### Requirement: Personal Layer and Per-Project Layer Must Be Formally Separated

Phase 4 MUST establish a formal boundary definition document that separates personal-layer paths (global, cross-project) from per-project paths, enabling multi-project isolation.

#### Scenario: 新專案初始化時辨識層級邊界

WHEN 使用者初始化一個新專案時
THEN 系統文件 SHALL 明確指引哪些路徑屬個人層（不複製）、哪些屬專案層（需初始化），不得含糊兩者邊界。

#### Scenario: memory 衝突時的優先序

WHEN 個人層 memory 與專案層 memory 存在相同 key 的規則時
THEN 邊界定義文件 SHALL 明確說明優先序規則（per-project 覆蓋 personal，或 personal 為 fallback）。

### Requirement: Shared Workflows Must Be Explicitly Listed and Referenceable

Phase 4 MUST produce a shared workflow index that explicitly lists cross-project reusable workflows and defines how new projects should reference them.

#### Scenario: 新專案引用 shared workflow

WHEN 新專案需要使用 extraction-flow 等通用流程時
THEN 共享 workflow 索引 SHALL 提供明確引用路徑（personal-layer），不需要將 workflow 複製到每個專案目錄。

#### Scenario: workflow 僅適用單一專案

WHEN 某 workflow 依賴特定專案資料結構時
THEN 共享 workflow 索引 SHALL 標注該 workflow 為 per-project，不納入 shared 清單。

### Requirement: Project Init Templates Must Follow Minimum Required Fields Principle

Phase 4 MUST provide project initialization templates (handoff, runlog, roadmap, decision-log) that include only required fields, with optional fields clearly marked.

#### Scenario: 使用模板初始化新專案

WHEN 使用者以模板建立新專案 docs 結構時
THEN 每個模板 SHALL 包含 `[REQUIRED]` 標注的必填欄位，所有必填欄位空白時，文件結構須仍可判讀不可執行狀態。

#### Scenario: 模板欄位超出最小需求

WHEN 模板包含非必要欄位時
THEN 非必要欄位 SHALL 以 optional 或 `[OPTIONAL]` 標示，不得強制填寫。

### Requirement: Skill Candidate Promotion Flow Must Define Four-Stage Lifecycle

Phase 4 MUST document a four-stage lifecycle (Candidate → Under Review → Adopted → Promoted to Skill) with explicit trigger conditions and output path specifications.

#### Scenario: 候選達到採用門檻

WHEN 一個 skill-candidate 在 ≥2 個 session 中被確認有效時
THEN 升級流程文件 SHALL 規定此時應由 Adopted 狀態觸發升級審核，不得跳過審核直接升級。

#### Scenario: 升級後輸出到正式 skill 路徑

WHEN skill-candidate 通過升級審核時
THEN 升級流程 SHALL 輸出到 `.github/copilot/skills/<name>.md`，並在 skill-candidates 文件中更新為 `promoted` 狀態。

### Requirement: Multi-Project Dashboard Spec Must Define Data Sources Before UI Implementation

Phase 4 MUST produce a multi-project dashboard specification document that defines data source paths and aggregation logic before any Phase 5 UI implementation begins.

#### Scenario: 多專案 roadmap 聚合

WHEN 跨專案儀表板需要顯示多個專案的 Phase 進度時
THEN 規格文件 SHALL 定義資料來源路徑格式（`<project-root>/docs/roadmap.md`）與聚合欄位清單，不得依賴非 markdown 格式的資料來源。

#### Scenario: 某專案缺少 roadmap.md

WHEN 某個被追蹤的專案根目錄下不存在 `docs/roadmap.md` 時
THEN 儀表板規格 SHALL 定義該專案應顯示「roadmap 未初始化」的空狀態，不得造成整體儀表板錯誤。
