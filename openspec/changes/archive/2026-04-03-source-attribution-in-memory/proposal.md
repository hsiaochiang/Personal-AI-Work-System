## Why

`plain-text-adapter`、`chatgpt-adapter` 與 `local-import-vscode-copilot` 完成後，V3 已能從多種來源把對話送進 extraction pipeline，但寫回到 `docs/memory/*.md` 之後，使用者仍無法在 `/memory` 判斷一條記憶來自哪個工具。缺少來源追溯會讓多工具整合的價值打折，也不利於後續 V4 的記憶品質治理。

這個 change 的目標是用最小安全修改，把來源資訊留在 memory markdown 並在 `/memory` 顯示 badge，同時維持既有 `/extract`、writeback whitelist 與 memory 列表結構不被重構。

## What Changes

- 在 `/extract` writeback 階段，將候選的 `source` 以 HTML comment metadata 寫入 memory markdown 條目。
- 更新 `/memory` 前端 parser 與 rendering，讓列表項目可讀取 source metadata 並顯示來源 badge。
- 保留既有 memory markdown 結構與舊資料相容性，沒有來源 metadata 的 legacy 條目仍可正常顯示。
- 新增 targeted verify、QA 與 UI/UX 證據，覆蓋 source metadata 寫入、memory parser 與 badge 顯示。

## Capabilities

### New Capabilities
- `source-attribution-in-memory`: 在 memory writeback 保存來源 metadata，並於 `/memory` 顯示對應來源 badge。

### Modified Capabilities
- None.

## Non-goals

- 不改 `ChatGPTAdapter`、`PlainTextAdapter`、`LocalImportVSCodeCopilot` 的 parser 行為。
- 不實作 `import-ui-multi-source`、工具來源 selector、候選清單來源 badge 或 richer import UI。
- 不回填既有 `docs/memory/*.md` 的歷史條目來源，也不做 bulk migration。
- 不新增 runtime dependency、前端框架、資料庫或新的 writeback 目標。

## Impact

- Affected code: `web/public/js/extract.js`、`web/public/js/memory.js`、`web/public/css/style.css`，必要時補少量 `/api/memory` 相依驗證。
- Affected docs: `docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-03_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 推進 V3 Change 5，讓多工具匯入後的記憶條目具備最小來源可追溯性；V3 整體仍維持進行中，Change 6 另行處理 import UI 收斂。
