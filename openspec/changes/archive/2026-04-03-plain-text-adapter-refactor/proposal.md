## Why

V3 Change 1 已定義 `ConversationDoc` 契約，但目前 `/extract` 仍直接吃純文字字串，尚未有任何 runtime adapter 會真正輸出 schema。若不先把既有純文字流程抽成 `PlainTextAdapter`，後續 `chatgpt-adapter` 與 `local-import-vscode-copilot` 就只能各自繞過 schema，會讓 V3 的多來源整合失去共同入口。

現在先做 `PlainTextAdapter`，可以用最小安全修改把既有流程接上 `ConversationDoc`，同時維持 `/extract` 的既有操作與結果不被破壞。

## What Changes

- 新增 `PlainTextAdapter`，把使用者貼上的純文字正規化為合法 `ConversationDoc`（`source: plain`）。
- 重構 `/extract` 前端入口，讓候選提取流程改為接受 `ConversationDoc`，但保留既有 heuristics、候選審核與 writeback 行為。
- 補上最小驗證，確認 `PlainTextAdapter` 輸出符合 V3 schema，且純文字貼上流程維持 backward compatible。
- 同步更新 V3 brief、handoff 與 system manual，將本 change 狀態從 preflight 推進到正式執行。

## Capabilities

### New Capabilities
- `plain-text-adapter`: 將既有純文字貼上流程封裝為 `ConversationDoc` adapter，並以此作為 extraction pipeline 的新入口。

### Modified Capabilities
- None.

## Non-goals

- 不實作 `ChatGPTAdapter`、`LocalImportVSCodeCopilot` 或多來源 import UI。
- 不變更 writeback 檔案格式、memory badge 或 `/memory` 頁面呈現。
- 不引入新 dependency、前端框架或 build tool。

## Impact

- Affected code: `web/public/js/extract.js`、`web/public/extract.html`、新的 adapter/validator 模組、驗證腳本與 QA 證據。
- Affected docs: `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/qa/`。
- Roadmap impact: 推進 V3 Change 2 的實作基線，但不改變 roadmap 的版本完成判定；V3 仍屬進行中。
