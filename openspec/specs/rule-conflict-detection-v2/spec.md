# rule-conflict-detection-v2

## Purpose

Provide an explainable first-pass governance upgrade for `/decisions` by detecting likely conflicts between same-category rules with deterministic heuristics, surfacing conflict overview and per-rule explanations, and preserving the existing `/api/rules` raw markdown contract plus suggestion-only boundary.

## Requirements

### Requirement: 系統 MUST 提供超越否定詞前綴的規則衝突偵測

`/decisions` 的規則衝突偵測 MUST 支援 deterministic heuristic，不只限於「否定詞 + 相同 stem」的單一型別，至少能辨識同分類規則中的互斥表達與風格偏好衝突。

#### Scenario: 可偵測沒有明確否定詞的互斥規則
- **WHEN** 同一分類內同時存在「保持輸出精簡」與「需要詳細說明」之類的規則
- **THEN** 系統 MUST 將其標記為可能衝突
- **AND** explanation MUST 說明衝突來自精簡 vs 詳細的互斥訊號

#### Scenario: 仍支援既有否定詞型衝突
- **WHEN** 同一分類內同時存在「避免過早跳入實作」與「直接開始實作」之類規則
- **THEN** 系統 MUST 仍能偵測到此類衝突
- **AND** 不得因升級而失去既有否定詞前綴案例

### Requirement: 衝突偵測 MUST 維持 same-category suggestion-only 邊界

規則衝突偵測 MUST 只在同一 `category` 內比對，並以「可能衝突」方式提示，不得自動改寫任何 rule source。

#### Scenario: 不同分類不自動形成 conflict pair
- **WHEN** 兩條內容相近的規則分別來自不同分類
- **THEN** 系統 MUST 不將它們配成同一個 conflict pair

#### Scenario: conflict result 只作為提示
- **WHEN** 系統偵測到任一 conflict pair
- **THEN** UI MUST 使用「待確認」或等價 wording 呈現
- **AND** 系統 MUST 不執行任何自動刪除、停用或 writeback action

### Requirement: `/decisions` MUST 顯示衝突列表與原因說明

`/decisions` 頁面 MUST 使用 enriched conflict metadata，在 rules tab 顯示衝突摘要、涉及規則與每組 pair 的 explanation。

#### Scenario: 頁面顯示 conflict overview
- **WHEN** rules data 中存在一組以上 conflict pair
- **THEN** rules tab MUST 顯示 conflict overview 區塊
- **AND** overview MUST 至少呈現衝突規則數量或 pair 數量

#### Scenario: rule card 顯示衝突原因與對象
- **WHEN** 某條規則被標記為 conflict
- **THEN** 該 rule card MUST 顯示至少一條衝突 explanation
- **AND** explanation MUST 指出衝突對象或 signal 類型

#### Scenario: 無衝突時維持可讀空狀態
- **WHEN** 某分類沒有任何 conflict pair
- **THEN** 頁面 MUST 不顯示誤導性的 warning banner
- **AND** 既有規則列表仍 MUST 正常渲染

### Requirement: 本 change MUST 提供可重跑驗證且不破壞既有 rules flow

本 change MUST 保持 `/api/rules` raw markdown contract 相容，並提供 targeted verify 覆蓋 conflict heuristic 與 `/decisions` UI wiring。

#### Scenario: 既有 `/api/rules` consumers 維持相容
- **WHEN** `/decisions` 或其他 consumer 仍以 `files[].content` 讀取 `/api/rules`
- **THEN** 系統 MUST 保留既有 API shape
- **AND** conflict detection 升級不得要求新的 server endpoint

#### Scenario: Targeted verify 覆蓋 heuristic 與 UI 契約
- **WHEN** 執行本 change 的 targeted verify
- **THEN** 驗證 MUST 覆蓋 explicit negation conflict、style preference conflict 與 same-category guard
- **AND** 驗證 MUST 覆蓋 `/decisions` 頁面引用 conflict utility、overview 容器與 explanation class 的契約
