# memory-ai-curator

## Purpose

Upgrade `/memory` from a read-only governance view into an actionable memory curation surface by adding safe single-item deletion, per-category AI curate suggestions, clickable KPI filtering for problem items, and direct AI review jump links without changing the existing extract/writeback pipeline.

## Requirements

### Requirement: `/memory` MUST 提供可安全執行的單條記憶刪除操作

系統 MUST 讓使用者可以在 `/memory` 針對單一記憶條目執行刪除，且所有刪除都必須受 whitelist 保護、先建立 backup，並只影響被指定的單一條目。

#### Scenario: UI 顯示單條刪除入口
- **WHEN** 使用者開啟 `/memory` 並看到任一記憶條目
- **THEN** 該條目 MUST 顯示可操作的刪除入口
- **AND** 刪除入口 MUST 對應到穩定的條目定位資訊（例如 `itemId` 或等價的 deterministic locator）

#### Scenario: 刪除單條記憶前需人工確認並建立 backup
- **WHEN** 使用者點擊某一條記憶的刪除入口
- **THEN** 系統 MUST 先要求人工確認
- **AND** 後端改寫前 MUST 建立 `.backup/` 備份
- **AND** 成功後 MUST 只移除被指定的單一條目

#### Scenario: 非法 filename 或不存在的條目被拒絕
- **WHEN** 刪除請求指向非 whitelist memory 檔案，或條目定位資訊不存在
- **THEN** 系統 MUST 拒絕該請求
- **AND** 不得改寫任何 memory markdown

### Requirement: 系統 MUST 支援逐分類的 AI 記憶整理建議

系統 MUST 允許使用者對單一 memory 分類觸發 AI curate，由 Gemini 讀取該分類全文後回傳改善建議，並在使用者確認前不直接覆寫原檔。

#### Scenario: AI curate 回傳原文、改善版與摘要
- **WHEN** 使用者對某個 memory 分類觸發 AI 整理，且 Gemini API key 已設定
- **THEN** `/api/memory/ai-curate` MUST 回傳 `filename`、`original`、`improved` 與 `summary`
- **AND** `improved` MUST 為可直接寫回 memory markdown 的完整文字

#### Scenario: 使用者確認後才覆寫 memory 檔案
- **WHEN** 前端收到 AI curate 建議
- **THEN** 系統 MUST 先顯示原始內容與改善版本的預覽
- **AND** 只有在使用者明確確認後才可呼叫既有 memory writeback 流程覆寫檔案
- **AND** 覆寫前 MUST 沿用既有 backup 邊界

#### Scenario: 缺少 Gemini key 或非法 filename 時回傳友善錯誤
- **WHEN** 使用者在未設定 Gemini key 的情況下觸發 AI 整理，或指定非 whitelist 檔案
- **THEN** 系統 MUST 回傳可顯示於 UI 的明確錯誤
- **AND** 不得產生部分寫入或不完整回應

### Requirement: `/memory` MUST 讓清理問題可被快速聚焦與行動

`/memory` 頁面 MUST 讓使用者可以從 KPI 與 AI review 直接聚焦到需要處理的記憶條目或分類，而不是只看到 summary 數字。

#### Scenario: 點擊 KPI 只顯示需要注意的條目
- **WHEN** 使用者點擊「建議清理」KPI
- **THEN** 頁面 MUST 切換成只顯示 `health.status !== 'healthy'` 的條目
- **AND** 使用者 MUST 能回到完整列表

#### Scenario: AI review 結果可跳到對應分類
- **WHEN** AI 品質審查回傳某筆與 `file` 對應的建議
- **THEN** 該建議 MUST 提供可點擊的分類捷徑
- **AND** 點擊後頁面 MUST 滾動到對應的 memory category

### Requirement: 本 change MUST 維持既有 memory consumers 相容並提供可重跑驗證

本 change MUST 保持既有 `/api/memory` raw content、health scoring、dedup 與 shared knowledge consumers 可繼續運作，並補充 targeted verify / smoke 來覆蓋新增契約。

#### Scenario: 既有 `/api/memory` consumers 保持相容
- **WHEN** 既有 `/memory` health badge、dedup、shared knowledge 或其他 consumer 繼續讀取 `/api/memory`
- **THEN** 系統 MUST 保留既有欄位與結構
- **AND** 新增的刪除 / curate 能力不得破壞既有 render flow

#### Scenario: 驗證覆蓋新增互動契約
- **WHEN** 執行本 change 的 targeted verify 或 smoke
- **THEN** 驗證 MUST 覆蓋單條刪除、KPI 篩選、AI curate 回應格式與 review 跳轉契約
- **AND** 驗證 MUST 確認 backup 與 whitelist 邊界仍然成立
