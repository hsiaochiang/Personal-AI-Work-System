## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/claude-adapter/spec.md` 與 `tasks.md`，並讓內容與 V5 brief 的 Claude scope 對齊
- [x] 1.2 執行 `openspec validate --changes claude-adapter --strict`，確認 active change 可進入 apply

## 2. Claude Adapter Runtime

- [x] 2.1 擴充 `web/public/js/conversation-adapters.js`，加入 Claude source whitelist、transcript parser、explicit adapter 與最小 auto-detect
- [x] 2.2 更新 `web/public/js/memory-source-utils.js`，讓 `claude` 來源可顯示 badge 並沿用既有 writeback attribution

## 3. `/extract` Claude Source Integration

- [x] 3.1 更新 `web/public/extract.html` 與 `web/public/js/extract.js`，加入 Claude 來源選項、提示文案與 explicit adapter routing
- [x] 3.2 保持 `plain` / `chatgpt` / `gemini` / `copilot` 路徑可回歸，避免既有 multi-source selector 行為被破壞

## 4. Verification And Evidence

- [x] 4.1 新增 Claude fixture 與 `tools/verify_claude_adapter.js`，覆蓋 transcript parse、source attribution 與 `/extract` static/local smoke
- [x] 4.2 重跑既有 `verify_plain_text_adapter.js`、`verify_chatgpt_adapter.js`、`verify_gemini_adapter.js`、`verify_import_ui_multi_source.js` regression
- [x] 4.3 補 `docs/qa/`、`docs/uiux/`、`docs/handoff/current-task.md`、`docs/planning/v5-brief.md`、`docs/roadmap.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 狀態與證據
