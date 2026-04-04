# governance-scheduler

## Purpose

Provide a suggestion-only governance reminder layer for the workbench by reading `web/governance.json`, building startup due-check snapshots per project, and surfacing governance todos in Overview without introducing automatic writeback or background schedulers.

## Requirements

### Requirement: repo MUST 提供治理排程設定檔並支援最小 due-check 契約

系統 MUST 提供 `web/governance.json` 作為治理排程設定來源，至少支援全域 `enabled`、每個 check 的 `frequency`、`lastReviewedOn` 與 `dueCheck` 門檻欄位。

#### Scenario: config 定義啟用狀態、頻率與 due-check 門檻
- **WHEN** server 讀取 `web/governance.json`
- **THEN** config MUST 能表達治理排程是否啟用
- **AND** 每個 check MUST 能定義 `frequency`
- **AND** 每個 check MUST 能定義 `lastReviewedOn`
- **AND** 每個 check MUST 能定義 `dueCheck` 所需欄位以判斷 signal 與提醒層級

#### Scenario: config 不合法時仍回傳安全 fallback
- **WHEN** `web/governance.json` 缺欄位、日期不合法或 frequency 不支援
- **THEN** 系統 MUST 不讓 server crash
- **AND** `/api/governance` MUST 回傳可辨識的 warning 或 disabled/fallback 狀態

### Requirement: server MUST 在 startup 建立 governance due-check snapshot

系統 MUST 在 server 啟動時讀取治理設定並對已知專案建立 governance snapshot，之後由 `/api/governance` 提供目前專案的 summary 與 todo 清單。

#### Scenario: startup 對已知 project 建立 snapshot
- **WHEN** server 啟動完成
- **THEN** 系統 MUST 對已知 projectId 執行 governance due-check
- **AND** snapshot MUST 包含 `checkedAt`
- **AND** snapshot MUST 可依目前 projectId 查詢

#### Scenario: `/api/governance` 回傳目前專案的治理 summary
- **WHEN** 前端呼叫 `/api/governance`
- **THEN** response MUST 包含 `summary`
- **AND** response MUST 包含 `todos`
- **AND** response MUST 指出 config path 或 suggestion-only/manual review 語意

### Requirement: governance todo MUST 維持 suggestion-only 與人工確認邊界

治理排程 MUST 只產生 read-only 提醒，不得自動改寫 `web/governance.json`、`docs/memory/*.md`、rules 或 shared docs。

#### Scenario: due todo 只提示不執行寫回
- **WHEN** 任一治理 check 已到期
- **THEN** 系統 MUST 產生對應 todo card 或等價提醒
- **AND** todo MUST 提示使用者前往 `/memory` 或 `/decisions` 人工確認
- **AND** 系統 MUST 不自動更新 `lastReviewedOn`

#### Scenario: due 但目前 signal 為 0 時仍保留 routine review 提醒
- **WHEN** 某治理 check 已到期，但目前 signal 未超過 attention threshold
- **THEN** 系統 MUST 仍可顯示例行巡檢提醒
- **AND** 提醒層級 MUST 低於有明確待辦的項目

### Requirement: Overview MUST 顯示治理待辦、disabled state 與 empty state

Overview 頁 MUST 顯示治理待辦摘要，讓使用者在首頁就能看到目前到期的治理事項、空狀態或排程停用狀態。

#### Scenario: 有到期治理待辦時顯示治理卡
- **WHEN** `/api/governance` 回傳至少一個 todo
- **THEN** Overview MUST 顯示治理待辦區塊
- **AND** 每個 todo MUST 顯示標題、route、頻率、到期資訊與 summary
- **AND** 文案 MUST 明確表達需人工確認

#### Scenario: 沒有到期待辦時顯示 empty state
- **WHEN** governance scheduler 已啟用但目前沒有到期 todo
- **THEN** Overview MUST 顯示治理 empty state
- **AND** empty state MUST 不影響既有 roadmap KPI 與 phase table 顯示

#### Scenario: governance scheduler 停用時顯示 disabled state
- **WHEN** `web/governance.json` 的全域 `enabled` 為 false
- **THEN** Overview MUST 顯示治理排程停用狀態
- **AND** UI MUST 提示設定檔路徑或如何重新啟用

### Requirement: 本 change MUST 提供可重跑驗證且不破壞既有 Overview flow

本 change MUST 維持現有 Overview roadmap flow 正常，並提供 targeted verify 覆蓋 governance config、startup snapshot、API payload 與 Overview 靜態契約。

#### Scenario: 既有 roadmap KPI 與 phase table 維持相容
- **WHEN** Overview 載入 roadmap 與 governance 資料
- **THEN** 既有 roadmap KPI 與 phase table MUST 繼續正常顯示
- **AND** governance 區塊不得破壞原本 Overview rendering

#### Scenario: Targeted verify 覆蓋 governance contract
- **WHEN** 執行本 change 的 targeted verify
- **THEN** 驗證 MUST 覆蓋 config parsing、frequency due-check、signal threshold 與 suggestion-only semantics
- **AND** 驗證 MUST 覆蓋 `/api/governance` payload 與 Overview 頁面的治理容器 / script wiring
