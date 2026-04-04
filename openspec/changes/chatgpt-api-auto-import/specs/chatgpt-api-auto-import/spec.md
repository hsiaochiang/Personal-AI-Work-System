## ADDED Requirements

### Requirement: Settings MUST store OpenAI API key server-side only
系統 SHALL 在 `/settings` 提供 OpenAI API key 設定入口，但 client-side 不得直接取得原始 key；key 必須由 server 以 local-only 檔案儲存。

#### Scenario: Save and mask OpenAI API key
- **WHEN** 使用者在 `/settings` 輸入有效的 OpenAI API key 並儲存
- **THEN** server MUST 將 key 寫入 local-only storage
- **AND** 後續 `GET /api/settings/openai` 只會回傳 `configured` 狀態與遮罩後摘要
- **AND** 原始 key 不得出現在任何 public asset response

#### Scenario: Clear stored OpenAI API key
- **WHEN** 使用者在 `/settings` 清除已儲存的 key
- **THEN** server MUST 移除 local key 或將其設為空值
- **AND** `/extract` 的 ChatGPT API import flow MUST 顯示尚未設定 key

### Requirement: System MUST list only tracked OpenAI platform conversations
系統 SHALL 透過 local tracked conversation index 提供「最近 sessions」選單；不得宣稱可直接列出使用者 ChatGPT 產品歷史或未追蹤的 conversations。

#### Scenario: Track a conversation ID for the current project
- **WHEN** 使用者在 ChatGPT API import flow 提供一個合法的 OpenAI `conversationId`
- **THEN** server MUST 使用已儲存的 API key 驗證該 conversation 可被 retrieve
- **AND** 成功後 MUST 將該 `conversationId` 與 project 關聯寫入 local tracked index

#### Scenario: List tracked sessions
- **WHEN** 使用者在 `/extract` 的 ChatGPT 模式刷新 API sessions
- **THEN** `/api/chatgpt/sessions` MUST 只回傳目前 project tracked 的 conversations
- **AND** 每筆 session MUST 包含可顯示於 picker 的最小摘要資訊

### Requirement: ChatGPT import UI MUST support API-loaded session selection
`/extract` 的 `ChatGPT` source panel SHALL 同時支援既有 transcript / JSON 匯入與新的 API 載入流程。

#### Scenario: Load tracked API session into extraction flow
- **WHEN** 使用者在 ChatGPT 模式選擇一筆 tracked session 並按下載入
- **THEN** 系統 MUST 取得對應 conversation items 並載入 textarea / extraction state
- **AND** 使用者仍透過既有「提取候選知識」按鈕啟動 extraction

#### Scenario: Empty tracked session list shows bootstrap guidance
- **WHEN** 目前 project 尚未追蹤任何 OpenAI conversation
- **THEN** ChatGPT API import panel MUST 顯示 empty state
- **AND** 該 empty state MUST 明確說明需要先追蹤 `conversationId`

### Requirement: OpenAI conversation items MUST normalize into ConversationDoc with `chatgpt-api` provenance
透過 API 載入的 OpenAI conversation items SHALL 被正規化為合法 `ConversationDoc`，並在候選審核與 memory writeback 階段保留 `chatgpt-api` 來源標記。

#### Scenario: Parse text conversation items into ConversationDoc
- **WHEN** server 成功取得一筆 OpenAI conversation items payload
- **THEN** 系統 MUST 依時間順序建立 `ConversationDoc.messages`
- **AND** 所有可見文字訊息的 `source` MUST 為 `chatgpt-api`
- **AND** 非文字 item type 不得造成 runtime error

#### Scenario: Candidate review and writeback preserve API source metadata
- **WHEN** 使用者採用來自 API import 的候選知識並寫回 memory
- **THEN** 候選卡片 MUST 顯示 `ChatGPT API` source badge
- **AND** 寫入的 memory list item MUST 帶有 `<!-- source: chatgpt-api -->` metadata
