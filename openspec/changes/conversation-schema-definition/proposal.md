# Proposal: conversation-schema-definition

## Why

V3 進入跨工具整合後，ChatGPT、VS Code Copilot、純文字貼上會產生不同輸入結構。若沒有單一 schema，後續 adapter 會各自定義欄位，導致 extraction 流程難以維護與驗證。現在先完成 In Scope A 的 schema definition，可為後續所有 V3 adapter 建立一致基線。

## What Changes

- 新增 `ConversationMessage` 統一欄位定義（`role` / `content` / `source` / `timestamp`）。
- 新增 `ConversationDoc` 包裝格式（`messages` / `metadata`）。
- 產出 `docs/workflows/conversation-schema.md`，文件化欄位語意、驗證規則與範例。
- 在 OpenSpec change 中建立 proposal / design / spec / tasks，作為 V3 Change 1 的可追蹤規格基礎。
- 不改動現有 extraction engine 與 writeback 邏輯（非本 change 範圍）。

## Capabilities

### New Capabilities
- `conversation-schema`: 定義跨工具對話資料的統一輸出契約，供各 adapter 輸出 `ConversationDoc` 使用。

### Modified Capabilities
- 無（本 change 不修改 `openspec/specs/` 既有 capability 的 requirement）。

## Impact

### Roadmap Impact

- 啟動並完成 V3 Change 1 `conversation-schema-definition` 的規格層交付。
- 為下一個 change `plain-text-adapter-refactor` 提供明確輸入契約，降低後續改造風險。

### Affected Areas

- `docs/workflows/conversation-schema.md`
- `openspec/changes/conversation-schema-definition/`
- 後續 adapter changes（僅受本規格約束，這次不實作）

### Non-goals

- 不實作 `PlainTextAdapter` / `ChatGPTAdapter` / `LocalImportVSCodeCopilot`。
- 不調整 extraction engine 介面或候選提取規則。
- 不新增 runtime dependency、資料庫或前端框架。
