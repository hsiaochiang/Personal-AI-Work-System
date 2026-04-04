## Why

`/decisions` 目前雖然已能集中檢視規則，但衝突偵測仍停留在 V1 的否定詞前綴比對：只有像「不要 X」對上「做 X」這種表面相反句才會被標出，像「保持精簡」對上「需要詳細說明」這類沒有明確否定詞、但使用者實際上會感受到拉扯的規則，系統完全不會提示。

這個 change 以最小安全修改先升級 `/decisions` 的規則衝突能力：建立可重跑的 conflict utility，讓同分類規則可被更完整地比對，並在 UI 顯示衝突列表與原因說明，維持「可能衝突、由人判斷」的治理邊界。

## What Changes

- 新增可重用的 rule conflict utility，集中處理規則正規化、訊號抽取、衝突配對與 explanation 生成。
- 更新 `/decisions` 頁面，讓規則 tab 顯示 conflict overview、受影響規則與每組衝突原因，而不再只有單一「待確認衝突」badge。
- 保留既有 `/api/rules` raw markdown contract，由前端與 targeted verify 共用同一套 utility，避免引入新 API 或 dependency。
- 新增 targeted verify 與 smoke / UI / UX evidence，覆蓋 heuristic、same-category guard 與 `/decisions` explanation wiring。

## Capabilities

### New Capabilities
- `rule-conflict-detection-v2`: 為 `/decisions` 提供超越否定詞前綴的規則衝突偵測與 explanation。

### Modified Capabilities
- `決策與規則檢視 (/decisions)`: 規則列表除了衝突 badge，會額外顯示 conflict overview 與具體衝突原因。

## Non-goals

- 不新增規則編輯、接受建議、自動修正或 writeback action。
- 不做跨分類、跨檔案、跨專案 shared knowledge 級別的規則治理。
- 不引入 LLM、embedding、向量搜尋或新的 runtime dependency。
- 不修改 `docs/memory/*.md` 規則檔案格式，也不要求歷史規則回填額外 metadata。
- 不處理 template verify blocker、scheduler 或 shared knowledge 的後續 change。

## Impact

- Affected code: `web/public/decisions.html`、`web/public/js/decisions.js`、`web/public/css/style.css`，以及新的 rule conflict utility / verify script。
- Affected docs: `docs/planning/v4-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 啟動 V4 Change 3，讓 `/decisions` 從「只會抓否定詞前綴」升級為「可解釋的規則衝突檢視」；其餘 V4 治理能力仍待後續 changes 分別落地。
