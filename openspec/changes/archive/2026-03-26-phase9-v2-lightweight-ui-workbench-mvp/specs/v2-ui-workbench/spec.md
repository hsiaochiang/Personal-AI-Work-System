# v2-ui-workbench

## ADDED Requirements

### Requirement: UI MVP Must Use Markdown-First Data Contract

Phase 3 MUST establish a data contract document before implementing any UI feature; all UI data sources MUST be `docs/` markdown files without external database or API dependencies.

#### Scenario: 資料來源契約完成後 UI 實作開始

WHEN Phase 3 Task 1.x 完成資料來源契約文件時
THEN 後續 Task 2.x-5.x 的每項 UI 功能 SHALL 依契約文件中的路徑與欄位映射進行實作，不得擅自新增資料來源。

#### Scenario: 資料來源 markdown 無法解析

WHEN 指定 markdown 檔案不存在或無法解析到必要欄位時
THEN UI 元件 SHALL 顯示明確空狀態訊息，不得靜默失敗或呈現部分錯誤資料。

### Requirement: Project Overview Page Must Display Phase Progress And Active Changes

Phase 3 MUST deliver a project overview page reading from `docs/roadmap.md` and `openspec/changes/` to show Phase status and active change list.

#### Scenario: 正常呈現總覽

WHEN 使用者開啟專案總覽頁時
THEN 系統 SHALL 顯示 Phase 清單（含完成狀態）與 Active Change 名稱清單。

#### Scenario: 無 active change

WHEN `openspec/changes/` 中無 active change 目錄時
THEN 總覽頁 SHALL 呈現「目前無進行中 Change」空狀態，不得報錯。

### Requirement: Handoff Builder Must Output Draft Without Overwriting Source

Phase 3 MUST deliver a handoff builder that loads `docs/handoff/current-task.md`, allows editing, and outputs a draft to a designated draft path without modifying the original file.

#### Scenario: 草稿生成成功

WHEN 使用者提交 handoff 表單（必填欄位齊全）時
THEN 系統 SHALL 輸出草稿到草稿路徑並標注 generated-at，原始 current-task.md 不被修改。

#### Scenario: 必填欄位缺失

WHEN Task Name、Goal 或 Next Step 任一欄位為空時
THEN 系統 MUST 阻止提交並標記缺失欄位。

### Requirement: Candidate Review Interface Must Enforce Explicit Human Decision Before Draft Output

Phase 3 MUST deliver a candidate review interface where every candidate requires an explicit adopt/reject decision before draft output is permitted.

#### Scenario: 採用/拒絕決策完成後輸出草稿

WHEN 所有候選項目均有明確 adopted 或 rejected 決策時
THEN 系統 SHALL 允許草稿輸出，並記錄每筆決策的 reviewer、reviewed_at、reason。

#### Scenario: 存在未決定項目

WHEN 候選佇列中仍有 pending 狀態項目時
THEN 系統 MUST 阻止草稿輸出並提示未審核數量。

### Requirement: Memory Review Interface Must Read From docs/memory And Write To Draft Layer Only

Phase 3 MUST deliver a memory review interface that reads `docs/memory/` markdown files, groups them by category, and outputs adopted items only to a designated draft layer.

#### Scenario: 記憶候選分類呈現

WHEN 使用者進入 Memory Review 介面時
THEN 系統 SHALL 顯示 `docs/memory/` 所有 markdown 文件的分類摘要清單。

#### Scenario: 記憶草稿輸出不覆蓋原始文件

WHEN 使用者完成審核並提交時
THEN adopted 項目 SHALL 輸出至草稿路徑（含 run metadata），`docs/memory/` 原始文件 MUST NOT 被修改。

### Requirement: Governance Evidence Must Be Synchronized For Phase 3

Phase 3 execution MUST synchronize roadmap, runlog, handoff, and QA evidence to reflect consistent Phase 3 status and validation outcome.

#### Scenario: strict validate PASS 且治理同步完成

WHEN Phase 3 所有 tasks 完成且 strict validate PASS 時
THEN roadmap Phase 3 五項工作項目 SHALL 全部勾選，runlog/handoff/qa 狀態 SHALL 一致。

#### Scenario: 治理文件不一致

WHEN roadmap / handoff / runlog 對 Phase 3 狀態描述互斥時
THEN Phase 3 驗收 MUST fail 直到一致性修復。
