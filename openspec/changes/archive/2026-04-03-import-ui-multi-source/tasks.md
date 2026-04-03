## 1. OpenSpec Artifacts

- [x] 1.1 完成 `proposal.md`、`design.md`、`specs/import-ui-multi-source/spec.md` 與 `tasks.md`（驗收：內容與 V3 brief 的 `import-ui-multi-source` 使用者故事 / scope 對齊）

## 2. Source-Aware Extraction Flow

- [x] 2.1 重構 `web/public/js/extract.js`，加入 `copilot` / `chatgpt` / `plain` 的來源 selector 狀態與切換邏輯（驗收：切換來源時只保留相容的匯入狀態，不殘留上一模式資料）
- [x] 2.2 更新 extraction routing，讓 Copilot 使用已載入的 `ConversationDoc`、ChatGPT 使用既有 ChatGPT adapter、plain text 使用 `PlainTextAdapter`（驗收：不再只依賴 auto-detect，且既有 happy path 不回歸）
- [x] 2.3 在候選卡片與 summary 顯示來源 badge / source summary（驗收：每筆候選可辨識來源，且 reject / adopt 切換後仍可見）

## 3. `/extract` Multi-Source UI

- [x] 3.1 更新 `web/public/extract.html` 與 `web/public/css/style.css`，加入工具來源 selector 與 per-source panel（驗收：Copilot / ChatGPT / plain 模式各自顯示對應控制與說明）
- [x] 3.2 補齊模式切換、空狀態、錯誤提示與 reset 文案（驗收：切換來源、載入失敗、回到手動貼上都有清楚狀態）

## 4. Verification And Evidence

- [x] 4.1 新增或更新 targeted verify，覆蓋 selector 存在、來源導向解析與候選來源 UI（驗收：可用 Node 重跑，失敗時能指出 Import UI 問題）
- [x] 4.2 重跑既有 `verify_plain_text_adapter.js`、`verify_chatgpt_adapter.js`、`verify_local_import_vscode_copilot.js` regression（驗收：全部 PASS）
- [x] 4.3 補 `docs/qa/`、`docs/uiux/`、`docs/planning/v3-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md` 的本 change 證據與狀態（驗收：能反映 Change 6 已進入 executor / verify 狀態與使用者可見影響）
