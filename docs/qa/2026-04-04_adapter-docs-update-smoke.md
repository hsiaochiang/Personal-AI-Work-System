# Adapter Docs Update Smoke — 2026-04-04

> Change: `adapter-docs-update`
> Type: UI change
> Scope: `conversation-schema.md` support matrix + `/extract` per-source support-format guidance

## Verify Commands

- `openspec validate --changes adapter-docs-update --strict`
- `node tools/verify_adapter_docs_update.js`
- `node tools/verify_import_ui_multi_source.js`
- `node tools/verify_plain_text_adapter.js`
- `node tools/verify_chatgpt_adapter.js`
- `node tools/verify_chatgpt_api_auto_import.js`
- `node tools/verify_gemini_adapter.js`
- `node tools/verify_claude_adapter.js`
- `node tools/verify_local_import_vscode_copilot.js`

## Coverage

- `docs/workflows/conversation-schema.md` 已補齊 `chatgpt-api` / `gemini` / `claude` 的 source 命名、支援格式與限制
- `/extract` 頁首 hint 與各 source panel 都出現一致格式的「支援格式：...」提示
- ChatGPT panel 文案明確區分 transcript / JSON / TXT 手動匯入與 tracked OpenAI API session 載入
- `plain` / `chatgpt` / `chatgpt-api` / `gemini` / `claude` / `copilot` 既有匯入流程 smoke 全數回歸通過

## Result

- `openspec validate --changes adapter-docs-update --strict`：PASS
- `verify_adapter_docs_update`：PASS
  - adapter docs static contract PASS
  - `/extract` support-format smoke PASS
- `verify_import_ui_multi_source`：PASS
- `verify_plain_text_adapter`：PASS
- `verify_chatgpt_adapter`：PASS
- `verify_chatgpt_api_auto_import`：PASS
- `verify_gemini_adapter`：PASS
- `verify_claude_adapter`：PASS
- `verify_local_import_vscode_copilot`：PASS

## Notes

- 本 change 不修改任何 adapter / API runtime 行為；驗證重點是文件與 UI copy 是否與已上線能力一致。
- ChatGPT API 仍只支援本工作台已追蹤的 OpenAI platform conversations；Gemini / Claude 仍只支援 transcript 貼上。
