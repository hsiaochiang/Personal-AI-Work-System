## ADDED Requirements

### Requirement: 系統 MUST 將純文字貼上正規化為合法的 ConversationDoc

當使用者在 `/extract` 貼上非空純文字時，系統 MUST 透過 `PlainTextAdapter` 產生符合 `conversation-schema` v1 的 `ConversationDoc`，讓後續流程不再直接依賴 raw text。

#### Scenario: 純文字被封裝為 plain 來源文件
- **WHEN** 使用者提交一段非空純文字對話
- **THEN** 系統產生一個 `ConversationDoc`
- **AND** `messages` 至少包含 1 筆訊息
- **AND** 每筆訊息的 `source` 為 `plain`
- **AND** 每筆訊息的 `timestamp` 鍵存在且值為 `null`

#### Scenario: 空白輸入不建立文件
- **WHEN** 使用者提交空白或只含空白字元的內容
- **THEN** 系統 MUST 阻止 extraction 開始
- **AND** 不得建立空的 `ConversationDoc`

### Requirement: 系統 MUST 以 ConversationDoc 作為 plain text extraction 的入口

既有的純文字候選提取流程 MUST 改為接受 `ConversationDoc`，並以文件中的訊息內容驅動既有 heuristics，而不是直接綁定 textarea 的 raw text。

#### Scenario: 既有 heuristics 持續作用於 adapter 輸出
- **WHEN** `PlainTextAdapter` 產生 `ConversationDoc` 並送入 extraction pipeline
- **THEN** 系統 MUST 以 `messages[].content` 還原為可提取文字內容
- **AND** 既有 category scoring、候選審核與 writeback target mapping 仍可運作

#### Scenario: 無匹配候選時維持既有空狀態
- **WHEN** adapter 輸出的內容未命中任何候選規則
- **THEN** 系統 MUST 顯示既有「未找到候選知識項目」空狀態
- **AND** 不得因 schema refactor 造成 runtime error

### Requirement: 系統 MUST 提供 PlainTextAdapter 的最小驗證與回歸證據

本 change MUST 提供可重跑的驗證，確認 `PlainTextAdapter` 輸出符合 schema，且 `/extract` 的純文字 happy path 維持 backward compatible。

#### Scenario: Adapter 驗證腳本通過
- **WHEN** 開發者執行本 change 的 adapter 驗證命令
- **THEN** 驗證結果 MUST 確認 `ConversationDoc` 結構合法
- **AND** 驗證結果 MUST 確認 flatten 後的文字可供既有 heuristics 使用

#### Scenario: Smoke 證據可證明純文字流程未回歸
- **WHEN** 本 change 進入 verify 階段
- **THEN** 必須有一份 smoke 證據記錄 `/extract` 的純文字貼上、候選產生與寫回相關結果
- **AND** 該證據 MUST 明確標示本 change 未破壞 V2/V3 現有基線
