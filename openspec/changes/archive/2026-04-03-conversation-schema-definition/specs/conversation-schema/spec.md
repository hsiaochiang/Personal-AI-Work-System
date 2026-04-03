## ADDED Requirements

### Requirement: Adapter MUST 輸出統一的 ConversationMessage 結構
系統 MUST 定義 `ConversationMessage` 契約，且每筆訊息 MUST 包含 `role`、`content`、`source`、`timestamp` 四個欄位；其中 `timestamp` 在缺值時可為 `null`，有值時 MUST 為 ISO 8601 字串。

#### Scenario: 純文字來源被正規化為合法訊息
- **WHEN** 使用者貼上一段純文字對話並由 adapter 轉換為訊息陣列
- **THEN** 每筆訊息都包含 `role`、`content`、`source`、`timestamp`
- **AND** `source` 被設定為 `plain` 或符合 `custom:<tool>` 命名

#### Scenario: 缺少時間資訊時仍可通過 schema
- **WHEN** 來源資料未提供時間戳
- **THEN** `timestamp` 欄位仍存在且值為 `null`
- **AND** 不可省略 `timestamp` 鍵

### Requirement: 系統 MUST 使用 ConversationDoc 作為對話封裝格式
系統 MUST 定義 `ConversationDoc`，至少包含 `messages` 與 `metadata`。`messages` MUST 為 `ConversationMessage[]` 且至少一筆；`metadata` MUST 包含 `schemaVersion` 與 `importedAt`。

#### Scenario: 多工具輸入被封裝成單一文件物件
- **WHEN** 任一 adapter 完成對話解析
- **THEN** 輸出為單一 `ConversationDoc` 物件
- **AND** `messages` 為非空陣列

#### Scenario: 文件 metadata 提供可追蹤資訊
- **WHEN** 建立 `ConversationDoc`
- **THEN** `metadata.schemaVersion` 與 `metadata.importedAt` 皆存在
- **AND** `metadata.importedAt` 為 ISO 8601 字串

### Requirement: Schema 文件 MUST 提供欄位規則與可驗證範例
系統 MUST 在 `docs/workflows/conversation-schema.md` 文件化欄位定義、驗證規則、來源命名規範與至少兩個合法範例（最小範例與含 metadata 擴充範例）。

#### Scenario: 開發者可依文件實作 adapter
- **WHEN** 開發者閱讀 `docs/workflows/conversation-schema.md`
- **THEN** 可取得 `ConversationMessage` 與 `ConversationDoc` 的欄位定義與型別限制
- **AND** 可依範例建構合法 payload

#### Scenario: 驗證流程可用文件規則判定合法性
- **WHEN** 對 adapter 輸出進行 unit-level 驗證
- **THEN** 可依文件中的 MUST 規則判斷 pass/fail
- **AND** 錯誤欄位可被定位至具體規則
