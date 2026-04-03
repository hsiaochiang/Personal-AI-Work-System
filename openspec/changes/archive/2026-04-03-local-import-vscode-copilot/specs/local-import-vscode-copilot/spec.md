## ADDED Requirements

### Requirement: 系統 MUST 從本機 VS Code Copilot session 目錄列出可匯入的對話

系統 MUST 能掃描預設或使用者覆寫的 VS Code Copilot session 目錄，找出可解析的 `.jsonl` 對話檔，並提供最近 session 清單給 `/extract` 使用。

#### Scenario: 使用預設路徑列出最近 session
- **WHEN** 使用者開啟 `/extract` 並要求刷新 Copilot session 清單
- **THEN** 系統 MUST 嘗試讀取預設的 VS Code Copilot session 目錄
- **AND** 只回傳可解析且至少包含一筆 request 的 `.jsonl` session
- **AND** session 清單 MUST 依最近更新時間排序

#### Scenario: 使用者覆寫 session 路徑
- **WHEN** 使用者提供自訂的 session 目錄路徑
- **THEN** 系統 MUST 改用該路徑掃描 `.jsonl` session
- **AND** 若路徑不存在或不可讀，系統 MUST 回傳明確錯誤而不是 silent fail

### Requirement: 系統 MUST 將單一 Copilot session JSONL 正規化為合法的 ConversationDoc

當使用者選擇一筆本機 Copilot session 時，系統 MUST 能把該 session 的 user / assistant 對話正規化為符合 `conversation-schema` v1 的 `ConversationDoc`。

#### Scenario: 從 request / response 還原對話順序
- **WHEN** 系統讀取一筆包含 `requests[]` 的 Copilot session snapshot
- **THEN** 系統 MUST 依 request 順序建立 `ConversationDoc.messages`
- **AND** 每筆 user 訊息 MUST 來自對應 request 的使用者輸入
- **AND** 每筆 assistant 訊息 MUST 來自該 request 的可見回覆文字
- **AND** 每筆訊息的 `source` MUST 為 `copilot`

#### Scenario: session metadata 帶入標題與 sessionId
- **WHEN** Copilot session 含有 `customTitle`、`sessionId` 或 `selectedModel.identifier`
- **THEN** 系統 MUST 將可用資訊帶入 `ConversationDoc.metadata`
- **AND** `metadata.schemaVersion` 與 `metadata.importedAt` MUST 仍符合 schema 規定

### Requirement: `/extract` MUST 提供最小 Copilot 本機匯入入口

`/extract` 頁面 MUST 在既有 textarea / extract button 流程之外，提供一個最小 Copilot 本機匯入區塊，讓使用者可直接選擇最近 session 載入。

#### Scenario: 選擇 session 後進入既有 extraction 流程
- **WHEN** 使用者在 `/extract` 選取一筆 Copilot session 並按下載入
- **THEN** 系統 MUST 將該 session 內容載入目前頁面
- **AND** 使用者仍透過既有「提取候選知識」按鈕啟動 extraction
- **AND** 不得要求使用者先手動開啟 `.jsonl` 再複製貼上

#### Scenario: 手動編輯後退回既有輸入模式
- **WHEN** 使用者在載入 Copilot session 後手動修改 textarea
- **THEN** 系統 MUST 清除目前的 Copilot import 狀態
- **AND** 後續 extraction MUST 回到既有的 auto-detect / plain text 路徑

### Requirement: 本 change MUST 提供可重跑的 local import 驗證

本 change MUST 提供可重跑的驗證，確認 Copilot JSONL parser、session list API 與 `/extract` 的最小 UI happy path 可用，且不破壞既有路徑。

#### Scenario: Node 驗證覆蓋 parser 與 local API
- **WHEN** 執行本 change 的 targeted verify script
- **THEN** 驗證 MUST 覆蓋 Copilot JSONL → `ConversationDoc` 的契約
- **AND** 驗證 MUST 覆蓋 session 清單與單一 session 載入 API
- **AND** 驗證 MUST 確認 `/extract` 頁面含有 Copilot local import UI

#### Scenario: 既有 ChatGPT / plain path 維持可用
- **WHEN** 本 change 進入 verify 階段
- **THEN** 系統 MUST 至少保留既有 `ChatGPTAdapter` 與 `PlainTextAdapter` 的基本可用性
- **AND** 不得因加入 Copilot local import 而移除既有 textarea / upload 主流程
