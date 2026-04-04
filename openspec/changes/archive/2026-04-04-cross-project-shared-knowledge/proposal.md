## Why

目前工作台雖然已支援多專案切換，但 `/api/memory` 與 `/memory` 仍只看單一專案。當使用者在不同專案重複記錄「先規劃再落地」「偏好白話表達」這類穩定模式時，系統不會提醒這些內容其實已具備跨專案共用價值，導致 shared layer 仍停留在概念，沒有最小可用落點。

這個 change 以 suggestion-only 的最小安全範圍，先讓系統能跨專案掃描重複主題、在 `docs/shared/` 產出 read-only snapshot，並在既有 `/memory` 頁面直接顯示「共用知識候選」。使用者先看見可整合的 shared knowledge，再決定後續是否人工整理；本輪不自動搬移、不做 writeback。

## What Changes

- 新增可重用的 shared knowledge utility，在既有多專案設定下掃描各專案 `docs/memory/*.md`，找出跨專案重複出現的偏好、模式與工作方式。
- 更新 `/api/memory`，在保留既有 raw content / health / dedup contract 的前提下，額外回傳與目前專案相關的 `sharedKnowledge` summary 與 suggestion groups。
- 更新 `/memory` 頁面，新增 read-only 的「共用知識候選」區塊，顯示參與專案、相似度、建議保留版本與 `docs/shared/` snapshot 提示。
- 建立 `docs/shared/` 目錄與 shared knowledge snapshot generator，將當前跨專案候選整理成 markdown 檔，作為人工後續整合 shared layer 的起點。
- 新增 targeted verify 與 smoke / UI / UX evidence，覆蓋 cross-project grouping、same-category guard、snapshot output 與 `/memory` 靜態契約。

## Capabilities

### New Capabilities
- `cross-project-shared-knowledge`: 為 `/memory` 提供跨專案 shared knowledge suggestion，並建立 `docs/shared/` read-only snapshot。

### Modified Capabilities
- 無。

## Non-goals

- 不自動搬移、合併或刪除任何專案 `docs/memory/*.md` 內容。
- 不新增 `/api/memory/shared/write`、merge action、scheduler 或任何會改寫 shared layer 的 API。
- 不做跨 memory 類別的任意語意推論；第一版只比對相同 `filename` 的跨專案條目。
- 不引入 LLM、embedding、向量搜尋、資料庫或新的 runtime dependency。
- 不處理 template verify blocker，也不把本 change 擴大成 `/shared` 獨立新頁面。

## Impact

- Affected code: `web/server.js`、`web/public/memory.html`、`web/public/js/memory.js`、`web/public/css/style.css`、新的 `web/public/js/shared-knowledge-utils.js`、`tools/generate_shared_knowledge_report.js`、`tools/verify_cross_project_shared_knowledge.js`。
- Affected docs: `docs/shared/`、`docs/planning/v4-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 啟動 V4 Change 4，讓多專案工作台第一次具備 suggestion-only 的 shared knowledge 落點；真正的 shared writeback / scheduler 仍留待後續 change。
