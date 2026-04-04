## Why

V4 的第一個使用者可見缺口是：`/memory` 雖然已能顯示來源 badge，但仍無法告訴使用者哪些記憶可能已過期、哪些條目應優先回頭整理。當記憶量持續增加後，缺少健康度訊號會讓使用者必須逐條人工巡檢，與 V4「系統協助維護自己」的目標不符。

這個 change 以最小安全修改先落地 health scoring 基線：由 server 端依記憶新鮮度與來源權重計算分數，`/memory` 顯示健康摘要與每條記憶的健康標記，為後續 dedup、scheduler 與共享知識治理奠定共同評分語言。

## What Changes

- 在 `/api/memory` 回應中加入 server-side 計算的 health summary 與每條記憶的 health metadata，維持既有 `content` 相容。
- 定義記憶健康度模型，先以「新鮮度 + 來源權重」產出 `healthy / review / stale` 三態與可讀理由。
- 更新 `/memory` 頁面，新增健康度概覽區塊與每條記憶的健康 badge / 摘要文字。
- 新增 targeted verify 與 smoke / UI / UX evidence，覆蓋 scoring、API payload 與 `/memory` 顯示邏輯。

## Capabilities

### New Capabilities
- `memory-health-scoring`: 為記憶條目計算健康度分數，並在 `/memory` 顯示健康摘要與條目狀態。

### Modified Capabilities
- None.

## Non-goals

- 不做記憶去重、合併、刪除或自動清理建議執行。
- 不新增規則衝突偵測、跨專案 shared knowledge 或治理排程。
- 不引入外部依賴、向量搜尋、LLM API 或新的儲存層。
- 不回填既有 memory markdown 結構，也不強制要求所有歷史條目補齊日期 / source metadata。

## Impact

- Affected code: `web/server.js`、`web/public/memory.html`、`web/public/js/memory.js`、`web/public/css/style.css`，以及新的 health scoring utility / verify script。
- Affected docs: `docs/planning/v4-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 啟動 V4 Change 1，讓 `/memory` 從「記憶列表」升級為具治理訊號的健康檢視入口；V4 其餘治理能力仍待後續 changes 分別落地。
