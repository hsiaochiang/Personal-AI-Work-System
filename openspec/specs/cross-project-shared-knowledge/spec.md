# cross-project-shared-knowledge

## Purpose

Provide a suggestion-only first pass for cross-project shared knowledge by surfacing repeated memory themes across projects in `/memory`, generating a read-only `docs/shared/` snapshot, and preserving the existing per-project memory flow plus human-confirm boundaries.

## Requirements

### Requirement: `/api/memory` MUST 提供目前專案相關的 shared knowledge summary 與 suggestion groups

系統 MUST 在保留既有 `files`、`summary`、`dedup` contract 的前提下，為目前 projectId 額外回傳 `sharedKnowledge` payload，供 `/memory` 顯示跨專案共用知識候選。

#### Scenario: API 回傳與當前專案相關的 shared summary
- **WHEN** 使用者或前端呼叫 `/api/memory`
- **THEN** response MUST 仍保留既有 `files`、`summary` 與 `dedup`
- **AND** response MUST 額外包含 `sharedKnowledge.summary`
- **AND** `sharedKnowledge.groups` MUST 只包含與目前 projectId 相關的候選群組

#### Scenario: 沒有 shared candidate 時仍回傳空 summary
- **WHEN** 目前專案與其他專案之間沒有達到 shared threshold 的條目
- **THEN** API MUST 回傳 `sharedKnowledge.summary.groupCount = 0`
- **AND** `sharedKnowledge.groups` MUST 為空陣列

### Requirement: 系統 MUST 只在相同 memory 類別中偵測跨專案重複主題

shared knowledge suggestion MUST 限制在不同專案、相同 `filename` 的條目之間比對，並至少要求一個群組涉及兩個以上 projectId。

#### Scenario: 不同專案同一類別條目形成 shared candidate
- **WHEN** 兩個不同 projectId 在同一 `filename` 中存在相同或高度相似的記憶條目
- **THEN** 系統 MUST 將其歸入同一 shared suggestion group
- **AND** group MUST 包含 project metadata、similarity 與建議保留的 primary candidate

#### Scenario: 不同 memory 類別不形成 shared candidate
- **WHEN** 兩條內容相近的記憶分別來自不同 `filename`
- **THEN** 系統 MUST 不把它們歸入同一個 shared suggestion group

#### Scenario: 單一專案內的相似條目不視為 cross-project shared
- **WHEN** 一組相似條目只來自單一專案
- **THEN** 系統 MUST 不將其列入 `sharedKnowledge.groups`

### Requirement: `/memory` MUST 以 read-only 方式顯示共用知識候選

`/memory` 頁面 MUST 顯示一個 shared knowledge overview 區塊，讓使用者看到目前專案與其他專案重複出現的偏好或模式，但不得提供任何自動改寫 action。

#### Scenario: 頁面顯示 shared overview 與群組內容
- **WHEN** `/api/memory` 回傳至少一個 shared suggestion group
- **THEN** `/memory` MUST 顯示 shared overview 區塊
- **AND** 每個 group MUST 顯示至少兩個參與專案、相似度與推薦保留版本
- **AND** UI MUST 提示 `docs/shared/` snapshot 可作為人工整理起點

#### Scenario: 無 shared candidate 時維持可讀 empty state
- **WHEN** `sharedKnowledge.summary.groupCount = 0`
- **THEN** `/memory` MUST 顯示「目前沒有跨專案候選」或等價文案
- **AND** 既有 health / dedup / memory list MUST 正常顯示

#### Scenario: UI 不提供 writeback action
- **WHEN** 使用者檢視 shared knowledge overview
- **THEN** 頁面 MUST 不提供 merge、delete、accept 或 writeback action
- **AND** shared knowledge 區塊 MUST 明確屬於 suggestion-only

### Requirement: `docs/shared/` MUST 提供 read-only shared knowledge snapshot

repo MUST 有 `docs/shared/` 輸出，將目前跨專案 shared candidate 整理成 markdown snapshot，作為後續人工整合共用知識的證據。

#### Scenario: generator 產出 shared knowledge snapshot
- **WHEN** 執行 shared knowledge report generator
- **THEN** 系統 MUST 在 `docs/shared/` 產出 markdown 檔
- **AND** snapshot MUST 列出生成日期、參與專案與每個 shared candidate 群組

#### Scenario: snapshot 不改寫任何 project memory
- **WHEN** generator 產出 `docs/shared/` snapshot
- **THEN** 系統 MUST 不改寫任何 `docs/memory/*.md`
- **AND** snapshot 只作為 read-only 建議輸出

### Requirement: 本 change MUST 提供可重跑驗證且不破壞既有 memory flow

本 change MUST 維持既有 `/api/memory` consumer 相容，並提供 targeted verify 覆蓋 cross-project grouping、snapshot output 與 `/memory` 靜態契約。

#### Scenario: 既有 `/memory` health / dedup flow 維持相容
- **WHEN** 既有 health 與 dedup UI 仍使用 `/api/memory`
- **THEN** 系統 MUST 保留既有欄位與 render 所需資料
- **AND** shared knowledge 擴充不得破壞原本的 health / dedup 顯示

#### Scenario: Targeted verify 覆蓋 shared knowledge contract
- **WHEN** 執行本 change的 targeted verify
- **THEN** 驗證 MUST 覆蓋 cross-project grouping、same-filename guard、current-project filtering 與 shared snapshot generation
- **AND** 驗證 MUST 覆蓋 `/memory` 頁面 shared overview 容器、shared utility 引用與 suggestion-only 文案契約
