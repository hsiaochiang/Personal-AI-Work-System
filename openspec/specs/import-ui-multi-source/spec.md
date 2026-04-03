# import-ui-multi-source

## Purpose

Allow `/extract` to present a single, source-aware import entry point for `plain`, `chatgpt`, and `copilot` conversations so users can choose the correct ingestion path before extraction, review candidates with provenance visible, and continue using the existing review and writeback flow.

## Requirements

### Requirement: `/extract` MUST 以明確的工具來源 selector 收斂匯入入口

`/extract` 頁面 MUST 提供一個明確的工具來源 selector，讓使用者先選擇 `copilot`、`chatgpt` 或 `plain`，再看到對應的匯入控制與說明，而不是同時暴露所有來源入口。

#### Scenario: 切換到 Copilot 模式時顯示本機 session 匯入控制
- **WHEN** 使用者在 `/extract` 選擇 `VS Code Copilot`
- **THEN** 系統 MUST 顯示 Copilot session path override、refresh button 與 session list
- **AND** ChatGPT 專用上傳入口 MUST 不再作為主要控制顯示

#### Scenario: 切換到 ChatGPT 模式時顯示 transcript / 檔案匯入控制
- **WHEN** 使用者在 `/extract` 選擇 `ChatGPT`
- **THEN** 系統 MUST 顯示 ChatGPT transcript 貼上說明與 `.json` / `.txt` 上傳入口
- **AND** Copilot session list MUST 不再作為主要控制顯示

#### Scenario: 切換到 plain 模式時保留純文字貼上流程
- **WHEN** 使用者在 `/extract` 選擇 `純文字`
- **THEN** 系統 MUST 保留 textarea 與既有 extraction button
- **AND** 系統 MUST 以 plain text 為主要匯入說明，不要求使用者先準備 ChatGPT / Copilot 資料

### Requirement: 系統 MUST 依所選來源使用對應的解析路徑

當使用者在 `/extract` 明確選定來源後，系統 MUST 優先使用該來源對應的 adapter 或已載入的 `ConversationDoc`，而不是單純依賴自動偵測。

#### Scenario: ChatGPT 模式使用既有 ChatGPT adapter
- **WHEN** 使用者在 `ChatGPT` 模式貼上分享頁 transcript 或上傳官方 conversation JSON
- **THEN** 系統 MUST 使用 `ChatGPTAdapter` 解析輸入
- **AND** 產生的候選來源 MUST 為 `chatgpt`

#### Scenario: Copilot 模式使用已載入的 session ConversationDoc
- **WHEN** 使用者在 `VS Code Copilot` 模式先載入一筆本機 session 再執行提取
- **THEN** 系統 MUST 以該 session 對應的 `ConversationDoc` 作為 extraction 輸入
- **AND** 不得因 textarea 預覽文字而退回 ChatGPT / plain text auto-detect

#### Scenario: plain 模式維持 backward compatible
- **WHEN** 使用者在 `純文字` 模式貼上一段一般對話並執行提取
- **THEN** 系統 MUST 走 `PlainTextAdapter`
- **AND** 候選提取、審核與寫回流程 MUST 維持既有行為

### Requirement: 候選審核 UI MUST 顯示每條候選的對話來源

當系統在 `/extract` 產生候選項目時，審核卡片與摘要 MUST 顯示候選來源，讓使用者在寫回前即可確認 provenance。

#### Scenario: 候選卡片顯示來源 badge
- **WHEN** 系統顯示至少一筆候選卡片
- **THEN** 每張卡片 MUST 顯示對應的來源標記（例如 `Copilot`、`ChatGPT`、`Plain`）
- **AND** 該標記 MUST 來自候選本身的 `source` 欄位

#### Scenario: 審核摘要反映本輪候選來源
- **WHEN** 候選清單已建立
- **THEN** 審核摘要 MUST 能讓使用者辨識本輪候選來自哪個來源
- **AND** 拒絕 / 採用切換不得移除來源資訊

### Requirement: 本 change MUST 提供可重跑的 Import UI 驗證與回歸證據

本 change MUST 提供 targeted verify，確認工具來源 selector、source-aware routing 與候選來源顯示可用，同時保留既有 ChatGPT / Copilot / plain text regression 驗證。

#### Scenario: 執行 targeted verify 時檢查 selector 與候選來源 UI
- **WHEN** 開發者執行本 change 的 targeted verify 指令
- **THEN** 驗證 MUST 確認 `/extract` 頁面存在工具來源 selector 與 per-source controls
- **AND** 驗證 MUST 確認候選審核 UI 含來源標記或等價 source summary

#### Scenario: regression verify 確認既有 adapter 未被破壞
- **WHEN** 開發者完成本 change 並重跑既有 adapter verify
- **THEN** `plain-text`、`chatgpt` 與 `local-import-vscode-copilot` 的既有驗證 MUST 持續通過
- **AND** 必須補 QA / UI / UX 證據記錄 `/extract` 的多來源匯入 happy path
