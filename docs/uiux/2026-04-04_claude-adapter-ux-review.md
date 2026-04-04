# Claude Adapter UX Review — 2026-04-04

## Review Scope

- 驗收 `claude-adapter` 對 `/extract` 使用流程的 UX 影響
- 檢查重點：
  - 使用者是否能在既有流程內完成「選 Claude → 貼上 transcript → 提取候選」
  - 顯式 Claude 模式的錯誤邊界是否清楚，不會靜默退回 plain
  - 既有 `plain` / `chatgpt` / `gemini` / `copilot` flow 是否仍可共存

## Findings

- 使用者現在只需要在既有 selector 多做一步「選 Claude」，之後仍沿用同一個 textarea 與「提取候選知識」按鈕，沒有第二條新流程。
- Claude 模式下若貼入內容不符合 transcript 結構，系統會回傳 Claude adapter 錯誤，而不是默默當成 plain text；這讓來源判定更可預期。
- `adaptConversationInput()` 同時補了 Claude auto-detect，對帶有 `Human` / `Claude` heading 的 transcript 可自動辨識，但目前主要操作仍是 explicit source route，風險較低。
- 既有 `plain` / `chatgpt` / `gemini` / `copilot` regression 全數 PASS，代表多來源 selector 沒有因新增 Claude 分支而增加流程摩擦或狀態混淆。

## Decision

- UX review PASS
- 本次流程增加一個明確來源入口，但沒有新增操作成本或切斷既有匯入節奏，符合本 change 的 MVP 目標

## Evidence

- `web/public/extract.html`
- `web/public/js/extract.js`
- `docs/qa/2026-04-04_claude-adapter-smoke.md`
- `tools/verify_claude_adapter.js`
- `tools/verify_import_ui_multi_source.js`
