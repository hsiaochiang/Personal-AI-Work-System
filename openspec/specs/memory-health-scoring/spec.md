# memory-health-scoring

## Purpose

Provide a first governance signal for `/memory` by enriching memory API responses with health metadata and surfacing summary KPIs plus per-item health badges, while preserving compatibility for existing raw content consumers and legacy memory entries.

## Requirements

### Requirement: `/api/memory` MUST 提供記憶健康度摘要與條目 metadata

系統 MUST 在保留既有 memory raw content 回應的前提下，為每個 memory 條目提供健康度狀態、分數與說明，並輸出整體 health summary 供 `/memory` 使用。

#### Scenario: API 回傳 enriched memory payload
- **WHEN** 使用者或前端呼叫 `/api/memory`
- **THEN** 系統 MUST 仍回傳每個 memory 檔案的 `filename` 與 `content`
- **AND** 系統 MUST 另外提供可供 UI 直接使用的 groups / items 結構
- **AND** 每個 item MUST 包含 health metadata（至少含 status、score、reason）

#### Scenario: API 提供整體健康摘要
- **WHEN** `/api/memory` 成功回傳至少一個 memory 檔案
- **THEN** response MUST 包含整體健康摘要
- **AND** 摘要 MUST 至少包含總條目數、過期比例與建議清理數量

### Requirement: 系統 MUST 以新鮮度與來源權重計算記憶健康度

health scoring MUST 使用可解釋的規則，至少納入記憶新鮮度與來源權重，將條目分類為 `healthy`、`review` 或 `stale`。

#### Scenario: 近期且有可信來源的記憶標為 healthy
- **WHEN** 條目位於近期日期的 memory group，且來源 metadata 屬於已知來源
- **THEN** 系統 MUST 將該條目分類為 `healthy`
- **AND** score explanation MUST 反映日期與來源為主要原因

#### Scenario: 沒有日期或來源不明的 legacy 記憶標為 review
- **WHEN** 條目缺少可解析日期，或沒有來源 metadata
- **THEN** 系統 MUST 仍產生 health metadata
- **AND** 該條目 MUST 至少可被標為 `review`
- **AND** reason MUST 說明需要人工確認的原因

#### Scenario: 過舊記憶標為 stale
- **WHEN** 條目日期已超過 health scoring 的過期閾值
- **THEN** 系統 MUST 將該條目分類為 `stale`
- **AND** 整體摘要中的過期數量與比例 MUST 將該條目計入

### Requirement: `/memory` MUST 顯示健康度概覽與條目 badge

`/memory` 頁面 MUST 使用 API 提供的 health metadata，讓使用者在不打開原始 markdown 的情況下看到整體健康概況與每條記憶的健康狀態。

#### Scenario: 頁面顯示健康度概覽
- **WHEN** 使用者開啟 `/memory`
- **THEN** 頁面 MUST 顯示 health overview 區塊
- **AND** 該區塊 MUST 呈現總條目、過期比例與建議清理數量

#### Scenario: 每條記憶顯示健康 badge
- **WHEN** `/memory` 成功渲染任一記憶條目
- **THEN** 該條目 MUST 顯示對應的健康 badge（`healthy`、`review` 或 `stale`）
- **AND** badge 或附帶文字 MUST 讓使用者理解其主要評分原因

### Requirement: 本 change MUST 提供可重跑驗證且不破壞既有 memory consumers

本 change MUST 維持既有使用 `/api/memory` raw content 的流程相容，並提供 targeted verify 來覆蓋 scoring 與 UI 契約。

#### Scenario: 既有 raw content consumer 維持相容
- **WHEN** 其他頁面仍以 `files[].content` 讀取 `/api/memory`
- **THEN** 系統 MUST 維持既有欄位存在
- **AND** 不得因 health scoring 擴充而讓既有流程失敗

#### Scenario: Targeted verify 覆蓋 scoring 與 UI 契約
- **WHEN** 執行本 change 的 targeted verify
- **THEN** 驗證 MUST 覆蓋 group 日期解析、health status 分類與 summary aggregation
- **AND** 驗證 MUST 覆蓋 `/memory` 頁面引用 health utility / overview 容器的契約
