## ADDED Requirements

### Requirement: Claude transcript MUST be normalized into ConversationDoc
系統 SHALL 支援將 Claude 對話貼上文字解析為合法 `ConversationDoc`，且每筆訊息的 `source` MUST 為 `claude`。

#### Scenario: Parse Claude transcript with alternating turns
- **WHEN** 使用者提供包含 `Human` 與 `Assistant` 角色標頭的 Claude transcript
- **THEN** 系統會產出至少一組 `user` / `assistant` 訊息，且所有訊息的 `source` 都是 `claude`

#### Scenario: Reject malformed Claude transcript in explicit Claude mode
- **WHEN** 使用者在 Claude 模式貼上無法形成有效 user/assistant turns 的內容
- **THEN** 系統 MUST 回傳 Claude adapter 錯誤，而不是靜默退回 plain text

### Requirement: Extract UI MUST expose Claude as an explicit import source
`/extract` 頁面的工具來源 selector SHALL 包含 `Claude` 選項，並在該模式下以 Claude adapter 處理 textarea 內容。

#### Scenario: User selects Claude source
- **WHEN** 使用者打開 `/extract` 並切換來源為 `Claude`
- **THEN** 頁面 MUST 顯示 Claude 專屬提示文案，且提取時呼叫 Claude adapter 而非 plain text adapter

### Requirement: Claude source attribution MUST flow through review and writeback
使用 Claude adapter 匯入的內容 SHALL 在候選審核與 memory writeback 保留 `claude` 來源資訊，與既有 source badge / attribution 機制相容。

#### Scenario: Candidate review shows Claude source badge
- **WHEN** Claude transcript 成功提取出候選知識
- **THEN** 候選卡片 MUST 顯示 `Claude` source badge

#### Scenario: Writeback preserves Claude source metadata
- **WHEN** 使用者採用 Claude 來源候選並寫回 memory
- **THEN** 寫入的 memory list item MUST 帶有 `<!-- source: claude -->` metadata
