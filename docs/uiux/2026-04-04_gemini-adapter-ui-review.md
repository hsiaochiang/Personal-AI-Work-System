# Gemini Adapter UI Review — 2026-04-04

## Review Scope

- 驗收 `gemini-adapter` 對 `/extract` 頁面的可見 UI 變更
- 檢查重點：
  - source selector 是否新增 `Gemini` 選項
  - Gemini panel 文案是否清楚界定「貼上 transcript」邊界
  - 候選來源 badge 是否可顯示 `Gemini`

## Findings

- `/extract` 頁首說明已更新為 `Copilot / ChatGPT / Gemini / 純文字` 四種來源，與本 change scope 一致。
- source selector 新增 `Gemini` option，且對應 `source-panel-gemini`；維持既有單卡片、單 textarea、單主按鈕節奏，沒有新增 modal 或第二頁。
- Gemini panel 文案明確寫出支援的是貼上 transcript，並標示本輪不支援 API / upload，避免使用者誤判能力邊界。
- `Gemini` source badge 沿用既有 `.source-badge` 視覺基線，只補一組新色，不會破壞既有 `ChatGPT` / `Copilot` / `Plain` 的辨識語彙。

## Decision

- UI review PASS
- 本次 UI 變更範圍受控，與 V5 Change 1 的最小安全修改原則一致

## Evidence

- `web/public/extract.html`
- `web/public/js/extract.js`
- `web/public/js/memory-source-utils.js`
- `web/public/css/style.css`
- `docs/qa/2026-04-04_gemini-adapter-smoke.md`
- `tools/verify_gemini_adapter.js`
