# v2-ui-workbench

## Purpose

定義 Phase 3（V2 輕量 UI 工作台）的 MVP 需求：以現有 `docs/` markdown 為唯一資料來源，提供專案總覽頁、專案詳情頁、handoff builder、候選審核介面、Memory Review 介面，搭配靜態資料契約；所有輸出僅寫入草稿層，不直接覆蓋正式 docs。

## ADDED Requirements

### Requirement: UI MVP Must Use Markdown-First Data Contract

所有 UI 功能的資料來源 MUST 讀取 `docs/` 下的 markdown 文件（roadmap、handoff、memory、runlog），不得連接外部資料庫或執行環境 API。

#### Scenario: 資料來源讀取成功

WHEN UI 元件以 markdown 文件作為輸入時
THEN 系統 SHALL 正確解析並呈現文件內容，且解析路徑與欄位映射 SHALL 記錄在資料來源契約文件中。

#### Scenario: 資料來源缺失或格式不符

WHEN 指定的 markdown 文件不存在或缺少必要欄位時
THEN UI MUST 顯示明確的空狀態或錯誤訊息，不得靜默失敗或呈現部分錯誤資料。

### Requirement: Project Overview Page Must Display Roadmap And Active Changes

專案總覽頁 MUST 顯示 `docs/roadmap.md` 的 Phase 進度與目前狀態，以及 `openspec/changes/` 的 active change 清單。

#### Scenario: 正常呈現概覽

WHEN 使用者進入專案總覽頁時
THEN 系統 SHALL 至少顯示：Phase 清單（含完成狀態）、目前進行中 Phase、Active change 名稱與狀態。

#### Scenario: 無 active change

WHEN `openspec/changes/` 中沒有 active change 目錄時
THEN 總覽頁 SHALL 顯示「目前無進行中 Change」而非空白或錯誤。

### Requirement: Handoff Builder Must Generate Structured Handoff Draft

Handoff Builder MUST 讀取 `docs/handoff/current-task.md` 並提供可編輯草稿介面，輸出僅寫入草稿層。

#### Scenario: Handoff 草稿生成成功

WHEN 使用者提交 handoff 編輯表單時
THEN 系統 SHALL 輸出草稿到指定草稿路徑（不覆蓋 current-task.md），並標注 generated-at 時間戳。

#### Scenario: 必填欄位缺失

WHEN 表單中 Task Name、Goal、Next Step 任一欄位為空時
THEN 系統 MUST 阻止提交並標記缺失欄位，不得產生不完整草稿。

### Requirement: Candidate Review Interface Must Require Explicit Human Decision

候選審核介面 MUST 要求每筆候選項目有明確的人工決策（採用或拒絕），不得允許未決定項目進入草稿輸出。

#### Scenario: 採用候選項目

WHEN 審核者標記某候選為「採用」時
THEN 決策記錄 SHALL 包含 reviewer、reviewed_at、reason，且項目狀態 SHALL 更新為 approved。

#### Scenario: 拒絕候選項目

WHEN 審核者標記某候選為「拒絕」時
THEN 決策記錄 SHALL 記錄拒絕原因，且該項目 MUST NOT 出現在草稿輸出中。

#### Scenario: 存在未決定項目

WHEN 候選佇列中仍有 pending 狀態項目時
THEN 系統 MUST 阻止提交草稿並提示未審核項目數量。

### Requirement: Memory Review Interface Must Enable Structured Review Of Memory Candidates

Memory Review 介面 MUST 從 `docs/memory/` 讀取記憶候選，提供分類檢視、接受/拒絕操作，輸出僅寫入草稿層。

#### Scenario: 記憶候選正常呈現

WHEN 使用者進入 Memory Review 介面時
THEN 系統 SHALL 顯示 `docs/memory/` 下所有 markdown 文件的摘要清單，並按分類（decision-log、preference-rules 等）分組。

#### Scenario: 記憶草稿輸出成功

WHEN 使用者完成審核並提交時
THEN 系統 SHALL 輸出 adopted 項目到草稿位置，附帶 run metadata（reviewer、reviewed_at），不得覆蓋原始 memory 文件。

### Requirement: All UI Outputs Must Target Draft Layer Only

所有 UI 功能的寫出操作 MUST 僅寫入草稿層，不得直接覆蓋 `docs/` 正式文件或 `openspec/changes/archive/` 已封存資料。

#### Scenario: 草稿寫出成功

WHEN 任一 UI 功能執行輸出操作時
THEN 輸出路徑 SHALL 在指定草稿目錄中，且原始 docs 文件 MUST NOT 被修改。

#### Scenario: 嘗試覆蓋正式文件

WHEN 輸出操作的目標路徑指向非草稿位置時
THEN 系統 MUST 阻止操作並記錄 policy violation。
