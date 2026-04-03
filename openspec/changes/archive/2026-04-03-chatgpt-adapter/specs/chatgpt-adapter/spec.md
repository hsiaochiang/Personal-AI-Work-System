## ADDED Requirements

### Requirement: 系統 MUST 將 ChatGPT 分享頁貼上內容正規化為合法的 ConversationDoc

當使用者在 `/extract` 貼上從 ChatGPT 分享頁複製出的 transcript 文字時，系統 MUST 能辨識 user / assistant turns，並透過 `ChatGPTAdapter` 產生符合 `conversation-schema` v1 的 `ConversationDoc`。

#### Scenario: 分享頁 transcript 被解析為 chatgpt 來源文件
- **WHEN** 使用者貼上一段包含 `You` / `ChatGPT`（或等價 role heading）的 ChatGPT transcript
- **THEN** 系統產生一個 `ConversationDoc`
- **AND** `messages` 依 transcript 順序排列
- **AND** 每筆訊息的 `source` 為 `chatgpt`
- **AND** 未提供時間資訊的訊息 `timestamp` MUST 為 `null`

#### Scenario: 無法辨識為 ChatGPT transcript 時退回 plain text
- **WHEN** 使用者貼上的內容不符合 ChatGPT transcript 偵測條件
- **THEN** 系統 MUST 不得拋出 runtime error
- **AND** 系統 MUST 退回既有 plain text adapter 流程

### Requirement: 系統 MUST 支援 ChatGPT 官方 conversation JSON 匯入

當使用者貼上或上傳 ChatGPT 官方 conversation JSON 時，系統 MUST 能解析 conversation mapping，輸出合法 `ConversationDoc`。

#### Scenario: 單一 conversation JSON 轉成 ConversationDoc
- **WHEN** 使用者提供一個包含 `mapping` 的 ChatGPT conversation JSON 物件
- **THEN** 系統 MUST 依 `current_node` 主路徑或 create-time 順序重建訊息
- **AND** 每筆訊息的 `role`、`content`、`source`、`timestamp` 符合 schema
- **AND** `metadata.title` 可帶入 conversation title（若存在）

#### Scenario: conversation 陣列輸入採 deterministic 選擇
- **WHEN** 使用者提供包含多筆 conversation 的 JSON 陣列
- **THEN** 系統 MUST 選擇最近更新的一筆 conversation 進行匯入
- **AND** 不得將多筆 conversation 混成同一個 `ConversationDoc`

### Requirement: `/extract` MUST 提供 ChatGPT JSON 的最小上傳入口

`/extract` 頁面 MUST 在既有 textarea 路徑上提供最小的 `.json` / `.txt` 檔案讀取入口，讓使用者不必手動開檔貼全文。

#### Scenario: 上傳 JSON 後可直接進入既有 extraction 流程
- **WHEN** 使用者在 `/extract` 選擇一個支援的本機檔案
- **THEN** 系統 MUST 將檔案內容載入目前輸入流程
- **AND** 使用者仍透過既有「提取候選知識」按鈕啟動 extraction
- **AND** 不得新增新的 server upload API 才能使用

### Requirement: 系統 MUST 維持 plain-text extraction backward compatibility

加入 `ChatGPTAdapter` 後，既有 plain text 貼上、候選提取與 writeback 行為 MUST 維持可用。

#### Scenario: 非 ChatGPT 內容維持既有 plain-text 行為
- **WHEN** 使用者貼上一段一般純文字內容
- **THEN** 系統 MUST 仍以 `plain` 來源建立 `ConversationDoc`
- **AND** 既有 heuristics、候選審核與 writeback target mapping 仍可運作

#### Scenario: 驗證與 smoke 證據同時覆蓋 chatgpt 與 plain text
- **WHEN** 本 change 進入 verify 階段
- **THEN** 必須有可重跑的 adapter 驗證腳本
- **AND** 該驗證 MUST 覆蓋 ChatGPT transcript、ChatGPT JSON 與 plain text fallback
- **AND** 必須有 `/extract` 的 smoke 證據證明 UI happy path 可用
