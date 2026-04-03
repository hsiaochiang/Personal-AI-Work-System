# Import UI Multi Source Smoke — 2026-04-04

> Change: `import-ui-multi-source`
> Type: UI change
> Scope: `/extract` tool selector + per-source panels + candidate source badge

## Verify Commands

- `node tools/verify_import_ui_multi_source.js`
- `node tools/verify_plain_text_adapter.js`
- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_local_import_vscode_copilot.js`
- `openspec validate import-ui-multi-source --strict`

## Coverage

- `/extract` 頁面存在 `plain` / `chatgpt` / `copilot` 工具來源 selector
- selector 對應的 source panel 與文案已在頁面靜態輸出
- `extract.js` 會依所選來源走 `PlainTextAdapter`、`ChatGPTAdapter` 或已載入的 Copilot `ConversationDoc`
- 候選審核 UI 有 source badge 與 source summary
- 既有 plain / chatgpt / copilot adapter regression 仍為 PASS

## Result

- `verify_import_ui_multi_source`：PASS
  - static source-aware UI contract PASS
  - import UI smoke PASS（`GET /extract`、`GET /js/extract.js`、`GET /css/style.css`）
- `verify_plain_text_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS
- `verify_chatgpt_adapter`：PASS
  - adapter contract PASS
  - local extract smoke PASS
- `verify_local_import_vscode_copilot`：PASS
  - adapter contract PASS
  - local import smoke PASS
- `openspec validate import-ui-multi-source --strict`：PASS

## Notes

- 本次 targeted verify 以 selector / panel / source badge 契約為主，回歸驗證仍由既有三支 adapter verify 分別承擔。
- `Copilot` 模式仍沿用既有本機 session API；本 change 沒有新增新的 server endpoint 或 runtime dependency。
