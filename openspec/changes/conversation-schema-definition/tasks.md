## 1. OpenSpec Artifact 建立

- [x] 1.1 完成 `proposal.md` 並明確標示 scope / non-goals（驗收：`proposal.md` 含 Why、What Changes、Capabilities、Impact、Non-goals）
- [x] 1.2 完成 `design.md` 並記錄關鍵設計決策與替代方案（驗收：`design.md` 含 Decisions、Risks、Migration Plan、Open Questions）
- [x] 1.3 建立 `specs/conversation-schema/spec.md`（驗收：至少 3 個 Requirement，且每個 Requirement 至少 1 個 `#### Scenario`）

## 2. Schema 文件化

- [x] 2.1 建立 `docs/workflows/conversation-schema.md` 的型別定義段落（驗收：包含 `ConversationMessage` 與 `ConversationDoc` 介面）
- [x] 2.2 補齊欄位語意與驗證規則（驗收：每個核心欄位有型別、必填性、限制說明）
- [x] 2.3 補齊來源命名與範例 payload（驗收：至少 2 個合法 JSON 範例，覆蓋 `timestamp` 有值與 `null`）

## 3. 驗證與交接

- [x] 3.1 執行 OpenSpec strict validate（驗收：`openspec validate --changes "conversation-schema-definition" --strict` 或等價命令 PASS）
- [x] 3.2 更新 handoff 狀態（驗收：`docs/handoff/current-task.md` 的 Done / In Progress / Next Step / Files Touched / Validation Status 已反映本 change）
- [x] 3.3 完成可交接摘要（驗收：回報包含 Current state、Changes made、Validation、Open issues、Next step）
