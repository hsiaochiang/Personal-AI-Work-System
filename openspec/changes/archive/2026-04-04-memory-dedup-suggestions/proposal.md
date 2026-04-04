## Why

`/memory` 在 V4 Change 1 已能顯示健康度摘要與每條記憶的健康標記，但對長期使用者來說，第二個明顯摩擦是重複記錄會持續累積：同一條偏好、任務模式或決策可能在不同日期被再次寫回，導致列表變長、健康摘要失真，使用者仍得人工逐條比對。

這個 change 以最小安全修改先落地 dedup suggestion baseline：由 server 端用輕量 heuristic 偵測同一 memory 檔中的疑似重複條目，在 `/memory` 顯示疑似重複群組，並提供人工確認後才執行的 merge / delete action，且沿用既有 backup 保護。

## What Changes

- 在 `/api/memory` 回應中加入 dedup summary 與疑似重複群組資料，維持既有 `content` / `summary` / `groups` 相容。
- 定義 memory dedup heuristic，以正規化文字 + 關鍵 token / 字元片段重疊偵測同檔案內的近似條目，輸出 suggestion group 與推薦保留項目。
- 更新 `/memory` 頁面，新增「疑似重複建議」區塊，讓使用者可檢視 duplicate groups，並執行 merge 為一條或刪除單一重複條目。
- 新增安全的 memory dedup writeback API，所有 merge / delete action 都必須先 backup，再改寫目標 markdown。
- 新增 targeted verify 與 smoke / UI / UX evidence，覆蓋 heuristic、rewrite 安全邊界、API payload 與 `/memory` 操作流程。

## Capabilities

### New Capabilities
- `memory-dedup-suggestions`: 為同一 memory 檔中的近似條目產生去重建議，並在 `/memory` 提供人工確認後的 merge / delete action。

### Modified Capabilities
- `memory-health-scoring`: dedup suggestion 會重用既有 health metadata，作為推薦保留項目的 tie-breaker。

## Non-goals

- 不做跨檔案、跨專案或跨分類的 dedup merge。
- 不引入 LLM、embedding、向量搜尋或新 dependency。
- 不把 dedup action 擴大成全自動治理；所有改寫都必須由使用者在 UI 觸發。
- 不改寫 `/extract` candidate dedupe 或 V3 multi-tool compare flow。
- 不在這一輪處理規則衝突、shared knowledge 或 scheduler。

## Impact

- Affected code: `web/server.js`、`web/public/memory.html`、`web/public/js/memory.js`、`web/public/css/style.css`，以及新的 memory dedup utility / verify script。
- Affected docs: `docs/planning/v4-brief.md`、`docs/handoff/current-task.md`、`docs/system-manual.md`、`docs/runlog/2026-04-04_README.md`、`docs/qa/`、`docs/uiux/`。
- Roadmap impact: 啟動 V4 Change 2，讓 `/memory` 從「只看到健康度」升級為「可整理疑似重複」的人工治理入口；其餘 V4 自動治理能力仍待後續 changes 分別落地。
