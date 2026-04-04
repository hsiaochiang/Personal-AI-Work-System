# ChatGPT API Auto Import UI Review — 2026-04-04

## Review Scope

- 驗收 `chatgpt-api-auto-import` 對 `/settings` 與 `/extract` 的可見 UI 變更
- 檢查重點：
  - 是否新增 `/settings` 導覽入口與最小 API key 設定卡
  - ChatGPT panel 是否在既有版面內補上 API import controls，而非切出第二套頁面
  - `chatgpt-api` source badge 是否能與既有來源 badge 共存

## Findings

- Sidebar 已在所有主要頁面加入 `設定` 入口，使用者不需要手動猜 `/settings` 路徑。
- `/settings` 採單卡片、單欄位、兩個動作按鈕（save / clear）的最小版型，與 repo 現有卡片式 UI 一致，沒有引入新的視覺語彙。
- `/extract` 的 ChatGPT panel 保留原本的 transcript / file import 區塊，再往下補一段 `ChatGPT API 載入` 區塊；資訊階層清楚，且沒有新增 modal。
- `chatgpt-api` source badge 與既有 `ChatGPT` badge 做出明確色彩區隔，能區分「手動 ChatGPT 匯入」與「API 匯入」。

## Decision

- UI review PASS
- 本次 UI 變更維持既有頁面骨架，只在 ChatGPT panel 與 sidebar 增加最小新元素，符合 Smallest Safe Change 原則

## Evidence

- `web/public/settings.html`
- `web/public/extract.html`
- `web/public/js/settings.js`
- `web/public/js/extract.js`
- `web/public/css/style.css`
- `docs/qa/2026-04-04_chatgpt-api-auto-import-smoke.md`
- `tools/verify_chatgpt_api_auto_import.js`
