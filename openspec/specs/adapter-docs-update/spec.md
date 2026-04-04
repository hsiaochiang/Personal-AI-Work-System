# adapter-docs-update

## Purpose

Document the V5 adapter support matrix in `docs/workflows/conversation-schema.md` and expose consistent per-source support-format guidance in `/extract`, so users can understand what each import source accepts without changing existing adapter or API behavior.

## Requirements

### Requirement: Conversation schema docs MUST describe V5 adapter support formats

系統 MUST 在 `docs/workflows/conversation-schema.md` 文件化 V5 已上線來源的支援格式、來源命名與限制，至少覆蓋 `gemini`、`claude` 與 `chatgpt-api`。

#### Scenario: Developer checks supported import formats
- **WHEN** 開發者或使用者閱讀 `docs/workflows/conversation-schema.md`
- **THEN** 文件 MUST 說明 `gemini`、`claude`、`chatgpt-api` 的 source name、支援格式與限制
- **AND** 不可宣稱 Gemini / Claude API import 或 ChatGPT 產品聊天歷史枚舉等未支援能力

### Requirement: Extract UI MUST show per-source support format guidance

`/extract` 頁面的各來源 panel SHALL 顯示一致化的「支援格式」提示，協助使用者判斷應貼上的內容或可上傳的檔案。

#### Scenario: User switches import source
- **WHEN** 使用者在 `/extract` 切換 `plain`、`chatgpt`、`gemini`、`claude` 或 `copilot`
- **THEN** 對應 panel MUST 顯示「支援格式：...」提示
- **AND** 提示內容 MUST 只描述該來源目前已上線的匯入方式

### Requirement: ChatGPT docs and UI copy MUST distinguish manual import from tracked API import

系統 SHALL 在文件與 `/extract` 的 ChatGPT panel 清楚區分 `chatgpt` 手動匯入與 `chatgpt-api` tracked OpenAI conversation 載入，避免誤導使用者。

#### Scenario: User reads ChatGPT support guidance
- **WHEN** 使用者查看 ChatGPT 匯入說明
- **THEN** 文案 MUST 同時說明 transcript / JSON / TXT 手動匯入與 tracked API session 載入
- **AND** 文案 MUST 說明 API 載入以前提為「已設定 API key 且先追蹤 conversationId」
